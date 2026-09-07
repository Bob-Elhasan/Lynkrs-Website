import { stations } from '@/xr/spline';
import { useStageActive } from '@/xr/stage-state';
import { useJourneyProgress } from '@/xr/use-journey-progress';
import { cn } from '@/lib/utils';

const LAST = stations.length - 1;

/** Jumps the page's real scroll position to a station's fraction of the journey. */
function scrollToStation(t: number, reducedMotion: boolean) {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  window.scrollTo({ top: t * max, behavior: reducedMotion ? 'instant' : 'smooth' });
}

/**
 * A slim progress indicator for the scroll journey: a vertical dot rail on
 * desktop, a thin horizontal bar under the header on mobile. Gives the
 * corridor a visible destination instead of reading as unbounded scroll, and
 * doubles as quick navigation — each station is a clickable jump target.
 *
 * Only meaningful while the 3D stage is actually driving the homepage: with
 * no stage (WebGL unsupported, or the flat DOM fallback) there is no journey
 * to track, just the ordinary page.
 */
export function JourneyRail() {
  const stageActive = useStageActive();
  const { scrollProgress, reducedMotion, isHome } = useJourneyProgress();

  if (!isHome || !stageActive) return null;

  const activeIndex = Math.round(scrollProgress * LAST);

  return (
    <>
      <nav
        aria-label="Journey progress"
        className="pointer-events-auto fixed top-1/2 right-5 z-40 hidden -translate-y-1/2 md:block"
      >
        <div className="relative flex flex-col items-center gap-3 py-1">
          <span
            aria-hidden="true"
            className="bg-border absolute top-1 bottom-1 left-1/2 -z-10 w-px -translate-x-1/2"
          />
          <span
            aria-hidden="true"
            className="bg-brand absolute top-1 left-1/2 -z-10 w-px origin-top -translate-x-1/2 transition-transform duration-150"
            style={{ height: 'calc(100% - 0.5rem)', transform: `translateX(-50%) scaleY(${scrollProgress})` }}
          />
          {stations.map((station, i) => {
            const t = i / LAST;
            const passed = i < activeIndex;
            const active = i === activeIndex;
            return (
              <button
                key={station.id}
                type="button"
                title={station.label}
                aria-label={station.label}
                aria-current={active ? 'step' : undefined}
                onClick={() => scrollToStation(t, reducedMotion)}
                className={cn(
                  'size-2.5 rounded-full border transition-all',
                  active
                    ? 'border-brand bg-brand scale-125 ring-brand/30 ring-4'
                    : passed
                      ? 'border-brand bg-brand'
                      : 'border-border bg-background hover:border-brand/60',
                )}
              />
            );
          })}
        </div>
      </nav>

      <div
        aria-hidden="true"
        className="bg-border pointer-events-none fixed inset-x-0 top-16 z-40 h-0.5 md:hidden"
      >
        <div
          className="bg-brand h-full origin-left transition-transform duration-150"
          style={{ transform: `scaleX(${scrollProgress})` }}
        />
      </div>
    </>
  );
}
