import { useMemo, useState } from 'react';
import { CheckCircle2, CircleHelp, ClipboardCheck, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

function effectMeta(effect) {
  if (effect === 'complies') return { icon: CheckCircle2, label: 'Cumple', variant: 'secondary' };
  if (effect === 'does_not_comply') return { icon: XCircle, label: 'No cumple', variant: 'destructive' };
  return { icon: CircleHelp, label: 'Sin decisión', variant: 'outline' };
}

function reviewKey(documentId, controlId) {
  return `${documentId}:${controlId}`;
}

export function LegalFormControls({ controls = [], selectedVr = '', canManage = false, saving = false, onSave }) {
  const [drafts, setDrafts] = useState({});
  const total = controls.reduce((count, item) => count + (item.controls || []).length, 0);
  const reviewed = controls.reduce((count, item) => count + (item.controls || []).filter((control) => control.review).length, 0);
  const blocking = controls.reduce((count, item) => count + (item.controls || []).filter((control) => control.review?.decisionEffect === 'does_not_comply').length, 0);
  const pending = Math.max(0, total - reviewed);
  const stats = useMemo(() => [
    ['Controles', total, 'outline'],
    ['Revisados', reviewed, 'secondary'],
    ['Pendientes', pending, pending ? 'outline' : 'secondary'],
    ['No cumple', blocking, blocking ? 'destructive' : 'outline'],
  ], [blocking, pending, reviewed, total]);

  if (!total) return null;
  const updateDraft = (key, patch) => setDrafts((current) => ({ ...current, [key]: { ...(current[key] || {}), ...patch } }));

  return (
    <section className="space-y-3" aria-labelledby="legal-controls-title">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 id="legal-controls-title" className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            Controles de Legal y debida forma
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">Decisiones aplicadas al VR {selectedVr || 'sin seleccionar'} según la configuración asignada al expediente.</p>
        </div>
        <div className="flex flex-wrap gap-1.5">{stats.map(([label, value, variant]) => <Badge key={label} variant={variant}>{label}: {value}</Badge>)}</div>
      </div>
      {controls.map((document) => (
        <Card key={document.documentId || document.documentCode} className="shadow-none">
          <CardHeader className="border-b border-border p-3">
            <CardTitle className="text-sm">{document.documentCode}</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border p-0">
            {(document.controls || []).map((control) => {
              const key = reviewKey(document.documentId, control.id);
              const draft = drafts[key] || {};
              const activeValue = draft.decisionValueId || control.review?.decisionValueId || '';
              const selected = (control.values || []).find((item) => item.id === activeValue);
              const needsObservation = selected?.effect === 'does_not_comply';
              const observation = draft.observation ?? control.review?.observation ?? '';
              const reviewMeta = control.review ? effectMeta(control.review.decisionEffect) : null;
              return (
                <article key={control.id} className="space-y-2 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{control.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{(control.origins || []).map((origin) => origin === 'direct' ? 'directo' : 'por tipología').join(' · ')} · {(control.tags || []).join(', ') || 'interno'}</p>
                    </div>
                    {reviewMeta ? <Badge variant={reviewMeta.variant}>{reviewMeta.label}</Badge> : <Badge variant="outline">Pendiente</Badge>}
                  </div>
                  {canManage ? (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {(control.values || []).map((value) => {
                          const meta = effectMeta(value.effect); const Icon = meta.icon;
                          return <Button key={value.id} type="button" size="sm" variant={activeValue === value.id ? 'default' : 'outline'} onClick={() => updateDraft(key, { decisionValueId: value.id })}><Icon className="h-3.5 w-3.5" aria-hidden="true" />{value.label}</Button>;
                        })}
                      </div>
                      {(needsObservation || observation) ? <Textarea value={observation} onChange={(event) => updateDraft(key, { observation: event.target.value })} placeholder={needsObservation ? 'Explique el incumplimiento (obligatorio).' : 'Observación opcional.'} className="min-h-16 text-sm" /> : null}
                      <div className="flex justify-end"><Button type="button" size="sm" disabled={!activeValue || saving || (needsObservation && !String(observation).trim())} onClick={() => onSave?.({ vrIdPublic: selectedVr, documentId: document.documentId, controlId: control.id, decisionValueId: activeValue, observation })}>{saving ? 'Guardando…' : 'Guardar decisión'}</Button></div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

export default LegalFormControls;
