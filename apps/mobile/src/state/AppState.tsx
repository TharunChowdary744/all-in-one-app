import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

interface RecentEntry {
  id: string;
  at: number;
}

interface Persisted {
  favorites: string[];
  recents: RecentEntry[];
  usage: Record<string, number>;
  filesProcessed: number;
}

interface AppState extends Persisted {
  ready: boolean;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  recordVisit: (id: string) => void;
  recordFiles: (count: number) => void;
  clearHistory: () => void;
}

const KEY = 'omnikit:state:v1';
const MAX_RECENTS = 8;
const initial: Persisted = { favorites: [], recents: [], usage: {}, filesProcessed: 0 };

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => raw && setState({ ...initial, ...(JSON.parse(raw) as Partial<Persisted>) }))
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => undefined);
  }, [state, ready]);

  const toggleFavorite = useCallback((id: string) => {
    setState((s) => ({ ...s, favorites: s.favorites.includes(id) ? s.favorites.filter((x) => x !== id) : [...s.favorites, id] }));
  }, []);

  const recordVisit = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      recents: [{ id, at: Date.now() }, ...s.recents.filter((r) => r.id !== id)].slice(0, MAX_RECENTS),
      usage: { ...s.usage, [id]: (s.usage[id] ?? 0) + 1 },
    }));
  }, []);

  const recordFiles = useCallback((count: number) => setState((s) => ({ ...s, filesProcessed: s.filesProcessed + count })), []);
  const clearHistory = useCallback(() => setState((s) => ({ ...s, recents: [], usage: {}, filesProcessed: 0 })), []);

  const value = useMemo<AppState>(
    () => ({
      ...state,
      ready,
      isFavorite: (id) => state.favorites.includes(id),
      toggleFavorite,
      recordVisit,
      recordFiles,
      clearHistory,
    }),
    [state, ready, toggleFavorite, recordVisit, recordFiles, clearHistory],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAppState must be used inside <AppStateProvider>');
  return ctx;
}
