export function getHistoryDocumentLabel(history) {
  if (history?.documentName) return history.documentName;
  return Number(history?.sequence) === 1 ? 'FUN ENTRADA' : `FUN VERSION ${history?.sequence || ''}`.trim();
}

export function formatHistoryDate(historyDate) {
  const [year, month, day] = String(historyDate || '').split('-');
  return year && month && day ? `${day}/${month}/${year}` : 'Sin fecha';
}
