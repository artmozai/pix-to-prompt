import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ImageIcon } from "lucide-react";

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  imagePreview: string | null;
  isLoading: boolean;
}

const ImageUpload = ({ onImageUpload, imagePreview, isLoading }: ImageUploadProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onImageUpload(acceptedFiles[0]);
      }
    },
    [onImageUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1,
    disabled: isLoading
  });

  return (
    <div>
      <Card
        {...getRootProps()}
        className={cn(
          "rounded-lg cursor-pointer transition-colors duration-200",
          isDragActive ? "bg-primary/5" : "",
          "hover:bg-accent/50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center p-8 text-center">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-[300px] rounded-lg object-contain"
            />
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Drag & drop an image here, or click to select
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports PNG, JPG or JPEG (max. 10MB)
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ImageUpload;