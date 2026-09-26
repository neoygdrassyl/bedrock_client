import { useEffect, useMemo, useState } from 'react';
import { LegacyModal as Modal } from '@/components/legacy-modal';
import Icon from '@/components/icon';
import { Button } from '@/components/ui/button';
import { ProtectedDocumentPreview } from '@/app/components/ProtectedDocument';
import { buildDocumentPreviewUrl } from '@/app/pages/user/shared/expediente-documental.utils';
import './fun_modal_shared.css';

function splitDelimited(value, separator = ',') {
  return String(value ?? '')
    .split(separator)
    .map((part) => part.trim())
    .filter(Boolean);
}

function splitCsv(value) {
  return splitDelimited(value, ',');
}

function splitDocumentNames(value) {
  const rawValue = String(value ?? '');
  return splitDelimited(rawValue, rawValue.includes(';') ? ';' : ',');
}

function normalizeCode(value) {
  return String(value ?? '').trim().toUpperCase();
}

function isPositiveReview(value) {
  const normalized = String(value ?? '').trim().toUpperCase();
  return normalized === 'SI' || normalized === 'SÍ' || normalized === '1' || normalized === 'TRUE';
}

function extractEntries(vr) {
  const nestedEntries = vr?.sub_lists || vr?.Sub_List || vr?.sub_list || vr?.documents;
  if (Array.isArray(nestedEntries) && nestedEntries.length) return nestedEntries;

  if (vr?.code || vr?.documentCode || vr?.list_code || vr?.name || vr?.documentName || vr?.list_name) {
    return [{
      id: vr.sourceId || vr.id || `${vr.id_public || vr.vr_id_public || 'vr'}-${vr.code || vr.documentCode || vr.list_code || 'documento'}`,
      list_code: vr.code || vr.documentCode || vr.list_code,
      list_name: vr.name || vr.documentName || vr.list_name,
      list_pages: vr.page || vr.pages || vr.list_pages,
      origin_state: vr.origin_state,
      medio_recepcion: vr.medio_recepcion,
      previewUrl: vr.previewUrl || vr.preview_url,
      sourceRow: vr,
    }];
  }

  return [];
}

function getVrId(vr) {
  return vr?.id_public || vr?.vr_id_public || vr?.vr || '';
}

function getDigitalDocumentCode(document) {
  return normalizeCode(document?.documentCode || document?.code || document?.id_public);
}

function getDigitalDocumentVr(document) {
  return String(document?.vr || document?.id_replace || document?.vr_id_public || '').trim();
}

function findPreviewDocument({ digitalDocuments, vrId, documentCode }) {
  const normalizedCode = normalizeCode(documentCode);
  if (!normalizedCode) return { document: null, matchType: 'none' };

  const documents = Array.isArray(digitalDocuments) ? digitalDocuments : [];
  const exactVrMatch = documents.find((document) => (
    getDigitalDocumentCode(document) === normalizedCode
    && getDigitalDocumentVr(document) === String(vrId || '').trim()
  ));

  if (exactVrMatch) return { document: exactVrMatch, matchType: 'vr_code' };

  const codeMatch = documents.find((document) => getDigitalDocumentCode(document) === normalizedCode);
  return codeMatch ? { document: codeMatch, matchType: 'code' } : { document: null, matchType: 'none' };
}

function getPreviewMatchLabel(entry) {
  if (entry.previewMatchType === 'vr_code') return 'Archivo del mismo VR';
  if (entry.previewMatchType === 'code') return `Mismo código${entry.previewVr ? ` · ${entry.previewVr}` : ''}`;
  return 'Sin archivo digital';
}

function flattenVrDocuments(vrs, digitalDocuments) {
  const rows = [];
  (Array.isArray(vrs) ? vrs : []).forEach((vr) => {
    const entries = extractEntries(vr);
    entries.forEach((entry, index) => {
      const codes = splitCsv(entry.list_code);
      const names = splitDocumentNames(entry.list_name);
      const pages = splitCsv(entry.list_pages);
      const reviews = splitCsv(entry.list_review);
      const safeCodes = codes.length ? codes : [entry.list_code || entry.documentCode || entry.code].filter(Boolean);

      safeCodes.forEach((code, documentIndex) => {
        const review = reviews[documentIndex] || reviews[0] || entry.list_review;
        if (review && !isPositiveReview(review)) return;

        const vrId = getVrId(vr);
        const documentName = names[documentIndex] || entry.list_name || entry.documentName || entry.name;
        const pageValue = pages[documentIndex] || pages[0] || entry.list_pages || entry.pages || entry.page;
        const { document: previewDocument, matchType } = findPreviewDocument({
          digitalDocuments,
          vrId,
          documentCode: code,
        });
        const rawDocument = previewDocument || entry.sourceRow || entry.raw || entry;
        const previewUrl = buildDocumentPreviewUrl(rawDocument);

        rows.push({
          vrId,
          vrDate: vr.date,
          entryIndex: documentIndex,
          sourceId: entry.id,
          documentCode: code,
          documentName,
          pages: pageValue,
          documentEntryKey: entry.documentEntryKey || `${vr.id_public || vr.vr_id_public || 'vr'}:${entry.id || index}:${documentIndex}:${code || 'documento'}`,
          previewUrl,
          previewMatchType: matchType,
          previewVr: getDigitalDocumentVr(previewDocument),
          raw: {
            ...entry,
            list_code: code,
            list_name: documentName,
            list_pages: pageValue,
            previewUrl,
            previewDocument,
          },
        });
      });
    });
  });
  return rows;
}

