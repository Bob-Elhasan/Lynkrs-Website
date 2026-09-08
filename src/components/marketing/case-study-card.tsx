import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CaseStudy } from '@/content/portfolio';

export function CaseStudyCard({ study }: { study: CaseStudy }) {
  return (
    <Link to={`/portfolio/${study.slug}`} className="group block h-full">
      <Card className="h-full transition-shadow hover:shadow-[var(--elevation-2)]">
        <CardHeader>
          <p className="text-muted-foreground text-xs tracking-wide uppercase">{study.sector}</p>
          <CardTitle className="group-hover:text-brand text-lg">{study.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm leading-relaxed">{study.summary}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {study.services.map((service) => (
              <Badge key={service} variant="secondary">
                {service}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
