import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ImageUpload from "@/components/ImageUpload";
import PromptDisplay from "@/components/PromptDisplay";
import { useToast } from "@/components/ui/use-toast";
import { fileToGenerativePart, getGeminiResponse, initializeGemini } from "@/utils/gemini";
import { Moon, Sun, Copy } from "lucide-react";

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const { toast } = useToast();

  // Dark mode state
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    // Set initial theme from localStorage or default to dark
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" || "dark";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  useEffect(() => {
    const savedApiKey = localStorage.getItem("gemini_api_key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
      initializeGemini(savedApiKey);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleApiKeySubmit = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter your Gemini API key",
        variant: "destructive",
      });
      return;
    }

    try {
      initializeGemini(apiKey);
      localStorage.setItem("gemini_api_key", apiKey);
      toast({
        title: "Success",
        description: "Gemini API key has been saved",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initialize Gemini API",
        variant: "destructive",
      });
    }
  };

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

  const copyPrompt = async () => {
    if (generatedPrompt) {
      try {
        await navigator.clipboard.writeText(generatedPrompt);
        toast({
          title: "Success",
          description: "Prompt copied to clipboard",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy prompt",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold tracking-tight">Image to Prompt Generator</h1>
            <p className="text-muted-foreground">
              Upload an image and get an AI-generated prompt that describes it
            </p>
          </div>
          <Button variant="outline" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Image Upload */}
          <Card className="p-6 space-y-6">
            <h2 className="text-xl font-semibold">Upload Image</h2>
            <ImageUpload
              onImageUpload={handleImageUpload}
              imagePreview={imagePreview}
              isLoading={isLoading}
            />
          </Card>

          {/* Right Column - API Key and Results */}
          <div className="space-y-6">
            <Card className="p-6 space-y-4">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Gemini API Key</h2>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="Enter your Gemini API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <Button onClick={handleApiKeySubmit}>Save Key</Button>
                </div>
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Get your Gemini API key here
                </a>
              </div>
            </Card>

            <Card className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Generated Result</h2>
                {generatedPrompt && (
                  <Button variant="outline" size="icon" onClick={copyPrompt}>
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <PromptDisplay
                prompt={generatedPrompt}
                isLoading={isLoading}
                onGenerate={generatePrompt}
                hasImage={!!selectedImage}
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;