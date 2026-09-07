import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="size-7 shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="32" height="32" rx="8" className="fill-foreground" />
        <path d="M11 21V11h2.6v7.7H19V21h-8z" className="fill-background" />
        <circle cx="22.5" cy="11.5" r="2.5" className="fill-primary" />
      </svg>
      <span className="text-[1.05rem] font-semibold tracking-tight">Lynkrs</span>
    </span>
  );
}
