import { useCallback, useEffect, useState } from 'react';

/**
 * Loads data for a page and keeps the three states a screen has to show:
 * loading, error and the data itself. `reload` refetches after a write.
 */
export function useLoad(loader, deps = []) {
  const [state, setState] = useState({ loading: true, error: '', data: null });
  const load = useCallback(loader, deps); // eslint-disable-line react-hooks/exhaustive-deps

  const reload = useCallback(async () => {
    try {
      const data = await load();
      setState({ loading: false, error: '', data });
    } catch (error) {
      setState({ loading: false, error: error.message, data: null });
    }
  }, [load]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { ...state, reload };
}