export default function RequirementManagementModal({ open, requirement, vrs, digitalDocuments, onClose, onLink }) {
  const [previewEntry, setPreviewEntry] = useState(null);
  const [search, setSearch] = useState('');
  const candidates = useMemo(() => flattenVrDocuments(vrs, digitalDocuments), [digitalDocuments, vrs]);
  const visibleCandidates = useMemo(() => {
    const requirementCode = normalizeCode(requirement?.code);
    const normalizedSearch = search.trim().toLowerCase();

    return candidates
      .filter((entry) => {
        if (!normalizedSearch) return true;
        return [entry.documentCode, entry.documentName, entry.vrId, entry.vrDate]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);
      })
      .sort((a, b) => {
        const aSameRequirement = normalizeCode(a.documentCode) === requirementCode ? 0 : 1;
        const bSameRequirement = normalizeCode(b.documentCode) === requirementCode ? 0 : 1;
        if (aSameRequirement !== bSameRequirement) return aSameRequirement - bSameRequirement;

        const aHasPreview = a.previewUrl ? 0 : 1;
        const bHasPreview = b.previewUrl ? 0 : 1;
        if (aHasPreview !== bHasPreview) return aHasPreview - bHasPreview;

        return String(a.documentName || '').localeCompare(String(b.documentName || ''));
      });
  }, [candidates, requirement?.code, search]);

  useEffect(() => {
    if (!open) {
      setPreviewEntry(null);
      setSearch('');
      return;
    }

    const requirementCode = normalizeCode(requirement?.code);
    const bestPreview = candidates.find((entry) => normalizeCode(entry.documentCode) === requirementCode && entry.previewUrl)
      || candidates.find((entry) => entry.previewUrl)
      || null;
    setPreviewEntry(bestPreview);
  }, [candidates, open, requirement?.code]);

  if (!open || !requirement) return null;

  return (
    <Modal
      isOpen={open}
      onRequestClose={onClose}
      className="fun-modal-content max-w-7xl"
      overlayClassName="fun-modal-overlay"
      contentLabel="Gestionar requisito documental"
      ariaHideApp={false}
    >
      <div className="flex items-start justify-between gap-4 border-b border-border pb-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Gestionar requisito</p>
          <h3 className="text-lg font-semibold text-foreground">{requirement.code} · {requirement.label}</h3>
        </div>
        <Button type="button" variant="ghost" size="sm" className="min-h-[44px]" onClick={onClose}>
          Cerrar
        </Button>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.75fr)]">
        <div className="min-w-0 rounded-xl border border-border">
          <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/40 px-4 py-2">
            <div>
              <p className="text-sm font-semibold text-foreground">Documentos candidatos</p>
              <p className="text-xs text-muted-foreground">Contrasta primero por VR + código; si no existe, usa el archivo digital del mismo código.</p>
            </div>
            <span className="rounded-full bg-background px-2 py-1 text-xs font-semibold text-muted-foreground">{visibleCandidates.length}/{candidates.length}</span>
          </div>
          <div className="border-b border-border px-4 py-3">
            <label className="sr-only" htmlFor="requirement-document-search">Filtrar documentos candidatos</label>
            <input
              id="requirement-document-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="min-h-[44px] w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Filtrar por código, nombre o VR..."
            />
          </div>
          <div className="max-h-[min(62vh,640px)] overflow-auto">
            {visibleCandidates.map((entry) => {
              const sameRequirementCode = normalizeCode(entry.documentCode) === normalizeCode(requirement?.code);
              return (
              <div key={`${entry.vrId}-${entry.sourceId}-${entry.entryIndex}-${entry.documentCode}`} className="grid gap-3 border-b border-border px-4 py-3 text-sm last:border-b-0 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] font-semibold text-muted-foreground">{entry.documentCode || 'SIN CÓDIGO'}</span>
                    {sameRequirementCode && <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700">Coincide con requisito</span>}
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-semibold text-primary">{getPreviewMatchLabel(entry)}</span>
                  </div>
                  <p className="max-h-10 overflow-hidden break-words text-[13px] font-semibold leading-5 text-foreground" title={entry.documentName || entry.documentCode || 'Documento sin nombre'}>
                    {entry.documentName || entry.documentCode || 'Documento sin nombre'}
                  </p>
                  <p className="text-xs text-muted-foreground">VR entrada: {entry.vrId || 'Sin VR'} · {entry.vrDate || 'sin fecha'} · folios {entry.pages || 'N/D'}</p>
                </div>
                <div className="flex shrink-0 justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="min-h-[44px]"
                    disabled={!entry.previewUrl}
                    onClick={() => setPreviewEntry(entry)}
                    aria-label={`Previsualizar ${entry.documentName || entry.documentCode || 'documento'}`}
                  >
                    <Icon icon="mdi:eye-outline" className="mr-1 h-4 w-4" /> Ver
                  </Button>
                  <Button type="button" size="sm" className="min-h-[44px]" onClick={() => onLink?.(entry)}>
                    Elegir
                  </Button>
                </div>
              </div>
              );
            })}
            {!visibleCandidates.length && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">No hay documentos candidatos para relacionar.</div>
            )}
          </div>
        </div>

        <div className="min-w-0 rounded-xl border border-border bg-background p-3">
          <div className="mb-2">
            <p className="text-sm font-semibold text-foreground">Previsualización</p>
            {previewEntry && <p className="text-xs text-muted-foreground">{previewEntry.documentCode} · {previewEntry.documentName}</p>}
          </div>
          {previewEntry ? (
            <ProtectedDocumentPreview
              title="Previsualización de documento"
              className="h-[min(62vh,640px)] min-h-[420px] w-full rounded-lg border border-border"
              source={previewEntry.previewUrl}
            />
          ) : (
            <div className="flex h-[min(62vh,640px)] min-h-[420px] items-center justify-center rounded-lg border border-dashed border-border px-4 text-center text-sm text-muted-foreground">
              Selecciona un documento para previsualizar.
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
