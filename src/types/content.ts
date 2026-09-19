export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type ContentStatus = 'draft' | 'review' | 'published' | 'deprecated' | 'archived';

export interface Technology {
  id: string;
  name: string;
  icon: string;
  color: string;
  order: number;
  stage: number;
  playground: string;
  enabled: boolean;
  description: string;
  estimatedHours?: number;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  version: string;
  icon: string;
  color: string;
  difficulty: Difficulty;
  estimatedHours: number;
  modules: string[];
  prerequisites: string[];
  certificationAvailable: boolean;
}

export interface LessonMeta {
  id: string;
  title: string;
  subtitle: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  status: ContentStatus;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: LessonMeta[];
  order: number;
}

/* ─── Content Blocks ─────────────────────────────────────── */

export interface ParagraphBlock { type: 'paragraph'; text: string }
export interface HeadingBlock   { type: 'heading'; level: 2 | 3 | 4; text: string }
export interface ListBlock       { type: 'list'; ordered: boolean; items: string[] }
export interface DividerBlock    { type: 'divider' }

export interface CodeBlock {
  type: 'code';
  lang: string;
  filename?: string;
  code: string;
  caption?: string;
}

export interface TipBlock     { type: 'tip';     text: string }
export interface WarningBlock { type: 'warning'; text: string }
export interface InfoBlock    { type: 'info';    text: string }

export interface DefinitionBlock {
  type: 'definition';
  term: string;
  meaning: string;
}

export interface VideoBlock {
  type: 'video';
  youtubeId: string;
  title?: string;
}

export interface PlaygroundBlock {
  type: 'playground';
  lang: string;
  starterCode: string;
  title?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false';
  options?: string[];
  correctAnswer: number | string;
  explanation: string;
}

export interface QuizBlock {
  type: 'quiz';
  questions: QuizQuestion[];
}

export interface ExerciseBlock {
  type: 'exercise';
  title: string;
  description: string;
  starterCode: string;
  solution: string;
  hints?: string[];
  language?: string;
}

export interface DebugChallenge {
  type: 'debugChallenge';
  id: string;
  title: string;
  description?: string;
  brokenCode: string;
  language: string;
  hints: string[];
  solution: string;
  explanation: string;
}

export interface ProjectBlock {
  type: 'project';
  title: string;
  description: string;
  requirements: string[];
  starterCode?: string;
  difficulty?: Difficulty;
  estimatedMinutes?: number;
}

export interface MisconceptionBlock {
  type: 'misconception';
  claim: string;
  reality: string;
}

export interface ComparisonItem {
  name: string;
  description: string;
  strengths: string[];
  weaknesses?: string[];
  useWhen: string;
}

export interface ComparisonBlock {
  type: 'comparison';
  title: string;
  a: ComparisonItem;
  b: ComparisonItem;
}

export type ContentBlock =
  | ParagraphBlock
  | HeadingBlock
  | ListBlock
  | DividerBlock
  | CodeBlock
  | TipBlock
  | WarningBlock
  | InfoBlock
  | DefinitionBlock
  | VideoBlock
  | PlaygroundBlock
  | QuizBlock
  | ExerciseBlock
  | DebugChallenge
  | ProjectBlock
  | MisconceptionBlock
  | ComparisonBlock;

/* ─── Full Lesson Schema ─────────────────────────────────── */

export interface WhyItExists {
  problem: string;
  solution: string;
  whenToUse: string;
  whenNotToUse: string;
}

export interface ExplainModes {
  beginner?: string;
  simple?: string;
  standard?: string;
  technical?: string;
  deepDive?: string;
}

export interface LessonSource {
  name: string;
  url: string;
  verified: string;
}

export interface RealWorld {
  usedIn: string[];
  examples: string[];
}

export interface Lesson {
  id: string;
  version: string;
  contentVersion: string;
  technology: string;
  technologyVersion: string;
  module: string;
  title: string;
  subtitle: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  status: ContentStatus;
  author: string;
  reviewer: string;
  createdAt: string;
  updatedAt: string;
  lastVerified: string;
  prerequisites: string[];
  skillsTaught: string[];
  skillsUsed: string[];
  relatedConcepts: string[];
  whyItExists?: WhyItExists;
  explainModes?: ExplainModes;
  content: ContentBlock[];
  faq?: { q: string; a: string }[];
  sources?: LessonSource[];
  realWorld?: RealWorld;
}

/* ─── Skill Graph ────────────────────────────────────────── */

export interface SkillNode {
  id: string;
  label: string;
  difficulty: Difficulty;
  timeMinutes: number;
}

export interface SkillEdge {
  from: string;
  to: string;
  type: 'prerequisite' | 'enables' | 'related';
}

export interface SkillGraph {
  nodes: SkillNode[];
  edges: SkillEdge[];
}
