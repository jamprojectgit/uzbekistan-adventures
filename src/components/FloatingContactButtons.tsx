import { Phone, Send, MessageCircle } from 'lucide-react';

const FloatingContactButtons = () => {
  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[9999] flex flex-col gap-3 pb-[env(safe-area-inset-bottom)]">
      {/* Telegram */}
      <a
        href="https://t.me/+998990152110"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Telegram"
        className="floating-btn bg-[#0088cc]"
        style={{ animationDelay: '0.1s' }}
      >
        <Send className="h-6 w-6 text-white" />
      </a>

      {/* WhatsApp */}
      <a
        href="https://wa.me/998990152110"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="floating-btn bg-[#25D366]"
        style={{ animationDelay: '0.2s' }}
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </a>

      {/* Phone */}
      <a
        href="tel:+998990152110"
        aria-label="Call"
        className="floating-btn bg-[#1E3A8A]"
        style={{ animationDelay: '0.3s' }}
      >
        <Phone className="h-6 w-6 text-white" />
      </a>
    </div>
  );
};

export default FloatingContactButtons;
