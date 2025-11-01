// Fix: Implement Gemini service functions for mind map generation and error analysis.
import { GoogleGenAI, Type } from '@google/genai';
import type { MindMapData, ErrorReportData, VisualIssueReport } from '../types';

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
            The app's purpose is to be a mobile-friendly wrapper for grokipedia.com, and it scrapes the website directly.
            Provide a concise, technical explanation of the likely root cause and suggest a potential solution or debugging steps.
            Consider CORS issues (TypeError: Failed to fetch), network issues, website HTML structure changes (scraping errors), or React rendering bugs.
            Format the response in Markdown.

            **Error Details:**
            - User-Facing Message: ${report.error}
            - Raw Error/Exception: ${report.rawError || 'N/A'}
            - Failed URL: ${report.targetUrl || 'N/A'}
            - Timestamp: ${report.timestamp}
            - App URL: ${report.url}
            - User Agent: ${report.userAgent}
            
            **React Component Stack (if applicable):**
            \`\`\`
            ${report.componentStack || 'N/A'}
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

export const analyzeVisualIssue = async (report: VisualIssueReport): Promise<string> => {
    try {
        const model = 'gemini-2.5-pro';
        const prompt = `
            Analyze a user-reported visual/layout issue for an article in the Grokipedia mobile experience app.
            The app renders Grokipedia content in a custom "reader mode". It programmatically parses the article HTML,
            separates main text from side content (like infoboxes, images with classes .infobox, .thumb, .tright, .floatright), 
            and displays them in a responsive two-column layout on larger screens (main content left, side content right).
            
            **User Report:**
            - Article Title: "${report.articleTitle}"
            - User's Description of Problem: "${report.userDescription}"

            **Analysis Task:**
            Based on the user's description and the raw article HTML below, provide a technical explanation of the likely root cause of the visual problem.
            Consider common issues with parsing and styling external HTML:
            1. Are there non-standard class names for infoboxes or floated elements that the app's parser might be missing?
            2. Is there unusual nested content or table structure that could break the layout?
            3. Could inline styles in the source HTML be overriding the app's CSS?

            Suggest a specific code or CSS change to fix the issue. Format the response in Markdown.

            **Raw Article HTML Snippet (first 4000 chars):**
            \`\`\`html
            ${report.articleHtml.substring(0, 4000)}
            \`\`\`
        `;
        
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error analyzing visual issue:", error);
        return "An error occurred while trying to analyze the visual issue with Gemini.";
    }
};