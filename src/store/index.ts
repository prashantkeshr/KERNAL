import { create } from 'zustand';
import * as storage from '@/lib/storage';

interface KernalState {
  // UI
  theme: 'dark' | 'light';
  mode: 'learn' | 'reference';
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;

  // Progress
  progress: Record<string, boolean>;
  quizScores: Record<string, { score: number; total: number; attempts: number; lastAttempt: string }>;
  streak: { count: number; lastDate: string; longestStreak: number };
  badges: string[];

  // Bookmarks
  bookmarks: string[];

  // Preferences
  fontSize: number;

  // Actions
  setTheme: (t: 'dark' | 'light') => void;
  setMode: (m: 'learn' | 'reference') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  markComplete: (lessonId: string) => void;
  markIncomplete: (lessonId: string) => void;
  saveQuizScore: (lessonId: string, score: number, total: number) => void;
  addBadge: (id: string) => void;
  toggleBookmark: (id: string) => void;
  updateStreak: () => void;
  setFontSize: (size: number) => void;
  hydrate: () => void;
}

export const useStore = create<KernalState>((set, get) => ({
  theme: 'dark',
  mode: 'learn',
  sidebarOpen: true,
  commandPaletteOpen: false,
  progress: {},
  quizScores: {},
  streak: { count: 0, lastDate: '', longestStreak: 0 },
  badges: [],
  bookmarks: [],
  fontSize: 16,

  setTheme: (theme) => {
    storage.setTheme(theme);
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme === 'light');
    set({ theme });
  },

  setMode: (mode) => {
    storage.setMode(mode);
    set({ mode });
  },

  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  toggleCommandPalette: () => set(s => ({ commandPaletteOpen: !s.commandPaletteOpen })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  markComplete: (lessonId) => {
    storage.markComplete(lessonId);
    storage.updateStreak();
    const streak = storage.getStreak();
    set(s => ({
      progress: { ...s.progress, [lessonId]: true },
      streak,
    }));
  },

  markIncomplete: (lessonId) => {
    storage.markIncomplete(lessonId);
    set(s => {
      const next = { ...s.progress };
      delete next[lessonId];
      return { progress: next };
    });
  },

  saveQuizScore: (lessonId, score, total) => {
    storage.saveQuizScore(lessonId, score, total);
    set({ quizScores: storage.getQuizScores() });
  },

  addBadge: (id) => {
    storage.addBadge(id);
    set(s => ({ badges: [...new Set([...s.badges, id])] }));
  },

  toggleBookmark: (id) => {
    if (get().bookmarks.includes(id)) {
      storage.removeBookmark(id);
      set(s => ({ bookmarks: s.bookmarks.filter(b => b !== id) }));
    } else {
      storage.addBookmark(id);
      set(s => ({ bookmarks: [...s.bookmarks, id] }));
    }
  },

  updateStreak: () => {
    const streak = storage.updateStreak();
    set({ streak });
  },

  setFontSize: (fontSize) => {
    storage.setPrefs({ fontSize });
    document.documentElement.style.setProperty('--font-size', `${fontSize}px`);
    set({ fontSize });
  },

  hydrate: () => {
    const theme = storage.getTheme();
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme === 'light');
    set({
      theme,
      mode:       storage.getMode(),
      progress:   storage.getProgress(),
      quizScores: storage.getQuizScores(),
      streak:     storage.getStreak(),
      badges:     storage.getBadges(),
      bookmarks:  storage.getBookmarks(),
      fontSize:   storage.getPrefs().fontSize,
    });
  },
}));
