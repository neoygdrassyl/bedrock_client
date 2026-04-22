import { useState, useEffect, useCallback } from 'react';
import BookmarkService from '../../../../services/bookmark.service';

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

  const toggle = useCallback(
    async (fun0Id, scope, isMarked) => {
      if (isMarked) {
        await BookmarkService.remove(fun0Id, scope);
      } else {
        await BookmarkService.create(fun0Id, scope);
      }
      await refetch();
    },
    [refetch]
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { bookmarks, loading, error, refetch, toggle };
}
