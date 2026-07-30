import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Loader2, Search } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Icon } from '@/components/icon';
import { formsParser1 } from '@/app/components/customClasses/typeParse';
import FUNService from '../services/fun.service';
import { buildExpedienteWorkspaceUrl } from '../pages/user/fun_forms/utils/expedienteWorkspaceRoute';

const MIN_QUERY_LENGTH = 3;
const RESULT_LIMIT = 8;
const TERM_STATUS_META = {
  EN_TERMINO: {
    label: 'En término',
    badgeClassName: 'border-accent/20 bg-accent/10 text-accent',
  },
  PRONTO_A_VENCER: {
    label: 'Por vencer',
    badgeClassName: 'border-warning/30 bg-warning/10 text-warning',
  },
  ALERTA_VENCIMIENTO: {
    label: 'Alerta',
    badgeClassName: 'border-warning/50 bg-warning/15 text-warning',
  },
  VENCIDO: {
    label: 'Vencido',
    badgeClassName: 'border-destructive/30 bg-destructive/10 text-destructive',
  },
};
const SEARCH_FIELDS = [
  {
    value: '1',
    label: 'Número de radicado',
    placeholder: 'Ej. 68001-1-26-0001',
  },
  {
    value: '2',
    label: 'Matrícula inmobiliaria',
    placeholder: 'Ej. 300-123456',
  },
  {
    value: '3',
    label: 'Identificación predial/catastral',
    placeholder: 'Ej. 0102030405000',
  },
  {
    value: '4',
    label: 'Dirección actual',
    placeholder: 'Ej. Calle 12 # 34-56',
  },
  {
    value: '5',
    label: 'C.C. o NIT',
    placeholder: 'Ej. 123456789',
  },
  {
    value: '6',
    label: 'Nombre',
    placeholder: 'Ej. Juan Pérez',
  },
];

function normalizePayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return payload ? [payload] : [];
}

function normalizeQuery(value) {
  return String(value || '').trim();
}

function isCompletePublicId(value) {
  return /^\d{5}-\d+-[a-z0-9]{2}-\d{4}$/i.test(value);
}

function normalizeSummaryPayload(payload) {
  if (!payload) return null;
  if (payload?.data && !Array.isArray(payload.data)) return payload.data;
  return payload;
}

function pickPublicId(item, fallback = '') {
  return item?.id_public || item?.radicado || item?.currentPublic || fallback;
}

function formatFallbackPhase(item) {
  const rawState = Number(item?.state ?? item?.state_raw);
  if (!Number.isFinite(rawState)) return 'Estado no informado';
  if (rawState < -1) return 'Desistimiento';
  if (rawState === -1 || rawState === 1) return 'Radicación incompleta';
  if (rawState >= 100) return 'Cerrado';
  if (rawState >= 99) return 'Entrega de licencia';
  if (rawState >= 80) return 'Resolución';
  if (rawState >= 61) return 'Viabilidad y pagos';
  if (rawState >= 50) return 'Expedición';
  if (rawState >= 30) return 'Observaciones';
  if (rawState >= 5) return 'Estudio y observaciones';
  return 'Radicación';
}

function toDisplayCase(value) {
  const text = String(value || '').trim();
  if (!text) return '';

  return text
    .toLowerCase()
    .replace(/\b([a-záéíóúñ])/g, (match) => match.toUpperCase());
}

function formatLicenseName(item, summary) {
  const source = {
    tipo: summary?.tipo ?? item?.tipo,
    tramite: summary?.tramite ?? item?.tramite,
    m_urb: summary?.m_urb ?? item?.m_urb,
    m_sub: summary?.m_sub ?? item?.m_sub,
    m_lic: summary?.m_lic ?? item?.m_lic,
  };
  const parsed = formsParser1(source);
  if (parsed) {
    return parsed
      .split(',')
      .map((token) => toDisplayCase(token))
      .filter(Boolean)
      .join(' · ');
  }

  return toDisplayCase(summary?.description || item?.description || 'Expediente urbanístico');
}

function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function resolveApplicant(summary) {
  if (summary?.solicitante) {
    return {
      label: 'Solicitante',
      value: toDisplayCase(summary.solicitante),
    };
  }

  if (summary?.responsableSolicitud) {
    return {
      label: 'Responsable',
      value: toDisplayCase(summary.responsableSolicitud),
    };
  }

  return null;
}

function buildLegalWindow(summary) {
  const usedDays = Number(summary?.dias_habiles_usados);
  const limitDays = Number(summary?.dias_habiles_limite);
  const responsible = summary?.responsable ? toDisplayCase(summary.responsable) : 'Proceso';

  if (!Number.isFinite(usedDays) || !Number.isFinite(limitDays) || limitDays <= 0) {
    return summary?.esta_pausado ? 'Pausado temporalmente' : 'Sin término activo';
  }

  const dueDate = formatDate(summary?.fecha_limite);
  return `${responsible}: ${usedDays}/${limitDays} días hábiles${dueDate ? ` · vence ${dueDate}` : ''}`;
}

