import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <img src="/lynkrs-logo.png" alt="Lynkrs" className="logo-image" />
    </span>
  );
}
