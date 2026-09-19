import { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { ChevronRight, ChevronDown, CheckCircle2, Circle, BookOpen, Map, BarChart2, Settings } from 'lucide-react';
import { useStore } from '@/store';
import { loadTechnologies, loadModules } from '@/lib/content-engine';
import type { Technology, Module } from '@/types/content';
import clsx from 'clsx';

export default function Sidebar() {
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [expandedTech, setExpandedTech] = useState<string | null>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const { tech: activeTech, lessonId: activeLesson } = useParams();
  const location = useLocation();
  const progress = useStore(s => s.progress);

  useEffect(() => {
    loadTechnologies().then(setTechnologies).catch(() => {});
  }, []);

  useEffect(() => {
    if (activeTech) {
      setExpandedTech(activeTech);
      loadModules(activeTech).then(mods => {
        setModules(mods);
        if (activeLesson) {
          const mod = mods.find(m => m.lessons.some(l => l.id === activeLesson));
          if (mod) setExpandedModule(mod.id);
        } else if (mods.length > 0) {
          setExpandedModule(mods[0].id);
        }
      }).catch(() => {});
    }
  }, [activeTech, activeLesson]);

  const navItems = [
    { to: '/',         icon: BookOpen, label: 'Home' },
    { to: '/roadmap',  icon: Map,      label: 'Roadmap' },
    { to: '/progress', icon: BarChart2, label: 'Progress' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="flex flex-col h-full py-4" aria-label="Site navigation">
      {/* Nav links */}
      <div className="px-3 mb-4">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={clsx(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-kernal mb-0.5',
                isActive
                  ? 'bg-k-accent/15 text-k-accent'
                  : 'text-k-muted hover:text-k-text hover:bg-k-surface-2'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </div>

      <div className="px-4 mb-2">
        <span className="text-xs font-semibold text-k-muted uppercase tracking-wider">Learning Path</span>
      </div>

      {/* Technologies */}
      <div className="flex-1 overflow-y-auto px-3">
        {technologies.map(tech => {
          const isExpanded = expandedTech === tech.id;
          const techMods = isExpanded && activeTech === tech.id ? modules : [];

          return (
            <div key={tech.id} className="mb-1">
              <button
                onClick={() => {
                  if (isExpanded && activeTech !== tech.id) {
                    setExpandedTech(null);
                  } else {
                    setExpandedTech(isExpanded ? null : tech.id);
                  }
                }}
                disabled={!tech.enabled}
                className={clsx(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-kernal',
                  tech.enabled
                    ? activeTech === tech.id
                      ? 'bg-k-surface-2 text-k-text'
                      : 'text-k-muted hover:text-k-text hover:bg-k-surface-2'
                    : 'text-k-border cursor-not-allowed opacity-50'
                )}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: tech.color }}
                />
                <span className="flex-1 text-left truncate">{tech.name}</span>
                <span className="text-xs text-k-muted/60 font-normal shrink-0">
                  S{tech.stage}
                </span>
                {tech.enabled && (
                  isExpanded
                    ? <ChevronDown size={14} className="text-k-muted shrink-0" />
                    : <ChevronRight size={14} className="text-k-muted shrink-0" />
                )}
              </button>

              {/* Modules + Lessons */}
              {isExpanded && activeTech === tech.id && techMods.length > 0 && (
                <div className="ml-3 mt-1 border-l border-k-border pl-3">
                  {techMods.map(mod => {
                    const isModExpanded = expandedModule === mod.id;
                    const modCompleted = mod.lessons.filter(l => progress[l.id]).length;

                    return (
                      <div key={mod.id} className="mb-1">
                        <button
                          onClick={() => setExpandedModule(isModExpanded ? null : mod.id)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-semibold text-k-muted hover:text-k-text hover:bg-k-surface-2 transition-kernal"
                        >
                          {isModExpanded
                            ? <ChevronDown size={12} />
                            : <ChevronRight size={12} />
                          }
                          <span className="flex-1 text-left truncate uppercase tracking-wide">{mod.title}</span>
                          <span className="text-k-muted/60">{modCompleted}/{mod.lessons.length}</span>
                        </button>

                        {isModExpanded && (
                          <div className="mt-0.5">
                            {mod.lessons.map(lesson => {
                              const done = progress[lesson.id];
                              const isActive = activeLesson === lesson.id;

                              return (
                                <Link
                                  key={lesson.id}
                                  to={`/learn/${tech.id}/${lesson.id}`}
                                  className={clsx(
                                    'flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-kernal',
                                    isActive
                                      ? 'bg-k-accent/20 text-k-accent font-medium'
                                      : 'text-k-muted hover:text-k-text hover:bg-k-surface-2'
                                  )}
                                >
                                  {done
                                    ? <CheckCircle2 size={12} className="text-k-success shrink-0" />
                                    : <Circle size={12} className="shrink-0 opacity-40" />
                                  }
                                  <span className="truncate">{lesson.title}</span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Loading modules state */}
              {isExpanded && activeTech === tech.id && techMods.length === 0 && (
                <div className="ml-6 mt-1 text-xs text-k-muted animate-pulse px-2 py-1">
                  Loading modules…
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 pt-3 border-t border-k-border mt-2">
        <p className="text-xs text-k-muted/60 font-mono">KERNAL v0.1.0-alpha</p>
      </div>
    </nav>
  );
}