function resolveTermMeta(summary) {
  if (summary?.es_desistido) {
    return {
      label: 'Desistido',
      badgeClassName: 'border-destructive/20 bg-destructive/10 text-destructive',
    };
  }

  if (summary?.fase_actual === 'COMPLETADO' || Number(summary?.state_raw) >= 100) {
    return {
      label: 'Cerrado',
      badgeClassName: 'border-border bg-muted/50 text-muted-foreground',
    };
  }

  return TERM_STATUS_META[summary?.status] || {
    label: 'En trámite',
    badgeClassName: 'border-border bg-muted/40 text-foreground',
  };
}

function buildExpedienteResult(item, summary, term) {
  const idPublic = pickPublicId(summary, pickPublicId(item, term));
  if (!idPublic) return null;

  const licenseName = formatLicenseName(item, summary);
  const applicant = resolveApplicant(summary);
  const termMeta = resolveTermMeta(summary);
  const legalState = toDisplayCase(summary?.fase_label || formatFallbackPhase(item));

  return {
    key: `expediente-${idPublic}-${item?.id ?? summary?.id ?? term}`,
    icon: 'FolderOpen',
    category: 'Expediente',
    title: licenseName,
    idPublic,
    href: buildExpedienteWorkspaceUrl(item, { section: 'detalles' })
      || buildExpedienteWorkspaceUrl(summary, { section: 'detalles' })
      || `/funmanage/expediente/${encodeURIComponent(idPublic)}`,
    phaseLabel: legalState,
    termLabel: termMeta.label,
    termBadgeClassName: termMeta.badgeClassName,
    legalWindow: buildLegalWindow(summary),
    applicantLabel: applicant?.label || null,
    applicantValue: applicant?.value || null,
    address: toDisplayCase(summary?.direccion || ''),
  };
}

function dedupeCandidates(results) {
  const seen = new Set();
  return results.filter((result) => {
    const idPublic = pickPublicId(result);
    if (!idPublic || seen.has(idPublic)) return false;
    seen.add(idPublic);
    return true;
  }).slice(0, RESULT_LIMIT);
}

function buildResultMeta(item) {
  const detail = [item?.tipo, item?.m_lic, item?.m_urb, item?.m_sub]
    .filter(Boolean)
    .join(' · ');

  return {
    title: item?.tramite || item?.tipo || item?.type || 'Expediente urbanístico',
    description: detail || 'Abrir gestión completa del expediente',
  };
}

function normalizeExpedienteResults(payload, term) {
  return normalizePayload(payload)
    .filter(Boolean)
    .map((item, index) => {
      const idPublic = pickPublicId(item, term);
      if (!idPublic) return null;

      const { title, description } = buildResultMeta(item);
      return {
        key: `expediente-${idPublic}-${item?.id ?? index}`,
        icon: 'FolderOpen',
        category: 'Expediente',
        title,
        idPublic,
        description,
        href: buildExpedienteWorkspaceUrl(item, { section: 'detalles' }) || `/funmanage/expediente/${encodeURIComponent(idPublic)}`,
        ...item,
      };
    })
    .filter(Boolean);
}

function dedupeResults(results) {
  const seen = new Set();
  return results.filter((result) => {
    const uniqueKey = `${result.category}-${result.idPublic}-${result.href}`;
    if (seen.has(uniqueKey)) return false;
    seen.add(uniqueKey);
    return true;
  }).slice(0, RESULT_LIMIT);
}

