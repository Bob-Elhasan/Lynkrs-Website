import { Compass, PenLine, Search, TrendingUp, type LucideIcon } from 'lucide-react';

/** One icon per service module, kept consistent everywhere a service renders. */
const ICONS: Record<string, LucideIcon> = {
  performance: TrendingUp,
  content: PenLine,
  seo: Search,
  consultancy: Compass,
};

export function ServiceIcon({ slug, className }: { slug: string; className?: string }) {
  const Icon = ICONS[slug] ?? Compass;
  return <Icon className={className} aria-hidden="true" />;
}
