
import { GoogleGenAI } from "@google/genai";
import { PLANNING_STANDARDS, AI_PROVIDERS } from "../constants.js";

// Helper to get specific keys
const getKey = (keyName) => {
    // 1. Check Local Storage (User Input - Highest Priority)
    const localKey = typeof localStorage !== 'undefined' ? localStorage.getItem(keyName) : null;
    if (localKey) return localKey;

    // 2. Check Runtime Environment Variables (window.process.env from env.js)
    const runtimeEnv = (typeof window !== 'undefined' && window.process?.env) ? window.process.env : {};
    const runtimeKey = runtimeEnv[keyName];
    if (runtimeKey && !runtimeKey.startsWith('__VITE') && !runtimeKey.startsWith('YOUR_')) {
        return runtimeKey;
    }

    // 3. Check Build-time Environment Variables (import.meta.env for Vite/Coolify builds)
    try {
        if (typeof import.meta !== 'undefined' && import.meta.env) {
            const buildKey = import.meta.env[keyName];
            if (buildKey && !buildKey.startsWith('__VITE') && !buildKey.startsWith('YOUR_')) {
                return buildKey;
            }
        }
    } catch (e) {
        // Ignore errors if import.meta is not supported in the environment
    }

    return null;
};

// Helper to get configured model
const getModel = (providerId) => {
    const provider = AI_PROVIDERS.find(p => p.id === providerId);
    if (!provider) return 'gemini-3-flash-preview'; // Fallback
    
    let keyName = '';
    switch(providerId) {
        case 'gemini': keyName = 'VITE_GEMINI_MODEL'; break;
        case 'openai': keyName = 'VITE_OPENAI_MODEL'; break;
        case 'groq': keyName = 'VITE_GROQ_MODEL'; break;
        case 'openrouter': keyName = 'VITE_OPENROUTER_MODEL'; break;
        case 'perplexity': keyName = 'VITE_PERPLEXITY_MODEL'; break;
    }
    
    const configuredModel = getKey(keyName);
    return configuredModel || provider.defaultModel;
};

// Check if *any* valid key exists for the Home screen check
export const isAnyModelConfigured = () => {
    return !!getKey('VITE_API_KEY') || 
           !!getKey('VITE_OPENAI_API_KEY') || 
           !!getKey('VITE_OPENROUTER_API_KEY') || 
           !!getKey('VITE_PERPLEXITY_API_KEY') ||
           !!getKey('VITE_GROQ_API_KEY');
};

export const getFirstAvailableProvider = () => {
    if (getKey('VITE_API_KEY')) return 'gemini';
    if (getKey('VITE_OPENAI_API_KEY')) return 'openai';
    if (getKey('VITE_GROQ_API_KEY')) return 'groq';
    if (getKey('VITE_OPENROUTER_API_KEY')) return 'openrouter';
    if (getKey('VITE_PERPLEXITY_API_KEY')) return 'perplexity';
    return 'gemini'; // Default fallback
};

export const hasKeyForProvider = (providerId) => {
    switch(providerId) {
        case 'gemini': return !!getKey('VITE_API_KEY');
        case 'openai': return !!getKey('VITE_OPENAI_API_KEY');
        case 'groq': return !!getKey('VITE_GROQ_API_KEY');
        case 'openrouter': return !!getKey('VITE_OPENROUTER_API_KEY');
        case 'perplexity': return !!getKey('VITE_PERPLEXITY_API_KEY');
        default: return false;
    }
};

// Retry helper
const fetchWithRetry = async (apiCall, retries = 3, delay = 1000) => {
    try {
        return await apiCall();
    } catch (error) {
        let statusCode = error.status || error.code || error.response?.status;
        const msg = error.message || JSON.stringify(error);
        
        if (!statusCode) {
            if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) statusCode = 429;
            if (msg.includes('503')) statusCode = 503;
        }

        const isDailyQuota = msg.includes('PerDay') || msg.includes('Quota exceeded') || msg.includes('limit: 20');
        if (statusCode === 429 && isDailyQuota) {
             throw new Error("DAILY_QUOTA_EXCEEDED");
        }

        if (retries > 0 && (statusCode === 503 || statusCode === 429)) {
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry(apiCall, retries - 1, delay * 2);
        }
        throw error;
    }
};

