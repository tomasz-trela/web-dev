import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface NickDialogProps {
  onJoin: (nickname: string) => void;
}

export function NickDialog({ onJoin }: NickDialogProps) {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (trimmed.length < 3 || trimmed.length > 20) {
      setError('Pseudonim musi mieć 3-20 znaków');
      return;
    }
    if (!/^[a-zA-Z0-9_ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+$/.test(trimmed)) {
      setError('Dozwolone znaki: litery, cyfry, _');
      return;
    }
    onJoin(trimmed);
  };

  return (
    <Dialog open>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Dołącz do czatu
          </DialogTitle>
          <DialogDescription>
            Podaj swój pseudonim, aby rozpocząć rozmowę
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Twój pseudonim..."
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setError('');
              }}
              autoFocus
            />
            {error && <p className="text-sm text-destructive mt-1">{error}</p>}
          </div>
          <Button type="submit" className="w-full">
            Dołącz do czatu
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
