import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';

export function LegalFormVrDialog({
  open,
  options = [],
  value = '',
  selectedVr = '',
  sourceLabel = 'Dovela Central',
  saving = false,
  error = '',
  onOpenChange,
  onValueChange,
  onSave,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Editar Legal y debida forma</DialogTitle>
          <DialogDescription>
            Selecciona el único VR que respaldará Legal y debida forma para todo el expediente.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>Fuente: {sourceLabel}</span>
          {selectedVr ? <Badge variant="outline">Actual: {selectedVr}</Badge> : null}
        </div>

        {options.length ? (
          <ScrollArea className="max-h-[min(48vh,420px)] rounded-lg border border-border">
            <RadioGroup
              value={value}
              onValueChange={onValueChange}
              aria-label="VR para Legal y debida forma"
              className="gap-0 p-2"
            >
              {options.map((option) => {
                const optionId = `legal-form-vr-${option.value.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
                return (
                  <Label
                    key={option.value}
                    htmlFor={optionId}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm hover:bg-muted"
                  >
                    <RadioGroupItem id={optionId} value={option.value} />
                    <span className="min-w-0 flex-1 truncate font-mono">{option.label}</span>
                    {option.isLatest ? <Badge variant="secondary">Último VR</Badge> : null}
                  </Label>
                );
              })}
            </RadioGroup>
          </ScrollArea>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
            Este expediente no tiene VR disponibles para seleccionar.
          </div>
        )}

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button type="button" onClick={() => onSave?.(value)} disabled={!value || saving}>
            {saving ? 'Guardando...' : 'Guardar VR'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default LegalFormVrDialog;
