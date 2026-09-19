import type { Technology, Course, Module, Lesson } from '@/types/content';

const CACHE = new Map<string, unknown>();

async function fetchJSON<T>(path: string): Promise<T> {
  if (CACHE.has(path)) return CACHE.get(path) as T;
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  const data: T = await res.json();
  CACHE.set(path, data);
  return data;
}

export async function loadTechnologies(): Promise<Technology[]> {
  return fetchJSON<Technology[]>('/data/technologies.json');
}

export async function loadCourse(techId: string): Promise<Course> {
  return fetchJSON<Course>(`/content/${techId}/course.json`);
}

export async function loadModules(techId: string): Promise<Module[]> {
  return fetchJSON<Module[]>(`/content/${techId}/modules.json`);
}

export async function loadLesson(techId: string, lessonId: string): Promise<Lesson> {
  return fetchJSON<Lesson>(`/content/${techId}/lessons/${lessonId}.json`);
}

export async function loadSkillGraph(techId: string) {
  return fetchJSON(`/content/${techId}/skills.json`);
}

export async function buildSearchIndex(): Promise<SearchEntry[]> {
  try {
    return fetchJSON<SearchEntry[]>('/data/search-index.json');
  } catch {
    return [];
  }
}

export interface SearchEntry {
  id: string;
  type: 'lesson' | 'module' | 'technology' | 'command';
  tech?: string;
  title: string;
  subtitle?: string;
  tags?: string[];
  url: string;
}

export function getLessonUrl(techId: string, lessonId: string): string {
  return `#/learn/${techId}/${lessonId}`;
}

export function getTechUrl(techId: string): string {
  return `#/learn/${techId}`;
}
