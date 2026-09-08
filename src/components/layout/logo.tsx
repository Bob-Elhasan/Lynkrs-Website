import { cn } from '@/lib/utils';

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <img src="/lynkrs-logo.png" alt="Lynkrs" className={cn('logo-image', light && 'logo-image--light')} />
    </span>
  );
}
