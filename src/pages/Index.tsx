
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/ImageUpload";
import { useToast } from "@/components/ui/use-toast";
import { fileToGenerativePart, getGeminiResponse, initializeGemini } from "@/utils/gemini";
import { Moon, Sun, Copy, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-1.5-flash-latest");
  const { toast } = useToast();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customPrompt, setCustomPrompt] = useState(`You are a visual prompt generator for AI image generation. Analyze images and output precise, technical descriptions focusing on:
Core Elements: Subject, style, materials, lighting, composition, colors, rendering technique
Format: Comma-separated descriptive phrases using technical art vocabulary. No storytelling or emotions.
Structure: "[Subject], [style], [materials/textures], [lighting], [colors], [composition/angle], [rendering quality]"
Focus on reproducible visual elements that enable accurate image recreation.`);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" || "dark";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  useEffect(() => {
    const savedApiKey = localStorage.getItem("gemini_api_key");
    const savedModel = localStorage.getItem("gemini_model") || "gemini-1.5-flash-latest";
    
    setSelectedModel(savedModel);
    
    if (savedApiKey) {
      setApiKey(savedApiKey);
      initializeGemini(savedApiKey, savedModel);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.open(`https://artmozai.blogspot.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newApiKey = e.target.value;
    setApiKey(newApiKey);
    
    // Auto-save when pasting or typing a complete key
    if (newApiKey.length > 20) { // Assuming API keys are long
      try {
        localStorage.setItem("gemini_api_key", newApiKey);
        initializeGemini(newApiKey, selectedModel);
        toast({
          title: "Success",
          description: "Gemini API key has been saved",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save API key",
          variant: "destructive",
        });
      }
    }
  };

  const handleModelChange = (value: string) => {
    setSelectedModel(value);
    localStorage.setItem("gemini_model", value);
    
    if (apiKey) {
      try {
        initializeGemini(apiKey, value);
        toast({
          title: "Success",
          description: `Model changed to ${value}`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update model",
          variant: "destructive",
        });
      }
    }
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
      initializeGemini(apiKey, selectedModel);
      localStorage.setItem("gemini_api_key", apiKey);
      localStorage.setItem("gemini_model", selectedModel);
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
      const prompt = await getGeminiResponse(imageData, customPrompt);
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
    <div className="min-h-screen bg-background pt-16">
      <nav className="fixed top-0 left-0 right-0 border-b bg-card z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <a href="/" className="text-xl font-bold">Beranda</a>
              <a href="https://www.artmozai.qzz.io" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary">Blog</a>
              <a href="https://stock.adobe.com/uk/contributor/211463521/artmozai" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary">Buy Image</a>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" onClick={toggleTheme}>
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Search Blog</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSearch} className="space-y-4">
            <Input
              placeholder="Enter your search query..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" className="w-full">
              Search
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Generate Image Description</h2>
            <p className="text-muted-foreground">
              Upload an image and get an AI-generated prompt that describes it
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <ImageUpload
                onImageUpload={handleImageUpload}
                imagePreview={imagePreview}
                isLoading={isLoading}
              />
              <Button
                onClick={generatePrompt}
                disabled={!selectedImage || isLoading}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
              >
                {isLoading ? "Generating..." : "Generate Prompt"}
              </Button>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Custom System Prompt</label>
                <Textarea
                  placeholder="Enter custom system prompt..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <div className="space-y-6">
              <Card className="p-6 space-y-4">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Gemini API Key</h2>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      placeholder="Enter your Gemini API key"
                      value={apiKey}
                      onChange={handleApiKeyChange}
                    />
                    <Button onClick={handleApiKeySubmit}>Save Key</Button>
                  </div>
                  <div className="space-y-2 mt-4">
                    <label className="text-sm font-medium">Select Gemini Model</label>
                    <Select value={selectedModel} onValueChange={handleModelChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gemini-1.5-flash-latest">gemini-1.5-flash-latest</SelectItem>
                        <SelectItem value="gemini-2.0-flash">gemini-2.0-flash</SelectItem>
                      </SelectContent>
                    </Select>
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

              {generatedPrompt && (
                <Card className="p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Generated Result</h2>
                    <Button variant="outline" size="icon" onClick={copyPrompt}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {generatedPrompt}
                  </p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
