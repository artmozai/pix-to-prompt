import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import ImageUpload from "@/components/ImageUpload";
import PromptDisplay from "@/components/PromptDisplay";
import { useToast } from "@/components/ui/use-toast";
import { fileToGenerativePart, getGeminiResponse, initializeGemini } from "@/utils/gemini";
import GeminiKeyForm from "@/components/GeminiKeyForm";

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedApiKey = localStorage.getItem("gemini_api_key");
    if (savedApiKey) {
      initializeGemini(savedApiKey);
      setHasApiKey(true);
    }
  }, []);

  const handleImageUpload = (file: File) => {
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const generatePrompt = async () => {
    if (!selectedImage) {
      toast({
        title: "No image selected",
        description: "Please upload an image first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const imageData = await fileToGenerativePart(selectedImage);
      const prompt = await getGeminiResponse(imageData);
      setGeneratedPrompt(prompt);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Image to Prompt Generator</h1>
            <p className="text-muted-foreground">
              First, please enter your Gemini API key to continue
            </p>
          </div>
          <GeminiKeyForm onKeySubmit={() => setHasApiKey(true)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Image to Prompt Generator</h1>
          <p className="text-muted-foreground">
            Upload an image and get an AI-generated prompt that describes it
          </p>
        </div>

        <Card className="p-6 space-y-6">
          <ImageUpload
            onImageUpload={handleImageUpload}
            imagePreview={imagePreview}
            isLoading={isLoading}
          />

          <PromptDisplay
            prompt={generatedPrompt}
            isLoading={isLoading}
            onGenerate={generatePrompt}
            hasImage={!!selectedImage}
          />
        </Card>
      </div>
    </div>
  );
};

export default Index;