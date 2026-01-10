
import { GoogleGenAI, Type } from "@google/genai";

/**
 * 兼容多种环境获取 API KEY
 * 1. Vite: import.meta.env.VITE_API_KEY
 * 2. Node/Bundler: process.env.API_KEY
 */
const getApiKey = (): string => {
  try {
    // @ts-ignore
    return import.meta.env.VITE_API_KEY || (typeof process !== 'undefined' ? process.env.API_KEY : '') || "";
  } catch (e) {
    return "";
  }
};

const apiKey = getApiKey();
// 只有在存在 key 时才初始化，避免抛出异常
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const getSmartDescription = async (toggleName: string, key: string) => {
  if (!ai) {
    return "系统自动生成的实验性功能开关。";
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `基于功能开关名称 "${toggleName}" 和标识符 "${key}"，写一段专业的一句话技术描述。`,
    });
    return response.text?.trim() || "暂无描述";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "系统自动生成的实验性功能开关。";
  }
};

export const suggestRules = async (toggleName: string) => {
  if (!ai) return [];
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `为名为 "${toggleName}" 的功能建议 3 条灰度规则（包含属性和常见值），以 JSON 数组格式返回。`,
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
