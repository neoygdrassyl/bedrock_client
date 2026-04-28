import { useCallback, useEffect, useRef, useState } from 'react';
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
import CustomService from '../services/custom.service';
import CubXVrService from '../services/cubXvr.service';

const MIN_QUERY_LENGTH = 3;
const RESULT_LIMIT = 8;

function normalizePayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return payload ? [payload] : [];
}

function normalizeQuery(value) {
  return String(value || '').trim();
}

function looksLikeExpedienteId(value) {
  return value.startsWith('68001-') || /^\d{5}-/.test(value);
}

function isNumericLookup(value) {
  return /^\d{5,}$/.test(value.replace(/\D/g, ''));
}

function pickPublicId(item, fallback = '') {
  return item?.id_public || item?.id_publico || item?.id_global || item?.fun || item?.pqrs || item?.vr || fallback;
}

function buildResultHref(item, source, idPublic) {
  const normalizedId = String(idPublic || '').trim();

  if (looksLikeExpedienteId(normalizedId)) {
    return `/funmanage/expediente/${encodeURIComponent(normalizedId)}`;
  }

  if (item?.fun && looksLikeExpedienteId(String(item.fun))) {
    return `/funmanage/expediente/${encodeURIComponent(item.fun)}`;
  }

  if (source === 'nomenclatura') return '/nomenclatura';
  if (source === 'pqrs' || item?.pqrs) return '/peticiones';
  if (source === 'vr') return '/ventanilla';

  return '/dashboard';
}

function formatState(item, source) {
  const rawState = item?.state ?? item?.status;
  if (rawState == null || rawState === '') return 'Estado no informado';

  const numericState = Number(rawState);
  if (!Number.isFinite(numericState)) return String(rawState);

  if (source === 'pqrs' || item?.time != null || item?.reply_formal != null) {
    if (numericState === 0) return 'En trámite';
    if (numericState === 1) return 'Cerrada';
    return `Estado ${numericState}`;
  }

  if (numericState < 0) return 'Incompleta';
  if (numericState === 0) return 'Borrador';
  if (numericState < 100) return 'Activa';
  return 'Cerrada';
}

function getStatusTone(label) {
  if (/activa|trámite/i.test(label)) return 'text-accent';
  if (/incompleta|borrador/i.test(label)) return 'text-warning';
  if (/cerrada/i.test(label)) return 'text-muted-foreground';
  return 'text-foreground';
}

function normalizeStatusResults(payload, plan, term) {
  return normalizePayload(payload).filter(Boolean).map((item, index) => {
    const idPublic = pickPublicId(item, term);
    const resolvedSource = plan.source === 'vr' && (item?.time != null || item?.reply_formal != null || item?.worker_names)
      ? 'pqrs'
      : plan.source;
    const stateLabel = formatState(item, resolvedSource);
    const href = buildResultHref(item, resolvedSource, idPublic);
    const title = item.tramite || item.tipo || item.type || item.worker_names || plan.emptyTitle;
    const detail = [item.m_lic || item.m_urb || item.m_sub, item.legal, item.reply_formal]
      .filter(Boolean)
      .join(' · ');

    return {
      key: `${plan.key}-${idPublic}-${index}`,
      icon: plan.icon,
      category: plan.category,
      title,
      idPublic,
      description: detail || plan.description,
      stateLabel,
      stateClassName: getStatusTone(stateLabel),
      href,
    };
  });
}

function normalizeVrMappingResults(payload, term) {
  return normalizePayload(payload).filter(Boolean).map((item, index) => {
    const target = item.fun || item.pqrs || item.vr || term;
    const title = item.fun
      ? `VR asociada al expediente ${item.fun}`
      : item.pqrs
        ? `VR asociada a PQRS ${item.pqrs}`
        : `Ventanilla Única ${item.vr || term}`;

    return {
      key: `vr-map-${target}-${index}`,
      icon: 'FileInput',
      category: 'VR',
      title,
      idPublic: item.vr || term,
      description: item.desc || item.process || item.date || 'Relación registrada en Ventanilla Única',
      stateLabel: item.fun || item.pqrs ? 'Relacionada' : 'Registrada',
      stateClassName: 'text-accent',
      href: buildResultHref(item, 'vr', target),
    };
  });
}

