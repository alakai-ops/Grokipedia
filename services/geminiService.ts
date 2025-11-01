// Fix: Implement Gemini service functions for mind map generation and error analysis.
import { GoogleGenAI, Type } from '@google/genai';
import type { MindMapData, ErrorReportData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateMindMap = async (topic: string): Promise<MindMapData> => {
  try {
    const model = 'gemini-2.5-flash';
    
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            foundational: {
                type: Type.ARRAY,
                description: '3-5 core concepts or prerequisites to understand the main topic. These should be foundational building blocks.',
                items: { type: Type.STRING }
            },
            deeperDive: {
                type: Type.ARRAY,
                description: '3-5 sub-topics or specific areas within the main topic for more in-depth exploration.',
                items: { type: Type.STRING }
            },
            relatedBranches: {
                type: Type.ARRAY,
                description: '3-5 related but distinct topics or fields that connect to the main topic. These are lateral connections.',
                items: { type: Type.STRING }
            },
        },
        required: ['foundational', 'deeperDive', 'relatedBranches']
    };

    const response = await ai.models.generateContent({
        model: model,
        contents: `Generate a conceptual mind map for the Grokipedia topic: "${topic}". Structure the output as a JSON object with three categories: "foundational" (core concepts to understand the topic), "deeperDive" (sub-topics for in-depth exploration), and "relatedBranches" (connected fields or topics). Provide 3-5 items for each category. The items should be concise and suitable for further searches on Grokipedia.`,
        config: {
            responseMimeType: 'application/json',
            responseSchema,
        }
    });
    
    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString) as MindMapData;
    return parsed;

  } catch (error) {
    console.error("Error generating mind map:", error);
    throw new Error("Failed to generate mind map. Please try again.");
  }
};

export const analyzeError = async (report: ErrorReportData): Promise<string> => {
    try {
        const model = 'gemini-2.5-pro'; // Use pro for complex analysis
        const prompt = `
            Analyze the following frontend application error report from Grokipedia mobile experience app.
            The app's purpose is to be a mobile-friendly wrapper for grokipedia.com.
            Provide a concise, technical explanation of the likely root cause and suggest a potential solution or debugging steps.
            Format the response in Markdown.

            **Error Details:**
            - Message: ${report.error}
            - Timestamp: ${report.timestamp}
            - URL: ${report.url}
            - User Agent: ${report.userAgent}
            
            **Component Stack:**
            \`\`\`
            ${report.componentStack}
            \`\`\`
        `;
        
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error analyzing error report:", error);
        return "An error occurred while trying to analyze the report with Gemini.";
    }
};
