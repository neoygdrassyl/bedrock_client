import { Button } from '@/shared/ui/button';

const ROW_CLASS = 'border-t border-border/60 align-top';
const CELL_CLASS = 'px-1 py-1';

// The file of a row: a link that downloads it, or `missing` when the row has none.
function DownloadCell({ item, file, onDownload }) {
  if (file.available && !file.available(item)) return <span className="text-muted-foreground">{file.missing}</span>;
  return (
    <Button type="button" variant="link" size="sm" className={file.className} aria-label={file.label(item)} onClick={() => onDownload(item)}>
      {file.text(item)}
    </Button>
  );
}

// Delete with a confirmation step; `readOnly` is shown instead when the person cannot be written.
function ActionCell({ item, writable, busy, confirmId, onConfirm, onRemove, readOnly }) {
  return (
    <td className={CELL_CLASS}>
      {writable && confirmId === item.id ? (
        <span className="flex flex-wrap items-center gap-1">
          ¿Eliminar?
          <Button type="button" size="sm" variant="destructive" disabled={busy} onClick={() => onRemove(item)}>Confirmar</Button>
          <Button type="button" size="sm" variant="outline" onClick={() => onConfirm(null)}>Cancelar</Button>
        </span>
      ) : null}
      {writable && confirmId !== item.id ? (
        <Button type="button" size="sm" variant="outline" onClick={() => onConfirm(item.id)}>Eliminar</Button>
      ) : null}
      {!writable ? readOnly : null}
    </td>
  );
}

// The documents table of a detail tab, titled `title`, with an "Acción" column (delete with confirmation) after
// `columns`. A column is { header, className, cell(item) } or { header, className, file } for the download link,
// file = { text(item), label(item), className, available(item), missing }. rowProps(item) gives the <tr> attributes.
// documents = useRegistryDocuments(...).
export default function RegistryDocumentTable({ title, columns, documents, writable, rowProps, readOnly = null, emptyText }) {
  const { items, loading, busy, confirmId, setConfirmId, remove, download } = documents;
  return (
    <>
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <div className="max-w-full overflow-x-auto">
        <table className="w-full text-sm" aria-label={title}>
          <thead>
            <tr className="text-left text-xs uppercase text-muted-foreground">
              {columns.map((column) => <th key={column.header} className={CELL_CLASS}>{column.header}</th>)}
              <th className={CELL_CLASS}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className={ROW_CLASS} {...(rowProps ? rowProps(item) : {})}>
                {columns.map((column) => (
                  <td key={column.header} className={column.className || CELL_CLASS}>
                    {column.file ? <DownloadCell item={item} file={column.file} onDownload={download} /> : column.cell(item)}
                  </td>
                ))}
                <ActionCell item={item} writable={writable} busy={busy} confirmId={confirmId} onConfirm={setConfirmId} onRemove={remove} readOnly={readOnly} />
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && !items.length ? <p className="py-2 text-sm text-muted-foreground">{emptyText}</p> : null}
        {loading ? <p className="py-2 text-sm text-muted-foreground">Cargando…</p> : null}
      </div>
    </>
  );
}
