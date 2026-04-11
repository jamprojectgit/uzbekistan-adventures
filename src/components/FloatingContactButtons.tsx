import { Phone, Send, MessageCircle } from 'lucide-react';

const trackGoal = (goal: string) => {
  try { (window as any).ym?.(108500728, 'reachGoal', goal); } catch {}
};

const FloatingContactButtons = () => {
  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[9999] flex flex-col gap-3 pb-[env(safe-area-inset-bottom)]">
      <a
        href="https://t.me/+998990152110"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Telegram"
        className="floating-btn bg-[#0088cc]"
        style={{ animationDelay: '0.1s' }}
        onClick={() => trackGoal('telegram_click')}
      >
        <Send className="h-6 w-6 text-white" />
      </a>
      <a
        href="https://wa.me/998990152110"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="floating-btn bg-[#25D366]"
        style={{ animationDelay: '0.2s' }}
        onClick={() => trackGoal('whatsapp_click')}
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </a>
      <a
        href="tel:+998990152110"
        aria-label="Call"
        className="floating-btn bg-[#1E3A8A]"
        style={{ animationDelay: '0.3s' }}
        onClick={() => trackGoal('phone_click')}
      >
        <Phone className="h-6 w-6 text-white" />
      </a>
    </div>
  );
};

export default FloatingContactButtons;
