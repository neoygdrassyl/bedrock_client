import { useCallback, useEffect, useRef, useState } from 'react';

import { errorCode, errorText } from './professionalRegistry.utils';

// The documents of one person in a tab of the detail (certified experiences, validity certificates): the list, the
// write in progress, the delete waiting for confirmation and the download.
//   list(registryId)                       the server's list ({ data: { data: [...] } })
//   create(registryId, form)               adds one; remove(registryId, id, { expectedVersion }) deletes one
//   download(registryId, item)             saves the file of one
//   messages                               { loadFailed, downloadFailed, created, removed }
//   onChanged(text), onConflict()          reload the detail (its version) after a write, or when someone else
//                                          changed the person first
// Only the most recent list request may update the screen: a slow earlier answer must not overwrite a newer one.
export function useRegistryDocuments({ registryId, version, list, create, remove, download, messages, onChanged, onConflict }) {
  const [items, setItems] = useState([]);
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const latestRequest = useRef(0);
  const source = useRef({ list, messages });
  source.current = { list, messages };

  const load = useCallback(async () => {
    const request = latestRequest.current + 1;
    latestRequest.current = request;
    try {
      const response = await source.current.list(registryId);
      if (request !== latestRequest.current) return;
      setItems(response?.data?.data || []);
      setPayload(response?.data ?? null);
      setError('');
    } catch (e) {
      if (request !== latestRequest.current) return;
      setError(errorText(e, source.current.messages.loadFailed));
    } finally {
      if (request === latestRequest.current) setLoading(false);
    }
  }, [registryId]);

  useEffect(() => { load(); }, [load]);

  // Runs one write; true when it was saved. A failure reloads the list and shows the server's answer with showError.
  const write = async (work, success, showError) => {
    setBusy(true);
    try {
      await work();
      await load();
      await onChanged?.(success);
      return true;
    } catch (e) {
      if (errorCode(e) === 'VERSION_CONFLICT') await onConflict?.();
      await load();
      showError(errorText(e));
      return false;
    } finally {
      setBusy(false);
    }
  };

  // buildForm() is called inside the write, so a form that cannot be built is answered like a refused write.
  const add = (buildForm, showError) => write(() => create(registryId, buildForm()), messages.created, showError);

  const removeItem = (item) => write(
    async () => {
      await remove(registryId, item.id, { expectedVersion: version });
      setConfirmId(null);
    },
    messages.removed,
    setError,
  );

  const downloadItem = async (item) => {
    try {
      await download(registryId, item);
    } catch (e) {
      setError(errorText(e, messages.downloadFailed));
    }
  };

  return {
    items, payload, loading, error, setError, busy, confirmId, setConfirmId, add, remove: removeItem, download: downloadItem,
  };
}
