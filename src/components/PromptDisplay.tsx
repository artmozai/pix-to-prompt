import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Wand2 } from "lucide-react";

interface PromptDisplayProps {
  prompt: string;
  isLoading: boolean;
  onGenerate: () => void;
  hasImage: boolean;
}

const PromptDisplay = ({ prompt, isLoading, onGenerate, hasImage }: PromptDisplayProps) => {
  return (
    <div className="space-y-4">
      <Button
        onClick={onGenerate}
        disabled={!hasImage || isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Wand2 className="mr-2 h-4 w-4" />
            Generate Prompt
          </>
        )}
      </Button>

      {(prompt || isLoading) && (
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Generated Prompt:</h3>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {isLoading ? "Generating..." : prompt}
          </p>
        </Card>
      )}
    </div>
  );
};

export default PromptDisplay;