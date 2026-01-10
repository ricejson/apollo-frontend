
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSmartDescription = async (toggleName: string, key: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on the feature toggle name "${toggleName}" and key "${key}", write a professional one-sentence description for a technical release system.`,
    });
    return response.text?.trim() || "No description generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Experimental feature toggle for system optimization.";
  }
};

export const suggestRules = async (toggleName: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Suggest 3 targeting rules (attribute and common values) for a feature named "${toggleName}" in a JSON list format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              attribute: { type: Type.STRING },
              value: { type: Type.STRING },
              reason: { type: Type.STRING }
            },
            required: ["attribute", "value"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return [];
  }
};
