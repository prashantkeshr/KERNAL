import { STORAGE_KEYS, UserPreferences, StreakData, QuizScore, SkillEvidenceEntry, PortfolioItem, DeviceProfile } from '@/types/storage';

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function set<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage quota exceeded — silently fail
  }
}

function remove(key: string): void {
  try { localStorage.removeItem(key); } catch { /* ignore */ }
}

/* ─── Theme ──────────────────────────────────────────────── */
export const getTheme = () => get<'dark' | 'light'>(STORAGE_KEYS.THEME, 'dark');
export const setTheme = (v: 'dark' | 'light') => set(STORAGE_KEYS.THEME, v);

/* ─── Mode ───────────────────────────────────────────────── */
export const getMode = () => get<'learn' | 'reference'>(STORAGE_KEYS.MODE, 'learn');
export const setMode = (v: 'learn' | 'reference') => set(STORAGE_KEYS.MODE, v);

/* ─── Last visited ───────────────────────────────────────── */
export const getLastTopic   = () => get<string | null>(STORAGE_KEYS.LAST_TOPIC, null);
export const setLastTopic   = (v: string) => set(STORAGE_KEYS.LAST_TOPIC, v);
export const getLastVisit   = () => get<string | null>(STORAGE_KEYS.LAST_VISIT, null);
export const setLastVisit   = (v: string) => set(STORAGE_KEYS.LAST_VISIT, v);

/* ─── Bookmarks ──────────────────────────────────────────── */
export const getBookmarks   = () => get<string[]>(STORAGE_KEYS.BOOKMARKS, []);
export const addBookmark    = (id: string) => set(STORAGE_KEYS.BOOKMARKS, [...new Set([...getBookmarks(), id])]);
export const removeBookmark = (id: string) => set(STORAGE_KEYS.BOOKMARKS, getBookmarks().filter(b => b !== id));
export const isBookmarked   = (id: string) => getBookmarks().includes(id);

/* ─── Progress ───────────────────────────────────────────── */
export const getProgress     = () => get<Record<string, boolean>>(STORAGE_KEYS.PROGRESS, {});
export const markComplete    = (lessonId: string) => set(STORAGE_KEYS.PROGRESS, { ...getProgress(), [lessonId]: true });
export const markIncomplete  = (lessonId: string) => { const p = getProgress(); delete p[lessonId]; set(STORAGE_KEYS.PROGRESS, p); };
export const isComplete      = (lessonId: string) => getProgress()[lessonId] === true;
export const getCompletedCount = () => Object.values(getProgress()).filter(Boolean).length;

/* ─── Quiz Scores ────────────────────────────────────────── */
export const getQuizScores    = () => get<Record<string, QuizScore>>(STORAGE_KEYS.QUIZ_SCORES, {});
export const saveQuizScore    = (lessonId: string, score: number, total: number) => {
  const scores = getQuizScores();
  const prev = scores[lessonId];
  set(STORAGE_KEYS.QUIZ_SCORES, {
    ...scores,
    [lessonId]: {
      score,
      total,
      attempts: (prev?.attempts ?? 0) + 1,
      lastAttempt: new Date().toISOString(),
    },
  });
};

/* ─── Streak ─────────────────────────────────────────────── */
export const getStreak = () => get<StreakData>(STORAGE_KEYS.STREAK, { count: 0, lastDate: '', longestStreak: 0 });
export const updateStreak = () => {
  const today = new Date().toDateString();
  const streak = getStreak();
  if (streak.lastDate === today) return streak;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const newCount = streak.lastDate === yesterday ? streak.count + 1 : 1;
  const updated: StreakData = {
    count: newCount,
    lastDate: today,
    longestStreak: Math.max(streak.longestStreak, newCount),
  };
  set(STORAGE_KEYS.STREAK, updated);
  return updated;
};

/* ─── Badges ─────────────────────────────────────────────── */
export const getBadges = () => get<string[]>(STORAGE_KEYS.BADGES, []);
export const addBadge  = (id: string) => set(STORAGE_KEYS.BADGES, [...new Set([...getBadges(), id])]);
export const hasBadge  = (id: string) => getBadges().includes(id);

/* ─── Preferences ────────────────────────────────────────── */
const DEFAULT_PREFS: UserPreferences = {
  theme: 'dark', mode: 'learn', fontSize: 16, codeFont: 'Fira Code',
  language: 'en', learningPace: 'standard', autoRunCode: false,
  reduceMotion: false, highContrast: false, dyslexiaFont: false,
};
export const getPrefs = () => get<UserPreferences>(STORAGE_KEYS.PREFS, DEFAULT_PREFS);
export const setPrefs = (prefs: Partial<UserPreferences>) => set(STORAGE_KEYS.PREFS, { ...getPrefs(), ...prefs });

/* ─── Device Profile ─────────────────────────────────────── */
export const getDeviceProfile  = () => get<DeviceProfile | null>(STORAGE_KEYS.DEVICE_PROFILE, null);
export const setDeviceProfile  = (v: DeviceProfile) => set(STORAGE_KEYS.DEVICE_PROFILE, v);

/* ─── Skill Evidence ─────────────────────────────────────── */
export const getSkillEvidence  = () => get<Record<string, SkillEvidenceEntry>>(STORAGE_KEYS.SKILL_EVIDENCE, {});
export const setSkillEvidence  = (id: string, entry: SkillEvidenceEntry) =>
  set(STORAGE_KEYS.SKILL_EVIDENCE, { ...getSkillEvidence(), [id]: entry });

/* ─── Portfolio ──────────────────────────────────────────── */
export const getPortfolio      = () => get<PortfolioItem[]>(STORAGE_KEYS.PORTFOLIO, []);
export const addPortfolioItem  = (item: PortfolioItem) => set(STORAGE_KEYS.PORTFOLIO, [...getPortfolio(), item]);
export const removePortfolioItem = (id: string) => set(STORAGE_KEYS.PORTFOLIO, getPortfolio().filter(p => p.id !== id));

/* ─── Recent Searches ────────────────────────────────────── */
export const getRecentSearches = () => get<string[]>(STORAGE_KEYS.SEARCHES, []);
export const addRecentSearch   = (term: string) => {
  const searches = [term, ...getRecentSearches().filter(s => s !== term)].slice(0, 5);
  set(STORAGE_KEYS.SEARCHES, searches);
};

/* ─── Export / Import ────────────────────────────────────── */
export const exportAllData = () => {
  const keys = Object.values(STORAGE_KEYS);
  const data: Record<string, unknown> = {};
  for (const key of keys) {
    const raw = localStorage.getItem(key);
    if (raw !== null) data[key] = JSON.parse(raw);
  }
  return { version: '1.0', exportedAt: new Date().toISOString(), data };
};

export const importAllData = (exported: ReturnType<typeof exportAllData>) => {
  for (const [key, value] of Object.entries(exported.data)) {
    set(key, value);
  }
};

export const clearAllData = () => {
  for (const key of Object.values(STORAGE_KEYS)) {
    remove(key);
  }
};

export const getStorageEstimate = async (): Promise<{ usage: number; quota: number } | null> => {
  if (!navigator.storage?.estimate) return null;
  try {
    const est = await navigator.storage.estimate();
    return { usage: est.usage ?? 0, quota: est.quota ?? 0 };
  } catch {
    return null;
  }
};
