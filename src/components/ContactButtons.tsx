import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { MessageCircle, Send } from 'lucide-react';

interface ContactButtonsProps {
  message?: string;
  className?: string;
  size?: 'default' | 'sm' | 'lg';
}

const PHONE = '998990152110';

const ContactButtons = ({ message, className = '', size = 'default' }: ContactButtonsProps) => {
  const { t } = useTranslation();
  const finalMessage = message || t('contact.defaultMessage');
  const encodedMessage = encodeURIComponent(finalMessage);

  const waUrl = `https://wa.me/${PHONE}?text=${encodedMessage}`;
  const tgUrl = `https://t.me/+${PHONE}?text=${encodedMessage}`;

  const isCompact = className?.includes('train-contact-buttons');

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        size={size}
        className={`bg-[#25D366] hover:bg-[#1da851] text-white flex-1 ${isCompact ? 'h-9 px-3 rounded-[10px] text-xs font-medium' : ''}`}
        asChild
      >
        <a href={waUrl} target="_blank" rel="noopener noreferrer">
          <MessageCircle className={`${isCompact ? 'h-3.5 w-3.5 mr-1.5' : 'h-4 w-4 mr-2'}`} />
          WhatsApp
        </a>
      </Button>
      <Button
        size={size}
        className={`bg-[#0088cc] hover:bg-[#006da3] text-white flex-1 ${isCompact ? 'h-9 px-3 rounded-[10px] text-xs font-medium' : ''}`}
        asChild
      >
        <a href={tgUrl} target="_blank" rel="noopener noreferrer">
          <Send className={`${isCompact ? 'h-3.5 w-3.5 mr-1.5' : 'h-4 w-4 mr-2'}`} />
          Telegram
        </a>
      </Button>
    </div>
  );
};

export default ContactButtons;
