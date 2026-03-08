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

  return (
    <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
      <Button size={size} className="bg-[#25D366] hover:bg-[#1da851] text-white flex-1" asChild>
        <a href={waUrl} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="h-5 w-5 mr-2" />
          {t('contact.whatsappButton', 'Chat on WhatsApp')}
        </a>
      </Button>
      <Button size={size} className="bg-[#0088cc] hover:bg-[#006da3] text-white flex-1" asChild>
        <a href={tgUrl} target="_blank" rel="noopener noreferrer">
          <Send className="h-5 w-5 mr-2" />
          {t('contact.telegramButton', 'Message on Telegram')}
        </a>
      </Button>
    </div>
  );
};

export default ContactButtons;
