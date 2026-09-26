import { useEffect, useState } from 'react';
import { documentaryError, getDocumentaryConfigurations, getDocumentaryView } from '../../../../services/documentary.service';

export function useDocumentaryView(fun0Id) {
  const [configurationId, setConfigurationId] = useState('');
  const [revision, setRevision] = useState(0);
  const [inventory, setInventory] = useState({ configurations: [], loading: true, error: '' });
  const [result, setResult] = useState({ key: '', view: null, loading: true, error: '' });
  const key = `${fun0Id}:${configurationId}:${revision}`;

  useEffect(() => {
    const controller = new AbortController();
    setInventory({ configurations: [], loading: true, error: '' });
    getDocumentaryConfigurations(controller.signal).then((configurations) => {
      if (!controller.signal.aborted) setInventory({ configurations, loading: false, error: '' });
    }).catch((error) => {
      if (!controller.signal.aborted) setInventory({ configurations: [], loading: false, error: documentaryError(error) });
    });
    return () => controller.abort();
  }, [fun0Id, revision]);

  useEffect(() => {
    const controller = new AbortController();
    setResult({ key, view: null, loading: true, error: '' });
    getDocumentaryView(fun0Id, configurationId, controller.signal).then((view) => {
      if (!controller.signal.aborted) setResult({ key, view, loading: false, error: '' });
    }).catch((error) => {
      if (!controller.signal.aborted) setResult({ key, view: null, loading: false, error: documentaryError(error) });
    });
    return () => controller.abort();
  }, [fun0Id, configurationId, key]);

  return {
    configurationId, setConfigurationId, inventory,
    ...(result.key === key ? result : { view: null, loading: true, error: '' }),
    refresh: () => setRevision((value) => value + 1),
  };
}
