
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

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
  
  // JSON structured prompt
  const promptJson = {
    role: "prompt_generator",
    task: "image_description",
    instructions: "Generate a detailed but concise prompt that would allow an image generator to create an identical image to the one provided.",
    output_format: "json"
  };
  
  const promptText = JSON.stringify(promptJson);
  
  // Set the system prompt to request JSON response
  const generationConfig = {
    temperature: 0.4,
    topK: 32,
    topP: 0.95,
    responseFormat: { type: "json" }
  };

  try {
    const result = await model.generateContent(
      [promptText, imageData],
      { generationConfig }
    );
    
    const response = await result.response;
    const responseText = response.text();
    
    // Parse JSON response if possible
    try {
      const jsonResponse = JSON.parse(responseText);
      return jsonResponse;
    } catch (e) {
      // If parsing fails, return the raw text
      console.log("Failed to parse JSON response, returning raw text");
      return { 
        prompt: responseText,
        format: "text"
      };
    }
  } catch (error) {
    console.error("Error generating content:", error);
    return {
      error: true,
      message: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
};
