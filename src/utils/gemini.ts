
import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI;
let selectedModel: string = "gemini-1.5-flash-latest";

export const initializeGemini = (apiKey: string, model?: string) => {
  genAI = new GoogleGenerativeAI(apiKey);
  if (model) {
    selectedModel = model;
  }
};

export const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result?.toString().split(',')[1]);
    reader.readAsDataURL(file);
  });

  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const getGeminiResponse = async (imageData: any, customPrompt?: string) => {
  if (!genAI) {
    throw new Error("Gemini API not initialized");
  }

  const model = genAI.getGenerativeModel({ model: selectedModel });
  
  const formatGuideline = "\n\nFormat: [Subject] + [Material/texture] + [Lighting/mood] + [Style/medium] + [Camera angle/composition] + [Background/environment].";
  
  const defaultPrompt = `You are a concise visual prompt generator for image generation. Given an image, describe it with precise visual traits, emphasizing subject, materials, lighting, mood, style, and composition. Use minimal words but include technical art details such as camera angle, texture, lighting type, and rendering style. Avoid storytelling or abstract terms.`;
  
  const prompt = (customPrompt || defaultPrompt) + formatGuideline;

  const result = await model.generateContent([prompt, imageData]);
  const response = await result.response;
  return response.text();
};
