
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { initializeGemini } from "@/utils/gemini";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GEMINI_MODELS, DEFAULT_GEMINI_MODEL } from "@/lib/gemini-models";

const GeminiKeyForm = ({ onKeySubmit }: { onKeySubmit: () => void }) => {
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState(DEFAULT_GEMINI_MODEL);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved model preference
    const savedModel = localStorage.getItem("gemini_model");
    if (savedModel) {
      setSelectedModel(savedModel);
    }
  }, []);

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
    
    // If we have an API key, initialize with the new model
    const currentApiKey = apiKey || localStorage.getItem("gemini_api_key");
    if (currentApiKey) {
      try {
        initializeGemini(currentApiKey, value);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      onKeySubmit();
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

  return (
    <Card className="p-6 w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Enter Gemini API Key</h2>
          <p className="text-sm text-muted-foreground">
            Please enter your Gemini API key to use the image-to-prompt generator
          </p>
        </div>
        <Input
          type="password"
          placeholder="Enter your Gemini API key"
          value={apiKey}
          onChange={handleApiKeyChange}
        />
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Gemini Model</label>
          <Select value={selectedModel} onValueChange={handleModelChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {GEMINI_MODELS.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  <div className="flex flex-col">
                    <span>{model.label}</span>
                    <span className="text-xs text-muted-foreground">{model.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" className="w-full">
          Save Settings
        </Button>
      </form>
    </Card>
  );
};

export default GeminiKeyForm;
