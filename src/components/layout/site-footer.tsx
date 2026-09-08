import { Link } from 'react-router-dom';
import { Logo } from '@/components/layout/logo';
import { footerNav, siteConfig } from '@/content/site';

export function SiteFooter() {
  return (
    <footer className="spatial-footer site-footer-modern">
      <div className="site-footer-modern__lead">
        <Logo />
        <p><span>Growth is not guessed.</span><span>It is designed.</span></p>
        <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
      </div>
      <div className="site-footer-modern__nav">
        {footerNav.map((group) => (
          <div key={group.heading}>
            <h3>{group.heading}</h3>
            <ul>{group.links.map((link) => <li key={`${group.heading}-${link.label}`}><Link to={link.href}>{link.label}</Link></li>)}</ul>
          </div>
        ))}
      </div>
      <div className="site-footer-modern__bottom">
        <span>© {new Date().getFullYear()} {siteConfig.name}</span>
        <div>{Object.entries(siteConfig.social).map(([platform, href]) => <a key={platform} href={href} target="_blank" rel="noreferrer noopener">{platform}</a>)}</div>
      </div>
    </footer>
  );
}
