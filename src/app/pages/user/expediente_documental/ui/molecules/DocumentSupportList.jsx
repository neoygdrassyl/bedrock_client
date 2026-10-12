import { Archive, Monitor, ScanLine } from 'lucide-react';
import { ReceiptStatus, ScanStatus } from './DocumentReceiptStatus';

const SUPPORTS = [
  { key: 'physical', label: 'Recepción física', icon: Archive },
  { key: 'digital', label: 'Recepción digital', icon: Monitor },
  { key: 'scan', label: 'Escaneado del físico', icon: ScanLine },
];

/**
 * Received supports of a document (physical, digital, scan of the physical copy).
 * `row` follows the ReceiptStatus contract (mediumPresence / medium); `scanned` the ScanStatus one.
 */
export function DocumentSupportList({ row, scanned }) {
  return (
    <dl className="m-0 space-y-3">
      {SUPPORTS.map(({ key, label, icon: Icon }) => (
        <div key={key} className="flex items-center justify-between gap-[0.75rem]">
          <dt className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {label}
          </dt>
          <dd className="m-0">
            {key === 'scan' ? <ScanStatus scanned={scanned} /> : <ReceiptStatus row={row} medium={key} />}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default DocumentSupportList;
