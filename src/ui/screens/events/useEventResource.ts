import { useEffect, useState } from 'react';

// Cada recurso possui seu próprio erro: falhar em presenças não bloqueia a agenda.
export function useEventResource<T>(load: (signal: AbortSignal) => Promise<T>) {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<unknown>();
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal).then(value => {
      if (!controller.signal.aborted) {
        setData(value);
        setLoading(false);
      }
    }).catch(reason => {
      if (!controller.signal.aborted) {
        setError(reason);
        setLoading(false);
      }
    });
    return () => controller.abort();
  }, [load, attempt]);

  function retry() {
    setError(undefined);
    setData(undefined);
    setLoading(true);
    setAttempt(value => value + 1);
  }

  return { data, error, loading, retry, setData };
}
