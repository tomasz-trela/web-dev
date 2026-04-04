import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImagePreviewProps {
  src: string;
  onCancel: () => void;
}

export function ImagePreview({ src, onCancel }: ImagePreviewProps) {
  return (
    <div className="relative inline-block mx-4 mb-2">
      <img
        src={src}
        alt="Preview"
        className="max-h-32 rounded-lg border"
      />
      <Button
        variant="destructive"
        size="icon"
        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
        onClick={onCancel}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}
