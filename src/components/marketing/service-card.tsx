import { Link } from 'react-router-dom';

import { ServiceIcon } from '@/components/marketing/service-icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Service } from '@/content/services';

/**
 * One service module. The whole card is the link target — no link nested
 * inside a link — so it stays a single, generous tap target on mobile.
 */
export function ServiceCard({
  service,
  variant = 'preview',
}: {
  service: Service;
  variant?: 'preview' | 'full' | 'compact';
}) {
  const compact = variant === 'compact';

  return (
    <Link to={`/services/${service.slug}`} className="group block h-full">
      <Card
        size={compact ? 'sm' : 'default'}
        className="h-full transition-shadow hover:shadow-[var(--elevation-2)]"
      >
        <CardHeader>
          <ServiceIcon slug={service.slug} className="text-brand size-6" />
          <p className="text-brand mt-3 text-xs font-semibold tracking-wide">{service.code}</p>
          <CardTitle className={cn('group-hover:text-brand', compact ? 'text-base' : 'text-lg')}>
            {service.name}
          </CardTitle>
        </CardHeader>
        {compact ? null : (
          <CardContent>
            <p className="text-sm">{service.lede}</p>
            {variant === 'full' ? (
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {service.emphasis}
              </p>
            ) : null}
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
