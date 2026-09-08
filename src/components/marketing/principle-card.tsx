import { Card, CardContent } from '@/components/ui/card';

export function PrincipleCard({
  number,
  title,
  caption,
}: {
  number: string;
  title: string;
  caption?: string;
}) {
  return (
    <Card className="h-full">
      <CardContent>
        <span className="text-brand text-sm font-semibold tabular-nums" aria-hidden="true">
          {number}
        </span>
        <h3 className="mt-2 text-lg font-semibold tracking-tight">{title}</h3>
        {caption ? (
          <p className="text-muted-foreground mt-1 text-xs tracking-wide uppercase">{caption}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
