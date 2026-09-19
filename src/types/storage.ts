export interface UserPreferences {
  theme: 'dark' | 'light' | 'auto';
  mode: 'learn' | 'reference';
  fontSize: number;
  codeFont: string;
  language: string;
  learningPace: 'relaxed' | 'standard' | 'intensive';
  autoRunCode: boolean;
  reduceMotion: boolean;
  highContrast: boolean;
  dyslexiaFont: boolean;
}

export interface StreakData {
  count: number;
  lastDate: string;
  longestStreak: number;
}

export interface QuizScore {
  score: number;
  total: number;
  attempts: number;
  lastAttempt: string;
}

export interface SkillEvidenceEntry {
  level: 'seen' | 'practiced' | 'mastered';
  evidence: {
    quiz?: { score: number; total: number; date: string };
    exercise?: { completed: boolean; date: string };
    debug?: { completed: boolean; date: string };
    project?: { completed: boolean; date: string };
  };
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  skills: string[];
  url?: string;
  code?: string;
  completedAt: string;
}

export interface DeviceProfile {
  ram: number | null;
  cores: number;
  webgpu: boolean;
  wasm: boolean;
  connection: string | null;
  isMobile: boolean;
  storageQuota: number;
  storageUsage: number;
  detectedAt: string;
}

// All localStorage keys
export const STORAGE_KEYS = {
  THEME:          'kernal_theme',
  MODE:           'kernal_mode',
  LAST_VISIT:     'kernal_lastVisit',
  LAST_TOPIC:     'kernal_lastTopic',
  BOOKMARKS:      'kernal_bookmarks',
  SEARCHES:       'kernal_searches',
  PROGRESS:       'kernal_progress',
  QUIZ_SCORES:    'kernal_quiz_scores',
  STREAK:         'kernal_streak',
  BADGES:         'kernal_badges',
  PREFS:          'kernal_prefs',
  DEVICE_PROFILE: 'kernal_deviceProfile',
  ADAPTIVE_STATE: 'kernal_adaptiveState',
  AI_TIER:        'kernal_aiTier',
  LANGUAGE:       'kernal_language',
  SKILL_EVIDENCE: 'kernal_skillEvidence',
  PORTFOLIO:      'kernal_portfolio',
} as const;
