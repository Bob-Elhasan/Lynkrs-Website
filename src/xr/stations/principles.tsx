import { principles } from '@/content/journey';
import { PALETTE } from '@/xr/palette';
import { StationFrame } from '@/xr/stations/station-frame';
import { Stack, eyebrow, numbered } from '@/xr/ui/panel';

/** Four monoliths the camera banks between, one per principle. */
export function PrinciplesStation({
  animate,
  focus,
}: {
  animate: boolean;
  focus: number;
}) {
  return (
    <StationFrame position={[-1, -4.6, -104]} animate={animate} seed={3.9} focus={focus}>
      <group position={[-8, 5, 0]}>
        <Stack blocks={[eyebrow(`${principles.number} ${principles.title}`)]} />
      </group>

      {principles.items.map((item, i) => {
        const x = -8 + (i % 2) * 8.6;
        const y = 2.4 - Math.floor(i / 2) * 3.4;
        return (
          <group key={item.number} position={[x, y, i % 2 === 0 ? -0.5 : -1.6]}>
            <Stack
              gap={0.1}
              blocks={[eyebrow(item.caption, 7.2), numbered(item.number, item.title, undefined, 7.2)]}
            />
          </group>
        );
      })}

      <pointLight position={[0, 1, 2]} intensity={14} color={PALETTE.blue} distance={24} />
    </StationFrame>
  );
}
