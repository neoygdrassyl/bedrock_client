import Icon from '@/components/icon';
import { Button } from '@/components/ui/button';

export default function RequirementEvidenceAction({ action, onPreview, onManage }) {
  const isPreview = action?.type === 'preview';
  const label = action?.label || (isPreview ? 'Ver documento' : 'Relacionar documento');

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="min-h-[44px] gap-2 rounded-full px-4 text-sm"
      onClick={() => (isPreview ? onPreview?.(action.evidence) : onManage?.())}
      title={label}
      aria-label={label}
    >
      <Icon icon={isPreview ? 'mdi:eye-outline' : 'mdi:pencil-outline'} className="h-4 w-4" />
      <span>{isPreview ? 'Ver' : 'Relacionar'}</span>
    </Button>
  );
}
