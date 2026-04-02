import { GoogleGenAI, Type } from '@google/genai';

// Initialize the Gemini API client
// The API key is automatically injected into process.env.GEMINI_API_KEY by AI Studio
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function breakdownLearningTopic(topic: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Break down the following learning topic into a structured, step-by-step learning plan. Include prerequisites, core concepts, and practical exercises. Topic: ${topic}`,
      config: {
        tools: [{ googleSearch: {} }], // Use Google Search grounding for up-to-date info
        systemInstruction: "You are an expert educator and productivity coach. Create actionable, clear, and well-structured learning plans using Markdown. Keep it concise but comprehensive.",
      }
    });
    
    return response.text || "No content generated.";
  } catch (error) {
    console.error("Error generating learning breakdown:", error);
    throw new Error("Failed to generate learning breakdown. Please try again.");
  }
}

export async function generateMilestones(topic: string): Promise<{title: string, description: string}[]> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Break down the following learning topic into a structured, step-by-step learning plan with 4-6 milestones. Topic: ${topic}`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are an expert educator. Break down the topic into logical, actionable milestones.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "The title of the milestone" },
              description: { type: Type.STRING, description: "A brief description of what to learn or do" }
            },
            required: ["title", "description"]
          }
        }
      }
    });
    
    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating milestones:", error);
    throw new Error("Failed to generate milestones. Please try again.");
  }
}
