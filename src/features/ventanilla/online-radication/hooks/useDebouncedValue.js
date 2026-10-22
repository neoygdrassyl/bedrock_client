import { useEffect, useState } from 'react';

export function useDebouncedValue(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timeoutId);
  }, [value, delay]);
  return debounced;
}

/** Current time, refreshed every `interval` ms so relative dates stay accurate. */
export function useNow(interval = 60_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), interval);
    return () => window.clearInterval(intervalId);
  }, [interval]);
  return now;
}
