import { useCuraduriaLogo } from '@/shared/branding/useCuraduriaLogo';
import { cn } from '@/shared/lib/utils';

/**
 * Curaduría logo (configured in Settings, else the bundled `infoCud.icon`) on a
 * white tile, or a "D" monogram when there is none. `tone="primary"` is for light surfaces (compact headers).
 */
export function BrandMark({ className, tone = 'light' }) {
  const { logo } = useCuraduriaLogo();
  if (logo) {
    return (
      <img
        src={logo}
        alt="Logo institucional"
        className={cn('object-contain rounded-2xl bg-white p-2.5 shadow-lg ring-1 ring-black/5', className)}
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex items-center justify-center rounded-2xl font-bold shadow-lg',
        tone === 'light' ? 'bg-white text-slate-900' : 'bg-primary text-primary-foreground',
        className,
      )}
    >
      D
    </div>
  );
}

export default BrandMark;
