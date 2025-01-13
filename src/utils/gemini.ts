import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI;

export const initializeGemini = (apiKey: string) => {
  genAI = new GoogleGenerativeAI(apiKey);
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

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-vision" });
  
  const prompt = `You are a prompt generator. Write a prompt such that an image generator model would create a most identical picture as the image given to you. Be detailed but concise.`;

  const result = await model.generateContent([prompt, imageData]);
  const response = await result.response;
  return response.text();
};