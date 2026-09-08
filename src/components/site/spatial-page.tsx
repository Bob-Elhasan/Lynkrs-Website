import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check, MoveUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Reveal } from '@/components/marketing/reveal';
import { Logo } from '@/components/layout/logo';
import { cn } from '@/lib/utils';

export function useSpatialMotion() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { threshold: 0.14 });
    observer.observe(element);
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
    const onPointer = (event: PointerEvent) => {
      const bounds = element.getBoundingClientRect();
      element.style.setProperty('--pointer-x', `${(event.clientX - bounds.left) / Math.max(bounds.width, 1) - 0.5}`);
      element.style.setProperty('--pointer-y', `${(event.clientY - bounds.top) / Math.max(bounds.height, 1) - 0.5}`);
    };
    element.addEventListener('pointermove', onPointer);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      element.removeEventListener('pointermove', onPointer);
    };
  }, []);
  return { ref, isVisible };
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
  const { ref, isVisible } = useSpatialMotion();
  return (
    <section ref={ref} className={cn('spatial-page-hero', isVisible && 'is-visible', accent === 'yellow' ? 'spatial-page-hero--yellow' : 'spatial-page-hero--dark')}>
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
  const { ref, isVisible } = useSpatialMotion();
  return <section ref={ref} className={cn('spatial-page-section', isVisible && 'is-visible', `spatial-page-section--${tone}`, className)}><div className="spatial-page-section__inner">{children}</div></section>;
}

export function SectionIntro({ eyebrow, title, body }: { eyebrow: string; title: ReactNode; body?: string }) {
  return <Reveal><div className="section-kicker"><span>✦</span><span>{eyebrow}</span></div><h2 className="spatial-section-title">{title}</h2>{body ? <p className="spatial-section-body">{body}</p> : null}</Reveal>;
}

export function LinkArrow({ to, children, className }: { to: string; children: ReactNode; className?: string }) {
  return <Link to={to} className={cn('spatial-link', className)}>{children}<ArrowUpRight size={16} /></Link>;
}

export function SignalCard({ index, title, body, children, className }: { index: string; title: string; body: string; children?: ReactNode; className?: string }) {
  const { ref, isVisible } = useSpatialMotion();
  return <article ref={ref} className={cn('signal-card', isVisible && 'is-visible', className)}><div className="signal-card__top"><span>{index}</span><MoveUpRight size={18} /></div><h3>{title}</h3><p>{body}</p>{children}</article>;
}

export function CheckList({ items }: { items: string[] }) {
  return <ul className="check-list">{items.map((item) => <li key={item}><Check size={15} /> <span>{item}</span></li>)}</ul>;
}

export function LogoFooter() {
  return <footer className="spatial-footer"><Logo /><p>Growth is not guessed. It is designed.</p><span>© {new Date().getFullYear()} Lynkrs</span></footer>;
}

export const pageShellStyle = { '--surface-accent': '#3c76c0' } as CSSProperties;
