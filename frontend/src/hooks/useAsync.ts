import { useEffect, useState } from 'react';

type AsyncState<T> = { data?: T; loading: boolean; error?: string };

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []): AsyncState<T> & { refetch: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ loading: true });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let mounted = true;
    setState({ loading: true });
    fn()
      .then((data) => mounted && setState({ data, loading: false }))
      .catch((err) =>
        mounted && setState({ loading: false, error: err?.response?.data?.message || err.message || 'Lỗi' })
      );
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version]);

  return { ...state, refetch: () => setVersion((v) => v + 1) };
}
