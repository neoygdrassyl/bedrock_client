import { useState, useEffect, useCallback } from 'react';
import BookmarkService from '../../../../services/bookmark.service';

function normalizeScope(scope) {
  return scope === 'user' ? 'personal' : scope;
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await BookmarkService.list();
      const list = Array.isArray(resp.data) ? resp.data : resp.data?.data ?? [];
      setBookmarks(list);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const setScope = useCallback(
    async (fun0Id, scope, shouldMark) => {
      const normalizedScope = normalizeScope(scope);
      setError(null);

      try {
        if (shouldMark) {
          await BookmarkService.create(fun0Id, normalizedScope);
        } else {
          await BookmarkService.remove(fun0Id, normalizedScope);
        }
        await refetch();
      } catch (err) {
        setError(err);
        throw err;
      }
    },
    [refetch]
  );

  const toggleScope = useCallback(
    async (fun0Id, scope, currentState) => {
      await setScope(fun0Id, scope, !currentState);
    },
    [setScope]
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { bookmarks, loading, error, refetch, setScope, toggleScope };
}
