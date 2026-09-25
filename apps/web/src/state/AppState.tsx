import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { CurrencyCode } from '@omnikit/core';

import { readJson, writeJson } from './storage';

export type ThemePreference = 'light' | 'dark' | 'system';

interface RecentEntry {
  id: string;
  at: number;
}

interface AppState {
  favorites: string[];
  recents: RecentEntry[];
  usage: Record<string, number>;
  filesProcessed: number;
  theme: ThemePreference;
  currency: CurrencyCode;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  recordVisit: (id: string) => void;
  recordFiles: (count: number) => void;
  setTheme: (theme: ThemePreference) => void;
  setCurrency: (currency: CurrencyCode) => void;
  clearHistory: () => void;
}

const Ctx = createContext<AppState | null>(null);

const KEYS = {
  favorites: 'omnikit:favorites',
  recents: 'omnikit:recents',
  usage: 'omnikit:usage',
  files: 'omnikit:files',
  theme: 'omnikit:theme',
  currency: 'omnikit:currency',
};

const MAX_RECENTS = 8;

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>(() => readJson(KEYS.favorites, []));
  const [recents, setRecents] = useState<RecentEntry[]>(() => readJson(KEYS.recents, []));
  const [usage, setUsage] = useState<Record<string, number>>(() => readJson(KEYS.usage, {}));
  const [filesProcessed, setFilesProcessed] = useState<number>(() => readJson(KEYS.files, 0));
  const [theme, setTheme] = useState<ThemePreference>(() => readJson(KEYS.theme, 'system'));
  const [currency, setCurrency] = useState<CurrencyCode>(() => readJson(KEYS.currency, 'INR'));

  useEffect(() => writeJson(KEYS.currency, currency), [currency]);

  useEffect(() => writeJson(KEYS.favorites, favorites), [favorites]);
  useEffect(() => writeJson(KEYS.recents, recents), [recents]);
  useEffect(() => writeJson(KEYS.usage, usage), [usage]);
  useEffect(() => writeJson(KEYS.files, filesProcessed), [filesProcessed]);
  useEffect(() => {
    writeJson(KEYS.theme, theme);
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  }, []);

  const recordVisit = useCallback((id: string) => {
    setRecents((r) => [{ id, at: Date.now() }, ...r.filter((x) => x.id !== id)].slice(0, MAX_RECENTS));
    setUsage((u) => ({ ...u, [id]: (u[id] ?? 0) + 1 }));
  }, []);

  const recordFiles = useCallback((count: number) => setFilesProcessed((n) => n + count), []);

  const clearHistory = useCallback(() => {
    setRecents([]);
    setUsage({});
    setFilesProcessed(0);
  }, []);

  const value = useMemo<AppState>(
    () => ({
      favorites,
      recents,
      usage,
      filesProcessed,
      theme,
      currency,
      setCurrency,
      isFavorite: (id) => favorites.includes(id),
      toggleFavorite,
      recordVisit,
      recordFiles,
      setTheme,
      clearHistory,
    }),
    [favorites, recents, usage, filesProcessed, theme, currency, toggleFavorite, recordVisit, recordFiles, clearHistory],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAppState must be used inside <AppStateProvider>');
  return ctx;
}
