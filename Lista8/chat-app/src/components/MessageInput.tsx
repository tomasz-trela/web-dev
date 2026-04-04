import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, ImagePlus } from 'lucide-react';
import { ImagePreview } from './ImagePreview';

interface MessageInputProps {
  onSend: (content: string, type: 'text' | 'image') => void;
  onTyping: () => void;
}

function compressImage(file: File, maxSize: number = 1024, quality: number = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function MessageInput({ onSend, onTyping }: MessageInputProps) {
  const [text, setText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (imagePreview) {
      onSend(imagePreview, 'image');
      setImagePreview(null);
      return;
    }
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed, 'text');
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setImagePreview(compressed);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="border-t p-3">
      {imagePreview && (
        <ImagePreview src={imagePreview} onCancel={() => setImagePreview(null)} />
      )}
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImagePlus className="h-5 w-5" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <Input
          placeholder="Napisz wiadomość..."
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            onTyping();
          }}
          onKeyDown={handleKeyDown}
          disabled={!!imagePreview}
        />
        <Button onClick={handleSend} size="icon" className="shrink-0">
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