function getSearchPlans(term) {
  const normalizedTerm = normalizeQuery(term);
  const upperTerm = normalizedTerm.toUpperCase();

  if (!normalizedTerm || normalizedTerm.length < MIN_QUERY_LENGTH) return [];

  if (upperTerm.startsWith('VR')) {
    return [
      {
        key: 'vr-status',
        source: 'vr',
        category: 'Estado VR',
        icon: 'FileInput',
        emptyTitle: 'Ventanilla Única',
        description: 'Consulta puntual de estado por VR',
        run: () => CustomService.checkStatus_vr(normalizedTerm),
        normalize: (payload) => normalizeStatusResults(payload, {
          key: 'vr-status',
          source: 'vr',
          category: 'Estado VR',
          icon: 'FileInput',
          emptyTitle: 'Ventanilla Única',
          description: 'Consulta puntual de estado por VR',
        }, normalizedTerm),
      },
      {
        key: 'vr-map',
        run: () => CubXVrService.getByVR(normalizedTerm),
        normalize: (payload) => normalizeVrMappingResults(payload, normalizedTerm),
      },
    ];
  }

  if (looksLikeExpedienteId(upperTerm)) {
    return [{
      key: 'licencia',
      source: 'licencia',
      category: 'Expediente',
      icon: 'FolderOpen',
      emptyTitle: 'Expediente urbanístico',
      description: 'Consulta puntual de expediente',
      run: () => CustomService.checkStatus_Lc(normalizedTerm),
      normalize: (payload) => normalizeStatusResults(payload, {
        key: 'licencia',
        source: 'licencia',
        category: 'Expediente',
        icon: 'FolderOpen',
        emptyTitle: 'Expediente urbanístico',
        description: 'Consulta puntual de expediente',
      }, normalizedTerm),
    }];
  }

  if (upperTerm.startsWith('N')) {
    return [{
      key: 'nomenclatura',
      source: 'nomenclatura',
      category: 'Nomenclatura',
      icon: 'Signpost',
      emptyTitle: 'Nomenclatura',
      description: 'Consulta puntual de nomenclatura',
      run: () => CustomService.checkStatus_Nr(normalizedTerm),
      normalize: (payload) => normalizeStatusResults(payload, {
        key: 'nomenclatura',
        source: 'nomenclatura',
        category: 'Nomenclatura',
        icon: 'Signpost',
        emptyTitle: 'Nomenclatura',
        description: 'Consulta puntual de nomenclatura',
      }, normalizedTerm),
    }];
  }

  if (isNumericLookup(upperTerm)) {
    return [{
      key: 'identificacion',
      source: 'identificacion',
      category: 'Identificación',
      icon: 'UserRoundSearch',
      emptyTitle: 'Proceso asociado',
      description: 'Resultado asociado a una identificación',
      run: () => CustomService.checkStatus_In(normalizedTerm),
      normalize: (payload) => normalizeStatusResults(payload, {
        key: 'identificacion',
        source: 'identificacion',
        category: 'Identificación',
        icon: 'UserRoundSearch',
        emptyTitle: 'Proceso asociado',
        description: 'Resultado asociado a una identificación',
      }, normalizedTerm),
    }];
  }

  return [{
    key: 'pqrs',
    source: 'pqrs',
    category: 'PQRS',
    icon: 'FileSpreadsheet',
    emptyTitle: 'Petición PQRS',
    description: 'Consulta puntual de petición',
    run: () => CustomService.checkStatus_Jur(normalizedTerm),
    normalize: (payload) => normalizeStatusResults(payload, {
      key: 'pqrs',
      source: 'pqrs',
      category: 'PQRS',
      icon: 'FileSpreadsheet',
      emptyTitle: 'Petición PQRS',
      description: 'Consulta puntual de petición',
    }, normalizedTerm),
  }];
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
  const [status, setStatus] = useState('idle');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return undefined;
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  const handleSearch = useCallback(async (event) => {
    event?.preventDefault();
    const term = normalizeQuery(query);
    const plans = getSearchPlans(term);

    if (plans.length === 0) {
      setStatus('idle');
      setResults([]);
      setError(`Escribe al menos ${MIN_QUERY_LENGTH} caracteres para consultar.`);
      return;
    }

    setStatus('loading');
    setError('');
    setResults([]);

    const settledLookups = await Promise.allSettled(plans.map((plan) => plan.run()));
    const nextResults = settledLookups.flatMap((lookup, index) => {
      if (lookup.status !== 'fulfilled') return [];
      return plans[index].normalize(lookup.value?.data);
    });

    const failedCount = settledLookups.filter((lookup) => lookup.status === 'rejected').length;
    const uniqueResults = dedupeResults(nextResults);

    setResults(uniqueResults);
    setStatus('done');
    if (failedCount === settledLookups.length) {
      setError('No fue posible consultar en este momento. Intenta de nuevo.');
    } else if (uniqueResults.length === 0) {
      setError('No encontramos procesos con ese criterio.');
    }
  }, [query]);

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
            Búsqueda global
          </DialogTitle>
          <DialogDescription>
            Consulta puntual por expediente, VR, nomenclatura, PQRS o identificación.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSearch} className="border-b border-border/60 p-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ej. 68001-1-26-0001, VR26-0001, N26-0001 o cédula"
              className="h-10"
              aria-label="Criterio de búsqueda global"
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={status === 'loading'} className="min-w-24">
                {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Buscar
              </Button>
              {query && (
                <Button type="button" variant="outline" onClick={clearSearch}>
                  Limpiar
                </Button>
              )}
            </div>
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
                        <span className={`text-xs font-medium ${result.stateClassName}`}>{result.stateLabel}</span>
                      </span>
                      <span className="mt-1 block truncate text-sm font-medium text-foreground">{result.title}</span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">{result.description}</span>
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