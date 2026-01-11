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

// Check if *any* valid key exists for the Home screen check
export const isAnyModelConfigured = () => {
    return !!getKey('VITE_API_KEY') || 
           !!getKey('VITE_OPENAI_API_KEY') || 
           !!getKey('VITE_OPENROUTER_API_KEY') || 
           !!getKey('VITE_PERPLEXITY_API_KEY');
};

export const getFirstAvailableProvider = () => {
    if (getKey('VITE_API_KEY')) return 'gemini';
    if (getKey('VITE_OPENAI_API_KEY')) return 'openai';
    if (getKey('VITE_OPENROUTER_API_KEY')) return 'openrouter';
    if (getKey('VITE_PERPLEXITY_API_KEY')) return 'perplexity';
    return 'gemini'; // Default fallback
};

export const hasKeyForProvider = (providerId) => {
    switch(providerId) {
        case 'gemini': return !!getKey('VITE_API_KEY');
        case 'openai': return !!getKey('VITE_OPENAI_API_KEY');
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
    
    // Fallback: If peeling failed completely (extremely rare for valid JSON output), throw original error logic
    // or try one last simple trim parse just in case
    try {
        return JSON.parse(cleanStr);
    } catch (e) {
        console.error("JSON Parse Error after peeling. Original String:", str);
        throw new Error(`Failed to parse AI response: ${e.message}`);
    }
};

// --- Generic OpenAI Compatible Call (For OpenAI, OpenRouter, Perplexity) ---
const callOpenAICompatible = async (providerId, systemPrompt, userContent, isImage) => {
    const providerConfig = AI_PROVIDERS.find(p => p.id === providerId);
    if (!providerConfig) throw new Error("Invalid Provider");

    let apiKey, baseUrl, model;
    
    switch(providerId) {
        case 'openai':
            apiKey = getKey('VITE_OPENAI_API_KEY');
            baseUrl = 'https://api.openai.com/v1/chat/completions';
            model = 'gpt-4o';
            break;
        case 'openrouter':
            apiKey = getKey('VITE_OPENROUTER_API_KEY');
            baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
            model = 'google/gemini-2.0-flash-001'; 
            break;
        case 'perplexity':
            apiKey = getKey('VITE_PERPLEXITY_API_KEY');
            baseUrl = 'https://api.perplexity.ai/chat/completions';
            model = 'sonar'; 
            if (isImage) throw new Error("Perplexity does not support image analysis. Please choose Gemini or OpenAI.");
            break;
        default:
            throw new Error("Provider not implemented");
    }

    if (!apiKey) throw new Error(`Missing API Key for ${providerConfig.name}. Please configure it in Settings.`);

    // Construct Messages
    const messages = [{ role: "system", content: systemPrompt }];

    if (isImage && providerId !== 'perplexity') {
        messages.push({
            role: "user",
            content: [
                { type: "text", text: "Analyze this schedule image." },
                { type: "image_url", image_url: { url: userContent } }
            ]
        });
    } else {
        messages.push({ role: "user", content: userContent });
    }

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
            temperature: 0.2
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
export const analyzeSchedule = async (inputData, isImage, standardId, language, providerId = 'gemini') => {
    
    const standardObj = PLANNING_STANDARDS.find(s => s.id === standardId);
    const standardName = standardObj ? standardObj.name.en : "General Project Management Best Practices";

    // Updated Instruction: Mandate Dual Language Output & Specific Standard & Correspondence Direction
    const systemInstruction = `You are a Seasoned Expert in Project Management and Scheduling Quality Assurance (PMC).
    Your task is to analyze schedule data and generate a structured dataset for a PowerBI-style dashboard.

    ### CRITICAL INSTRUCTION: DUAL LANGUAGE OUTPUT
    For all narrative text fields (including titles/descriptions in arrays), you MUST return an object containing BOTH English ('en') and Arabic ('ar') translations.
    
    Example: 
    "summary": { 
        "en": "The schedule shows delays...", 
        "ar": "يظهر الجدول الزمني تأخيرات..." 
    }

    Keep technical keys (like 'projectOverview', 'status') and enum values ('PASS', 'FAIL', 'High', 'Medium', 'Low') in English.

    ### Objectives:
    1. **Overview Stats**: Extract or estimate total activities, critical activities, duration, and data dates.
    2. **Compliance Check**: Evaluate the schedule specifically against **${standardName}**. 
       - If ${standardName} is 'DCMA 14-Point', perform the standard 14 point check.
       - If it is 'Saudi Aramco' or 'FIDIC', highlight clauses or requirements specific to those standards.
       - POPULATE 'dcmaAnalysis' ARRAY WITH SPECIFIC CHECKS RELEVANT TO ${standardName}.
    3. **Activity Data**: Extract specific activities mentioned. If specific rows are not provided, GENERATE 10-15 REPRESENTATIVE ACTIVITIES based on the findings.

    ### Specific Report Sections:
    - **Technical Findings**: List 3-5 specific technical observations (e.g., "Open Ends / Missing Logic", "High Duration").
    - **Non-Compliance Issues**: List 3-5 critical breaches of the standard (e.g., "Breach of Logic Integrity", "Use of Hard Constraints").
    - **Risk Assessment**: A detailed assessment including a risk level (High/Medium/Low) and a descriptive justification.
    - **Strategic Recommendations**: 3-5 actionable steps for the contractor to fix the schedule.

    ### Contractor Correspondence:
    - **contractorNote**: A formal letter from PMC to Contractor instructing rectification.

    ### Output Format:
    Return ONLY a raw JSON object (no markdown) with this EXACT structure:
    {
        "projectOverview": {
            "totalActivities": 54,
            "criticalActivities": 23,
            "duration": 144,
            "startDate": "DD/MM/YYYY",
            "finishDate": "DD/MM/YYYY",
            "dataDate": "DD/MM/YYYY"
        },
        "dcmaAnalysis": [
            { 
                "metric": { "en": "Missing Logic", "ar": "منطق مفقود" }, 
                "description": { "en": "Activities missing predecessors or successors", "ar": "أنشطة تفتقد لعلاقات سابقة أو لاحقة" },
                "value": 0.00, 
                "target": 5, 
                "operator": "<",
                "found": 0,
                "total": 150,
                "status": "PASS" 
            }
        ],
        "technicalFindings": [
            { "title": { "en": "...", "ar": "..." }, "description": { "en": "...", "ar": "..." } }
        ],
        "nonComplianceIssues": [
            { "title": { "en": "...", "ar": "..." }, "description": { "en": "...", "ar": "..." } }
        ],
        "riskAssessment": {
            "level": "High",
            "description": { "en": "...", "ar": "..." }
        },
        "activities": [
             { "id": "A1010", "name": "Excavation Works", "duration": 10, "start": "...", "finish": "...", "totalFloat": 0, "critical": true }
        ],
        "summary": { "en": "...", "ar": "..." },
        "recommendations": [ 
            { "en": "...", "ar": "..." } 
        ],
        "contractorNote": { "en": "...", "ar": "..." }
    }`;

    try {
        if (providerId === 'gemini') {
            const currentKey = getKey('VITE_API_KEY');
            if (!currentKey) throw new Error("Gemini API Key missing. Please configure it in Settings.");
            
            // Create client on demand to ensure we use the latest key from LocalStorage
            const client = new GoogleGenAI({ apiKey: currentKey });
            
            let parts = [];
            if (isImage) {
                const base64Data = inputData.includes('base64,') ? inputData.split('base64,')[1] : inputData;
                parts = [
                    { inlineData: { mimeType: 'image/png', data: base64Data } },
                    { text: "Perform a deep forensic analysis of this schedule screenshot. Populate all report sections strictly." }
                ];
            } else {
                parts = [{ text: `Here is the schedule data/narrative for analysis:\n\n${inputData}` }];
            }

            const result = await fetchWithRetry(() => client.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts },
                config: { 
                    systemInstruction,
                    responseMimeType: "application/json" 
                }
            }));

            if (!result.text) throw new Error("Empty response from AI model.");
            return cleanAndParseJSON(result.text);

        } else {
            return await callOpenAICompatible(providerId, systemInstruction, inputData, isImage);
        }

    } catch (e) {
        if (e.message === "DAILY_QUOTA_EXCEEDED") throw e;
        console.error(`${providerId} Analysis Failed:`, e);
        throw new Error(e.message || "Failed to parse analysis results. Please try again.");
    }
};