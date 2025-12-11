import { GoogleGenAI } from "@google/genai";
import { PLANNING_STANDARDS } from "../constants.js";

const getApiKey = () => {
    // Check standard API_KEY or VITE_API_KEY
    const key = process.env.API_KEY || process.env.VITE_API_KEY;
    // Ensure it's not a placeholder
    if (key && !key.startsWith('__VITE') && !key.startsWith('YOUR_')) {
        return key;
    }
    return null;
};

const apiKey = getApiKey();
export const isAnyModelConfigured = () => !!apiKey;

// Initialize Gemini Client
const geminiClient = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Use 'gemini-2.5-flash' for both text and multimodal tasks as it is cost-effective and capable.
const modelId = 'gemini-2.5-flash';

/**
 * Analyzes project schedule data (text or image) against specific standards.
 * @param {string} inputData - The text content or base64 image string.
 * @param {boolean} isImage - Flag indicating if inputData is an image.
 * @param {string} standardId - The ID of the planning standard (e.g., 'dcma', 'aramco').
 * @param {string} language - 'en' or 'ar'.
 */
export const analyzeSchedule = async (inputData, isImage, standardId, language) => {
    if (!geminiClient) throw new Error("Gemini client not initialized.");

    const standardObj = PLANNING_STANDARDS.find(s => s.id === standardId);
    const standardName = standardObj ? standardObj.name.en : "General Best Practices";
    
    const langInstruction = language === 'ar' 
        ? "You must respond in Arabic (Professional Engineering/Contractual Arabic). The output JSON keys must remain in English, but the values (summary, findings, etc.) should be in Arabic." 
        : "You must respond in Professional Engineering English.";

    const systemInstruction = `You are a Seasoned Expert in Project Management and Scheduling Quality Assurance, working for a top-tier Project Management Consultancy (PMC).
    Your task is to review project schedules with extreme scrutiny against '${standardName}' and general industry best practices (CPM, PMI).

    ${langInstruction}

    ### Objectives:
    1. **Comprehensive Schedule Analysis**: deeply evaluate the provided schedule data (text, log, or visual Gantt) for:
       - **Logic Integrity**: Open ends, lags/leads abuse, circular logic.
       - **Timeline Accuracy**: Unrealistic durations, constraints usage (Hard vs Soft), float analysis (High Float/Negative Float).
       - **Completeness**: Missing baselines, resource loading issues (if visible), WBS structure.
    
    2. **Non-Compliance Detection**: Explicitly flag any deviation from '${standardName}'. If the standard is DCMA 14-Point, specifically look for those 14 metrics.
    
    3. **Decision Support**: Provide a "Risk Assessment" level (Low/Medium/High) based on the overall health of the schedule.
    
    4. **Professional Output**:
       - Generate **Strategic Recommendations** to improve the schedule health.
       - Draft a **Formal Contractor Note/Letter** that is stern, contractual, and actionable, rejecting the submission if major flaws exist.

    ### Output Format:
    Return ONLY a raw JSON object (no markdown) with this structure:
    {
        "summary": "Executive summary of the schedule quality and major status.",
        "riskLevel": "High" | "Medium" | "Low",
        "riskAssessment": "A brief paragraph justifying the risk level based on float, logic, and critical path health.",
        "findings": ["Specific technical observation 1", "Specific technical observation 2"],
        "nonCompliance": ["Deviation from standard 1", "Deviation from standard 2"],
        "recommendations": ["Actionable advice 1", "Actionable advice 2"],
        "contractorNote": "The full text of the formal letter to the contractor."
    }`;

    let parts = [];
    
    if (isImage) {
        // Remove data URL prefix if present for the API call
        const base64Data = inputData.includes('base64,') 
            ? inputData.split('base64,')[1] 
            : inputData;

        parts = [
            {
                inlineData: {
                    mimeType: 'image/png', // Assuming PNG or compatible image
                    data: base64Data
                }
            },
            {
                text: "Perform a deep forensic analysis of this schedule screenshot/chart."
            }
        ];
    } else {
        parts = [
            {
                text: `Here is the schedule data/narrative for analysis:\n\n${inputData}`
            }
        ];
    }

    const result = await geminiClient.models.generateContent({
        model: modelId,
        contents: { parts },
        config: { 
            systemInstruction,
            responseMimeType: "application/json" 
        }
    });

    try {
        return JSON.parse(result.text);
    } catch (e) {
        console.error("Failed to parse Gemini response", e);
        throw new Error("Failed to parse analysis results.");
    }
};