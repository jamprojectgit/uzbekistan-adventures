import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface PaymentNoteProps {
  className?: string;
}

const PaymentNote = ({ className }: PaymentNoteProps) => {
  const { t } = useTranslation();
  return (
    <p className={cn('mt-1 text-xs sm:text-[13px] leading-snug text-muted-foreground', className)}>
      {t('payment.cashRub')}
    </p>
  );
};

export default PaymentNote;
