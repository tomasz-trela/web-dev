import { useState } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

function linkify(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) =>
    urlRegex.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="underline break-all"
      >
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const [imageOpen, setImageOpen] = useState(false);
  const time = format(new Date(message.timestamp), 'HH:mm');

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-[70%] px-4 py-2 shadow-sm ${
          isOwn
            ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-none'
            : 'bg-muted rounded-2xl rounded-bl-none'
        }`}
      >
        {!isOwn && (
          <p className="text-xs font-semibold mb-1 opacity-70">{message.sender}</p>
        )}
        {message.type === 'image' ? (
          <>
            <img
              src={message.content}
              alt="Sent image"
              className="max-w-full rounded-lg cursor-pointer max-h-64 object-contain"
              onClick={() => setImageOpen(true)}
            />
            <Dialog open={imageOpen} onOpenChange={setImageOpen}>
              <DialogContent className="max-w-4xl p-2">
                <img
                  src={message.content}
                  alt="Full size"
                  className="w-full h-auto"
                />
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <p className="text-sm break-words whitespace-pre-wrap">{linkify(message.content)}</p>
        )}
        <p className={`text-[10px] mt-1 ${isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
          {time}
        </p>
      </div>
    </div>
  );
}