export function GlobalSearchDialog({ open, onOpenChange }) {
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [searchField, setSearchField] = useState('1');
  const [status, setStatus] = useState('idle');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const activeField = useMemo(
    () => SEARCH_FIELDS.find((field) => field.value === searchField) || SEARCH_FIELDS[0],
    [searchField]
  );

  useEffect(() => {
    if (!open) return undefined;
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  const handleSearch = useCallback(async (event) => {
    event?.preventDefault();
    const term = normalizeQuery(query);

    if (!term || term.length < MIN_QUERY_LENGTH) {
      setStatus('idle');
      setResults([]);
      setError(`Escribe al menos ${MIN_QUERY_LENGTH} caracteres para consultar expedientes.`);
      return;
    }

    setStatus('loading');
    setError('');
    setResults([]);

    const lookups = [FUNService.getSearch(searchField, term)];
    if (searchField === '1' && isCompletePublicId(term)) {
      lookups.push(FUNService.get_fun_IdPublic(term, { skipDovelaErrorCapture: true }));
    }

    const settledLookups = await Promise.allSettled(lookups);
    const candidateRows = settledLookups.flatMap((lookup, index) => {
      if (lookup.status !== 'fulfilled') return [];
      return normalizeExpedienteResults(lookup.value?.data, term, index);
    });
    const uniqueCandidates = dedupeCandidates(candidateRows);

    const summaryLookups = await Promise.allSettled(
      uniqueCandidates.map((candidate) => FUNService.getSummaryByIdPublic(
        pickPublicId(candidate, term),
        { skipDovelaErrorCapture: true },
      ))
    );

    const nextResults = uniqueCandidates.map((candidate, index) => {
      const summaryLookup = summaryLookups[index];
      const summary = summaryLookup?.status === 'fulfilled'
        ? normalizeSummaryPayload(summaryLookup.value?.data)
        : null;
      return buildExpedienteResult(candidate, summary, term);
    }).filter(Boolean);

    const failedCount = settledLookups.filter((lookup) => lookup.status === 'rejected').length;
    const uniqueResults = dedupeResults(nextResults);

    setResults(uniqueResults);
    setStatus('done');
    if (failedCount === settledLookups.length) {
      setError('No fue posible consultar expedientes en este momento. Intenta de nuevo.');
    } else if (uniqueResults.length === 0) {
      setError('No encontramos expedientes con ese criterio.');
    }
  }, [query, searchField]);

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setStatus('idle');
    setError('');
    inputRef.current?.focus();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border/60 px-5 py-4">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Search className="h-4 w-4 text-primary" />
            Buscar expediente
          </DialogTitle>
          <DialogDescription>
            Consulta expedientes desde cualquier módulo y abre su gestión canónica al instante.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSearch} className="border-b border-border/60 p-4">
          <div className="grid gap-2 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_auto_auto]">
            <label className="flex min-w-0 items-center overflow-hidden rounded-md border border-border bg-background shadow-sm">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center border-r border-border bg-muted/60 text-muted-foreground">
                <Icon name="Info" size={13} />
              </span>
              <select
                value={searchField}
                onChange={(event) => setSearchField(event.target.value)}
                className="h-10 min-w-0 flex-1 border-0 bg-transparent px-2.5 text-[13px] text-foreground outline-none"
                aria-label="Campo de búsqueda de expediente"
              >
                {SEARCH_FIELDS.map((field) => (
                  <option key={field.value} value={field.value}>
                    {field.label}
                  </option>
                ))}
              </select>
            </label>
            <Input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={activeField.placeholder}
              className="h-10"
              aria-label="Criterio de búsqueda de expedientes"
            />
            <Button type="submit" disabled={status === 'loading'} className="min-w-24">
              {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Buscar
            </Button>
            {query ? (
              <Button type="button" variant="outline" onClick={clearSearch}>
                Limpiar
              </Button>
            ) : (
              <span aria-hidden="true" />
            )}
          </div>
        </form>

        <div className="max-h-[26rem] overflow-y-auto p-3">
          {status === 'loading' && (
            <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Consultando...
            </div>
          )}

          {status !== 'loading' && error && (
            <div className="rounded-md border border-border/70 bg-muted/40 px-4 py-5 text-center text-sm text-muted-foreground">
              {error}
            </div>
          )}

          {status !== 'loading' && results.length > 0 && (
            <div className="grid gap-2">
              {results.map((result) => (
                <Link
                  key={result.key}
                  to={result.href}
                  onClick={() => onOpenChange(false)}
                  className="group rounded-md border border-border/60 bg-background px-3 py-3 no-underline transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon name={result.icon} size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="rounded-full text-[10px] font-normal">
                          {result.category}
                        </Badge>
                        <span className="font-mono text-xs font-semibold text-foreground">{result.idPublic}</span>
                        <Badge variant="outline" className={`text-[10px] font-medium ${result.termBadgeClassName}`}>
                          {result.termLabel}
                        </Badge>
                      </span>
                      <span className="mt-1 block text-sm font-medium leading-5 text-foreground">{result.title}</span>
                      <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>
                          <span className="font-medium text-foreground/80">Estado legal:</span>{' '}
                          {result.phaseLabel}
                        </span>
                        <span>
                          <span className="font-medium text-foreground/80">Término:</span>{' '}
                          {result.legalWindow}
                        </span>
                      </span>
                      {(result.applicantValue || result.address) && (
                        <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          {result.applicantValue ? (
                            <span>
                              <span className="font-medium text-foreground/80">{result.applicantLabel}:</span>{' '}
                              {result.applicantValue}
                            </span>
                          ) : null}
                          {result.address ? (
                            <span className="truncate">
                              <span className="font-medium text-foreground/80">Predio:</span>{' '}
                              {result.address}
                            </span>
                          ) : null}
                        </span>
                      )}
                    </span>
                    <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
