import { useEffect, useState } from 'react';

// Cada recurso possui seu próprio erro: falhar em presenças não bloqueia a agenda.
export function useEventResource<T>(load: (signal: AbortSignal) => Promise<T>, refreshInterval?: number) {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<unknown>();
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let pending = false;
    const refresh = () => {
      if (pending || controller.signal.aborted) return;
      pending = true;
      void load(controller.signal).then(value => {
        if (!controller.signal.aborted) {
          setData(value);
          setError(undefined);
          setLoading(false);
        }
      }).catch(reason => {
        if (!controller.signal.aborted) {
          setError(reason);
          setLoading(false);
        }
      }).finally(() => { pending = false; });
    };
    const refreshVisible = () => { if (!document.hidden) refresh(); };
    refresh();
    const timer = refreshInterval ? window.setInterval(refreshVisible, refreshInterval) : undefined;
    if (refreshInterval) document.addEventListener('visibilitychange', refreshVisible);
    return () => {
      controller.abort();
      if (timer) window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refreshVisible);
    };
  }, [load, attempt, refreshInterval]);

  function retry() {
    setError(undefined);
    setData(undefined);
    setLoading(true);
    setAttempt(value => value + 1);
  }

  return { data, error, loading, retry, setData };
}
