
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
  
  const defaultPrompt = `You are a visual prompt generator for AI image generation. Analyze images and output precise, technical descriptions focusing on:
Core Elements: Subject, style, materials, lighting, composition, colors, rendering technique
Format: Comma-separated descriptive phrases using technical art vocabulary. No storytelling or emotions.
Structure: "[Subject], [style], [materials/textures], [lighting], [colors], [composition/angle], [rendering quality]"
Focus on reproducible visual elements that enable accurate image recreation.`;
  
  const prompt = customPrompt || defaultPrompt;

  const result = await model.generateContent([prompt, imageData]);
  const response = await result.response;
  return response.text();
};
