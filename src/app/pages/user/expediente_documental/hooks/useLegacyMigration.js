import { useCallback, useEffect, useRef, useState } from 'react';
import { documentaryError } from '@/app/services/documentary.service';
import { commitLegacyMigration, previewLegacyMigration } from '@/app/services/legacyMigration.service';
import { buildResolutions, commitCommand } from '../legacyMigrationModel';

/**
 * State of the legacy -> documentary migration of one expediente: release choice,
 * analysis (preview), resolutions of digital files without VR and the commit.
 */
export function useLegacyMigration(fun0Id) {
  const [configurationId, setConfigurationId] = useState(null);
  const [preview, setPreview] = useState(null);
  const [choices, setChoices] = useState({});
  const [loading, setLoading] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const abort = useRef(null);
  // One idempotency key per analyzed plan: a retried commit replays instead of duplicating.
  const command = useRef(null);

  useEffect(() => () => { if (abort.current) abort.current.abort(); }, []);

  const analyze = useCallback(async (nextChoices) => {
    if (abort.current) abort.current.abort();
    const controller = new AbortController();
    abort.current = controller;
    const selected = nextChoices || choices;
    setLoading(true); setError('');
    try {
      const value = await previewLegacyMigration(fun0Id, { configurationId, resolutions: buildResolutions(selected) }, controller.signal);
      if (controller.signal.aborted) return;
      setPreview(value);
      if (configurationId == null) setConfigurationId(value.release.configurationId);
      command.current = null;
    } catch (failure) {
      if (!controller.signal.aborted) setError(documentaryError(failure));
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [fun0Id, configurationId, choices]);

  function chooseRelease(value) {
    setConfigurationId(value == null ? null : Number(value));
    setPreview(null);
  }

  function choose(fun6Id, value) {
    setChoices((current) => Object.assign({}, current, { [fun6Id]: value }));
  }

  const resolutionsChanged = Boolean(preview) && JSON.stringify(buildResolutions(choices)) !== JSON.stringify(preview.resolutions);

  async function commit(reason) {
    if (!preview || committing) return null;
    setCommitting(true); setError('');
    try {
      if (!command.current) command.current = commitCommand(preview, buildResolutions(choices), reason, crypto.randomUUID());
      const value = await commitLegacyMigration(fun0Id, command.current);
      setResult(value);
      return value;
    } catch (failure) {
      // A rejected command (plan changed, blocked) needs a new analysis and a new key.
      if (failure.response) command.current = null;
      setError(documentaryError(failure));
      return null;
    } finally { setCommitting(false); }
  }

  return { configurationId, chooseRelease, preview, analyze, loading, choices, choose, resolutionsChanged, commit, committing, error, result };
}
