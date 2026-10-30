import { infoCud } from '@/shared/config/jsons/vars';
import { cn } from '@/shared/lib/utils';

/**
 * Tenant logo (`infoCud.icon`) on a white tile, or a "D" monogram when the
 * tenant has none. `tone="primary"` is for light surfaces (compact headers).
 */
export function BrandMark({ className, tone = 'light' }) {
  if (infoCud.icon) {
    return (
      <img
        src={infoCud.icon}
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