// Helper: robustly clean and parse JSON from AI response using peeling strategy
const cleanAndParseJSON = (str) => {
    if (!str) return null;
    let cleanStr = str;
    
    // 1. Extract from markdown code block if present (matches ```json ... ``` or ``` ... ```)
    const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)```/;
    const match = codeBlockRegex.exec(cleanStr);
    if (match) {
        cleanStr = match[1];
    }
    
    // 2. Locate first '{'
    const firstOpen = cleanStr.indexOf('{');
    if (firstOpen === -1) {
        console.error("No JSON object start found in:", str);
        throw new Error("Invalid response format: No JSON object found.");
    }
    
    // Strip preamble
    cleanStr = cleanStr.substring(firstOpen);

    // 3. Recursive peeling from the end
    // Find the last '}', try to parse. If fail (due to trailing garbage), find previous '}' and try again.
    let lastCloseIndex = cleanStr.lastIndexOf('}');
    
    while (lastCloseIndex !== -1) {
        const attempt = cleanStr.substring(0, lastCloseIndex + 1);
        try {
            return JSON.parse(attempt);
        } catch (e) {
            // Parsing failed, likely due to extra chars inside the substring or we captured a } from trailing text.
            // Move search backwards
            lastCloseIndex = cleanStr.lastIndexOf('}', lastCloseIndex - 1);
        }
    }
    
    // Fallback
    try {
        return JSON.parse(cleanStr);
    } catch (e) {
        console.error("JSON Parse Error after peeling. Original String:", str);
        throw new Error(`Failed to parse AI response: ${e.message}`);
    }
};

// --- Generic OpenAI Compatible Call ---
const callOpenAICompatible = async (providerId, systemPrompt, inputItems, hasImages) => {
    const providerConfig = AI_PROVIDERS.find(p => p.id === providerId);
    if (!providerConfig) throw new Error("Invalid Provider");

    let apiKey, baseUrl, model;
    
    model = getModel(providerId);
    
    switch(providerId) {
        case 'openai':
            apiKey = getKey('VITE_OPENAI_API_KEY');
            baseUrl = 'https://api.openai.com/v1/chat/completions';
            break;
        case 'groq':
            apiKey = getKey('VITE_GROQ_API_KEY');
            baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
            if (hasImages && !model.includes('vision')) {
                 model = 'llama-3.2-90b-vision-preview';
            }
            break;
        case 'openrouter':
            apiKey = getKey('VITE_OPENROUTER_API_KEY');
            baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
            break;
        case 'perplexity':
            apiKey = getKey('VITE_PERPLEXITY_API_KEY');
            baseUrl = 'https://api.perplexity.ai/chat/completions';
            if (hasImages) throw new Error("Perplexity does not support image analysis.");
            break;
        default:
            throw new Error("Provider not implemented");
    }

    if (!apiKey) throw new Error(`Missing API Key for ${providerConfig.name}.`);

    const messages = [{ role: "system", content: systemPrompt }];
    const userMessageContent = [];

    inputItems.forEach(item => {
        if (item.type === 'image') {
            userMessageContent.push({ type: "image_url", image_url: { url: item.data } });
        } else {
            userMessageContent.push({ type: "text", text: item.data });
        }
    });
    
    messages.push({ role: "user", content: userMessageContent });

    const response = await fetchWithRetry(() => fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            ...(providerId === 'openrouter' ? { 'HTTP-Referer': window.location.origin } : {})
        },
        body: JSON.stringify({
            model: model,
            messages: messages,
            response_format: { type: "json_object" }, 
            temperature: 0.1
        })
    }));

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`API Error ${response.status}: ${err}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty response from AI");
    
    return cleanAndParseJSON(content);
};

