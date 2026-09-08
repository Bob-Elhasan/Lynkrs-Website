import { type CSSProperties, type ReactNode, useEffect, useRef } from 'react';
import { ArrowUpRight, Check, MoveUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Reveal } from '@/components/marketing/reveal';
import { Logo } from '@/components/layout/logo';
import { cn } from '@/lib/utils';

export function useSpatialMotion() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        const progress = Math.max(-1, Math.min(1, (window.innerHeight / 2 - (rect.top + rect.height / 2)) / Math.max(rect.height, 1)));
        element.style.setProperty('--scroll-shift', `${progress * 32}px`);
        element.style.setProperty('--scroll-rotate', `${progress * 3}deg`);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return ref;
}

export function SpatialField({ className }: { className?: string }) {
  return (
    <div className={cn('spatial-field', className)} aria-hidden="true">
      <span className="spatial-field__ring spatial-field__ring--one" />
      <span className="spatial-field__ring spatial-field__ring--two" />
      <span className="spatial-field__dot spatial-field__dot--one" />
      <span className="spatial-field__dot spatial-field__dot--two" />
    </div>
  );
}

export function PageHero({ number, eyebrow, title, lede, accent = 'dark' }: { number: string; eyebrow: string; title: ReactNode; lede: string; accent?: 'dark' | 'yellow' }) {
  const ref = useSpatialMotion();
  return (
    <section ref={ref} className={cn('spatial-page-hero', accent === 'yellow' ? 'spatial-page-hero--yellow' : 'spatial-page-hero--dark')}>
      <SpatialField />
      <div className="spatial-page-hero__inner">
        <div className="section-kicker"><span>{number}</span><span>{eyebrow}</span></div>
        <h1>{title}</h1>
        <p>{lede}</p>
      </div>
    </section>
  );
}

export function PageSection({ children, className, tone = 'light' }: { children: ReactNode; className?: string; tone?: 'light' | 'dark' | 'yellow' }) {
  return <section className={cn('spatial-page-section', `spatial-page-section--${tone}`, className)}><div className="spatial-page-section__inner">{children}</div></section>;
}

export function SectionIntro({ eyebrow, title, body }: { eyebrow: string; title: ReactNode; body?: string }) {
  return <Reveal><div className="section-kicker"><span>✦</span><span>{eyebrow}</span></div><h2 className="spatial-section-title">{title}</h2>{body ? <p className="spatial-section-body">{body}</p> : null}</Reveal>;
}

export function LinkArrow({ to, children, className }: { to: string; children: ReactNode; className?: string }) {
  return <Link to={to} className={cn('spatial-link', className)}>{children}<ArrowUpRight size={16} /></Link>;
}

export function SignalCard({ index, title, body, children, className }: { index: string; title: string; body: string; children?: ReactNode; className?: string }) {
  const ref = useSpatialMotion();
  return <article ref={ref} className={cn('signal-card', className)}><div className="signal-card__top"><span>{index}</span><MoveUpRight size={18} /></div><h3>{title}</h3><p>{body}</p>{children}</article>;
}

export function CheckList({ items }: { items: string[] }) {
  return <ul className="check-list">{items.map((item) => <li key={item}><Check size={15} /> <span>{item}</span></li>)}</ul>;
}

export function LogoFooter() {
  return <footer className="spatial-footer"><Logo /><p>Growth is not guessed. It is designed.</p><span>© {new Date().getFullYear()} Lynkrs</span></footer>;
}

export const pageShellStyle = { '--surface-accent': '#3c76c0' } as CSSProperties;
