
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

export const getGeminiResponse = async (imageData: any) => {
  if (!genAI) {
    throw new Error("Gemini API not initialized");
  }

  const model = genAI.getGenerativeModel({ model: selectedModel });
  
  const prompt = `You are a concise visual prompt generator. Given an image, describe it with maximum visual accuracy and minimal words. Focus on concrete visual traits such as subject, colors, pose, style, and background. Avoid long explanations, storytelling, or creative elaboration. Your goal is to generate a clear, efficient prompt that could be used by an image generation model to recreate the original image as closely as possible. Write in one or two concise sentences only.

Format guideline: [Style] + [Subject] + [Key visual features] + [Pose/orientation] + [Background/environment].`;

  const result = await model.generateContent([prompt, imageData]);
  const response = await result.response;
  return response.text();
};
