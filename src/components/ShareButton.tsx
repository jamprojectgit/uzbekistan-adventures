import { useState } from 'react';
import { Share2, X, MessageCircle, Send, Facebook, Link } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ShareButtonProps {
  title: string;
  url?: string;
  className?: string;
  size?: number;
}

const ShareButton = ({ title, url, className, size = 18 }: ShareButtonProps) => {
  const [open, setOpen] = useState(false);
  const shareUrl = url || window.location.href;

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
      } catch {}
      return;
    }
    setOpen(true);
  };

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const options = [
    { label: 'WhatsApp', icon: MessageCircle, href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, color: 'text-[#25D366]' },
    { label: 'Telegram', icon: Send, href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`, color: 'text-[#0088cc]' },
    { label: 'Facebook', icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, color: 'text-[#1877F2]' },
  ];

  const copyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied!');
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          onClick={handleShare}
          className={cn(
            'inline-flex items-center justify-center rounded-full bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background transition-colors',
            className
          )}
          aria-label="Share"
        >
          <Share2 className="text-foreground/70" style={{ width: size, height: size }} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="end" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-1">
          {options.map((opt) => (
            <a
              key={opt.label}
              href={opt.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => { e.stopPropagation(); setOpen(false); }}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors"
            >
              <opt.icon className={cn('h-4 w-4', opt.color)} />
              {opt.label}
            </a>
          ))}
          <button
            onClick={copyLink}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors w-full"
          >
            <Link className="h-4 w-4 text-muted-foreground" />
            Copy link
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ShareButton;
