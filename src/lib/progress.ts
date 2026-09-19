import { isComplete, getProgress, getQuizScores } from './storage';
import type { Module } from '@/types/content';

export function getModuleProgress(module: Module): { completed: number; total: number; percent: number } {
  const total = module.lessons.length;
  const completed = module.lessons.filter(l => isComplete(l.id)).length;
  return { completed, total, percent: total === 0 ? 0 : Math.round((completed / total) * 100) };
}

export function getTechProgress(modules: Module[]): { completed: number; total: number; percent: number } {
  const all = modules.flatMap(m => m.lessons);
  const total = all.length;
  const completed = all.filter(l => isComplete(l.id)).length;
  return { completed, total, percent: total === 0 ? 0 : Math.round((completed / total) * 100) };
}

export function getTotalProgress(): { completed: number; total: number } {
  const prog = getProgress();
  const completed = Object.values(prog).filter(Boolean).length;
  return { completed, total: 0 }; // total requires all modules to be loaded
}

export function getAverageQuizScore(): number {
  const scores = Object.values(getQuizScores());
  if (scores.length === 0) return 0;
  const avg = scores.reduce((acc, s) => acc + (s.score / s.total) * 100, 0) / scores.length;
  return Math.round(avg);
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  condition: string;
}

export const BADGES: Badge[] = [
  { id: 'first-lesson',    name: 'First Step',      description: 'Completed your first lesson',  icon: '🚀', color: '#4fd1c5', condition: '1 lesson completed' },
  { id: 'html-starter',    name: 'HTML Starter',     description: 'Completed 3 HTML lessons',     icon: '📄', color: '#e34c26', condition: '3 HTML lessons' },
  { id: 'html-graduate',   name: 'HTML Graduate',    description: 'Completed all HTML lessons',   icon: '🏅', color: '#e34c26', condition: 'All HTML lessons' },
  { id: 'streak-3',        name: 'On a Roll',        description: '3-day learning streak',        icon: '🔥', color: '#fbbf24', condition: '3 day streak' },
  { id: 'streak-7',        name: 'Week Warrior',     description: '7-day learning streak',        icon: '⚡', color: '#fbbf24', condition: '7 day streak' },
  { id: 'quiz-perfect',    name: 'Perfect Score',    description: 'Got 100% on a quiz',           icon: '✨', color: '#4ade80', condition: '100% quiz score' },
  { id: 'debugger',        name: 'Bug Hunter',       description: 'Solved 5 debug challenges',    icon: '🐛', color: '#f472b6', condition: '5 debug challenges' },
];

export function checkBadgeConditions(
  completedCount: number,
  streak: number,
  quizScores: Record<string, { score: number; total: number }>,
): string[] {
  const earned: string[] = [];
  if (completedCount >= 1) earned.push('first-lesson');
  if (streak >= 3) earned.push('streak-3');
  if (streak >= 7) earned.push('streak-7');
  const hasPerfect = Object.values(quizScores).some(s => s.score === s.total && s.total > 0);
  if (hasPerfect) earned.push('quiz-perfect');
  return earned;
}
