import type { Message } from '@/types';

interface SystemMessageProps {
  message: Message;
}

export function SystemMessage({ message }: SystemMessageProps) {
  return (
    <div className="flex justify-center my-2">
      <span className="text-xs text-muted-foreground italic bg-muted/50 px-3 py-1 rounded-full">
        {message.content}
      </span>
    </div>
  );
}
