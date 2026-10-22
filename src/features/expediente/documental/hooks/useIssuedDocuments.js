import { useEffect, useState } from 'react';
import CubXVrDataService from '@/features/expediente/api/cubXvr.service';

const LOAD_ERROR = 'No fue posible consultar los documentos expedidos del expediente.';

// Newest first; rows without a date keep their server order at the end.
function byDateDesc(left, right) {
  const a = Date.parse(left.date || '');
  const b = Date.parse(right.date || '');
  if (Number.isNaN(a) && Number.isNaN(b)) return 0;
  if (Number.isNaN(a)) return 1;
  if (Number.isNaN(b)) return -1;
  return b - a;
}

/**
 * Read-only outgoing documents of an expediente, taken from the CUB registry
 * (`cub_x_vr`, keyed by the expediente public id).
 */
export function useIssuedDocuments(idPublic) {
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState(null);
  const key = `${idPublic || ''}:${revision}`;
  useEffect(() => {
    if (!idPublic) return undefined;
    let active = true;
    CubXVrDataService.getByFUN(idPublic)
      .then((response) => {
        if (!active) return;
        const rows = Array.isArray(response?.data) ? [...response.data].sort(byDateDesc) : [];
        setResult({ key, rows, error: '' });
      })
      .catch(() => { if (active) setResult({ key, rows: [], error: LOAD_ERROR }); });
    return () => { active = false; };
  }, [idPublic, key]);
  const current = result?.key === key ? result : null;
  return {
    rows: current?.rows || [],
    error: current?.error || '',
    loading: Boolean(idPublic) && !current,
    refresh: () => setRevision((value) => value + 1),
  };
}
