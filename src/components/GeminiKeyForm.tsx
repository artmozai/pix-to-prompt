import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { initializeGemini } from "@/utils/gemini";

const GeminiKeyForm = ({ onKeySubmit }: { onKeySubmit: () => void }) => {
  const [apiKey, setApiKey] = useState("");
  const { toast } = useToast();

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
      initializeGemini(apiKey);
      localStorage.setItem("gemini_api_key", apiKey);
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
          onChange={(e) => setApiKey(e.target.value)}
        />
        <Button type="submit" className="w-full">
          Save API Key
        </Button>
      </form>
    </Card>
  );
};

export default GeminiKeyForm;