// --- Main Analysis Function ---
export const analyzeSchedule = async (inputItems, hasImages, standardId, language, providerId = 'gemini') => {
    
    const standardObj = PLANNING_STANDARDS.find(s => s.id === standardId);
    const standardName = standardObj ? standardObj.name.en : "General Project Management Best Practices";

    const dcmaInstruction = `
    If evaluating against 'DCMA 14-Point Assessment', you MUST populate the 'dcmaAnalysis' array with exactly these 14 metrics:
    1. Logic (Missing Logic) - Target < 5%
    2. Leads (Negative Lags) - Target 0%
    3. Lags (Positive Lags) - Target < 5%
    4. Relationship Types (FS should be > 90%)
    5. Hard Constraints - Target < 5%
    6. High Float (> 44 days) - Target < 5%
    7. Negative Float - Target 0%
    8. High Duration (> 44 days) - Target < 5%
    9. Invalid Dates (Forecasts in past/Actuals in future) - Target 0%
    10. Resources (Missing resources) - Target 0%
    11. Missed Tasks (Finished late) - Target < 5%
    12. Critical Path Test (Pass/Fail)
    13. CPLI (Critical Path Length Index) - Target > 1.0
    14. BEI (Baseline Execution Index) - Target > 1.0
    `;

    const systemInstruction = `You are a Seasoned Expert in Project Management and Scheduling Quality Assurance (PMC).
    Your task is to analyze schedule data (could be XER contents, CSV, Text, or one or more images of Gantt charts) and generate a structured dataset for a PowerBI-style dashboard.

    ### CRITICAL INSTRUCTION: DUAL LANGUAGE OUTPUT
    For all narrative text fields, you MUST return an object containing BOTH English ('en') and Arabic ('ar') translations.
    
    Example: 
    "summary": { "en": "...", "ar": "..." }

    ### Objectives:
    1. **Overview Stats**: Extract or estimate total activities, critical activities, duration, and data dates.
    2. **Compliance Check**: Evaluate specifically against **${standardName}**. 
       ${standardId === 'dcma' ? dcmaInstruction : `- If it is 'Saudi Aramco' or 'FIDIC', highlight relevant requirements.`}
    3. **Activity Data**: Extract specific activities mentioned or generate 10-15 representative ones based on analysis.

    ### Contractor Correspondence:
    - **contractorNote**: A formal letter from PMC to Contractor instructing rectification based on findings.

    ### Output Format:
    Return ONLY raw JSON:
    {
        "projectOverview": {
            "totalActivities": 0,
            "criticalActivities": 0,
            "duration": 0,
            "startDate": "DD/MM/YYYY",
            "finishDate": "DD/MM/YYYY",
            "dataDate": "DD/MM/YYYY"
        },
        "dcmaAnalysis": [
            { 
                "metric": { "en": "...", "ar": "..." }, 
                "description": { "en": "...", "ar": "..." },
                "value": 0, "target": 0, "operator": "<", "found": 0, "total": 0, "status": "PASS" 
            }
        ],
        "technicalFindings": [
            { "title": { "en": "...", "ar": "..." }, "description": { "en": "...", "ar": "..." } }
        ],
        "nonComplianceIssues": [
            { "title": { "en": "...", "ar": "..." }, "description": { "en": "...", "ar": "..." } }
        ],
        "riskAssessment": { "level": "High", "description": { "en": "...", "ar": "..." } },
        "activities": [
             { "id": "A1010", "name": "...", "duration": 0, "start": "...", "finish": "...", "totalFloat": 0, "critical": true }
        ],
        "summary": { "en": "...", "ar": "..." },
        "recommendations": [ { "en": "...", "ar": "..." } ],
        "contractorNote": { "en": "...", "ar": "..." }
    }`;

    try {
        if (providerId === 'gemini') {
            const currentKey = getKey('VITE_API_KEY');
            if (!currentKey) throw new Error("Gemini API Key missing.");
            const client = new GoogleGenAI({ apiKey: currentKey });
            const selectedModel = getModel('gemini');

            const parts = inputItems.map(item => {
                if (item.type === 'image') {
                    const base64Data = item.data.includes('base64,') ? item.data.split('base64,')[1] : item.data;
                    return { inlineData: { mimeType: item.mimeType || 'image/png', data: base64Data } };
                }
                return { text: item.data };
            });

            parts.push({ text: "Perform a forensic analysis. Populate all report sections strictly based on provided inputs." });

            const result = await fetchWithRetry(() => client.models.generateContent({
                model: selectedModel,
                contents: { parts },
                config: { 
                    systemInstruction,
                    responseMimeType: "application/json" 
                }
            }));

            if (!result.text) throw new Error("Empty response from AI model.");
            return cleanAndParseJSON(result.text);

        } else {
            return await callOpenAICompatible(providerId, systemInstruction, inputItems, hasImages);
        }

    } catch (e) {
        if (e.message === "DAILY_QUOTA_EXCEEDED") throw e;
        throw new Error(e.message || "Failed to parse analysis results.");
    }
};
