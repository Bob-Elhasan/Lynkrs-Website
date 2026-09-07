import { siteConfig } from '@/content/site';

type SeoProps = {
  title?: string;
  description?: string;
  /** Path only, e.g. "/platform". Combined with the configured site URL. */
  path?: string;
  image?: string;
};

/**
 * React 19 hoists <title>, <meta> and <link> out of components into <head>,
 * so page-level metadata needs no helmet library.
 */
export function Seo({ title, description, path = '/', image }: SeoProps) {
  const fullTitle = title ? `${title} — ${siteConfig.name}` : `${siteConfig.name} — ${siteConfig.tagline}`;
  const desc = description ?? siteConfig.description;
  // siteConfig.url may carry a sub-path (GitHub Pages project sites do), and
  // `new URL('/x', origin+'/base')` throws that base away. Join by hand.
  const origin = siteConfig.url.replace(/\/+$/, '');
  const url = `${origin}${path.startsWith('/') ? path : `/${path}`}`;
  const ogImage = image
    ? `${origin}${image.startsWith('/') ? image : `/${image}`}`
    : `${origin}/icons/icon-512.png`;

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteConfig.name} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />
    </>
  );
}
