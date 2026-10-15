import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, CircleAlert, FilePlus2 } from 'lucide-react';
import FUN_SERVICE from '@/app/services/fun.service';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  buildGeneratorContext,
  evaluateGenerator,
  generatorsBySection,
  getGeneratorProps,
  GENERATOR_SECTION_AUTOMATIC,
  GENERATOR_SECTION_SPECIAL,
} from '../../../fun_forms/components/documentGeneratorsRegistry';
import { isCanonicalExpediente } from '../../hooks/useDocumentaryInventory';
import { Tag } from '../atoms/Tag';

const SECTIONS = [
  { key: GENERATOR_SECTION_AUTOMATIC, title: 'Documentos automáticos' },
  { key: GENERATOR_SECTION_SPECIAL, title: 'Documentación especial' },
];
const LOAD_ERROR = 'No fue posible cargar el expediente. Intente nuevamente.';

/** Data source a generator uses for this expediente (same rule the generators apply). */
export function generatorSource(entry, currentItem) {
  return entry.usesDocumentaryInventory && isCanonicalExpediente(currentItem) ? 'new' : 'legacy';
}

function SourceTag({ source }) {
  return source === 'new'
    ? <Tag tone="info" title="Usa el inventario del modelo documental nuevo">Modelo nuevo</Tag>
    : <Tag title="Usa los datos del módulo documental tradicional">Legacy</Tag>;
}

function GeneratorRow({ entry, ctx, baseProps, open, onToggle }) {
  const { available, reason } = evaluateGenerator(entry, ctx);
  const Generator = entry.component;
  const bodyId = `document-generator-${entry.id}`;
  return (
    <li className="border-b last:border-b-0">
      <div className="flex flex-wrap items-center gap-x-[0.75rem] gap-y-1 px-[1rem] py-2.5">
        <div className="min-w-0 flex-1">
          <p className="mb-0 text-sm font-medium leading-5 text-foreground">{entry.title}</p>
          <p className="mb-0 text-xs leading-4 text-muted-foreground">{available ? entry.description : reason}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {available ? null : <Tag tone="warning">No disponible</Tag>}
          <SourceTag source={generatorSource(entry, ctx.currentItem)} />
          <Button
            type="button"
            variant={open ? 'secondary' : 'outline'}
            size="sm"
            className="h-8"
            disabled={!available}
            aria-expanded={open}
            aria-controls={bodyId}
            aria-label={`${open ? 'Cerrar' : 'Generar'} ${entry.title}`}
            onClick={() => onToggle(entry.id)}
          >
            {open ? 'Cerrar' : 'Generar'}
            <ChevronDown aria-hidden="true" className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
          </Button>
        </div>
      </div>
      {available && open ? (
        <div id={bodyId} className="border-t bg-muted/20 px-[1rem] py-[0.75rem] text-start">
          <Generator {...getGeneratorProps(entry, baseProps, ctx)} />
        </div>
      ) : null}
    </li>
  );
}

/**
 * "Generar documentos" tab: the same generators (registry), gates and options as the legacy
 * FUND module, presented with the documentary module's governance.
 */
export function DocumentGeneratorsPanel({ currentId, currentVersion, translation, swaMsg, globals }) {
  const [currentItem, setCurrentItem] = useState(null);
  const [error, setError] = useState('');
  // One generator at a time: generators address their inputs by DOM id (vr_selected, geng_type,
  // genc_doc_form...) and several share them, so two mounted at once would read each other's fields.
  const [openId, setOpenId] = useState(null);

  const load = useCallback(() => {
    setError('');
    return FUN_SERVICE.get(currentId)
      .then((response) => setCurrentItem(response.data))
      .catch(() => setError(LOAD_ERROR));
  }, [currentId]);

  useEffect(() => { load(); }, [load]);

  const ctx = useMemo(
    () => (currentItem ? buildGeneratorContext({ currentItem, currentVersion, requestUpdate: load }) : null),
    [currentItem, currentVersion, load],
  );
  const baseProps = { translation, swaMsg, globals, currentItem, currentVersion };

  const toggle = (id) => setOpenId((previous) => (previous === id ? null : id));

  return (
    <section className="overflow-hidden rounded-lg border bg-[hsl(var(--card))] shadow-sm" aria-labelledby="document-generators-title">
      <header className="flex items-center gap-[0.75rem] border-b bg-muted/30 px-[1rem] py-[0.75rem]">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border-[1px] border-solid border-primary/20 bg-primary/10 text-[hsl(var(--primary))]">
          <FilePlus2 className="h-4 w-4" aria-hidden="true" />
        </span>
        <h2 id="document-generators-title" className="mb-0 text-[15px] font-semibold leading-5 text-foreground">Generar documentos</h2>
      </header>

      {error ? (
        <div className="p-[1rem]">
          <Alert variant="destructive" className="flex-wrap items-center">
            <CircleAlert aria-hidden="true" />
            <AlertDescription className="min-w-0 flex-1">{error}</AlertDescription>
            <Button type="button" variant="outline" size="sm" className="h-8 bg-background" onClick={load}>Reintentar</Button>
          </Alert>
        </div>
      ) : null}

      {!ctx && !error ? (
        <div className="flex flex-col gap-2 p-[1rem]" aria-hidden="true">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : null}

      {ctx ? SECTIONS.map((section) => {
        const entries = generatorsBySection(section.key).filter((entry) => evaluateGenerator(entry, ctx).visible);
        if (!entries.length) return null;
        return (
          <div key={section.key} role="group" aria-labelledby={`document-generators-${section.key}`}>
            <h3 id={`document-generators-${section.key}`} className="mb-0 border-b bg-muted/10 px-[1rem] py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {section.title}
            </h3>
            <ul className="m-0 list-none p-0">
              {entries.map((entry) => (
                <GeneratorRow key={entry.id} entry={entry} ctx={ctx} baseProps={baseProps} open={openId === entry.id} onToggle={toggle} />
              ))}
            </ul>
          </div>
        );
      }) : null}
    </section>
  );
}

export default DocumentGeneratorsPanel;
