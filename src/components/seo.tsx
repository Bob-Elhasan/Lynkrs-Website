import { siteConfig } from '@/lib/site';

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
  const url = new URL(path, siteConfig.url).toString();
  const ogImage = image ? new URL(image, siteConfig.url).toString() : undefined;

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
      {ogImage ? <meta property="og:image" content={ogImage} /> : null}

      <meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}
    </>
  );
}
