import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { loadTechnologies } from '@/lib/content-engine';
import { useStore } from '@/store';
import type { Technology } from '@/types/content';

const STAGE_META: Record<number, { label: string; color: string }> = {
  0:  { label: 'Foundation',         color: '#64748b' },
  1:  { label: 'Structure',          color: '#e34c26' },
  2:  { label: 'Style',              color: '#264de4' },
  3:  { label: 'Logic',              color: '#f7df1e' },
  4:  { label: 'Collaboration',      color: '#f05032' },
  5:  { label: 'General Programming',color: '#3776ab' },
  6:  { label: 'Data',               color: '#4479a1' },
  7:  { label: 'Type Safety',        color: '#3178c6' },
  8:  { label: 'UI Frameworks',      color: '#61dafb' },
  9:  { label: 'Server Side',        color: '#339933' },
  10: { label: 'APIs',               color: '#ff6c37' },
  11: { label: 'Databases',          color: '#336791' },
  12: { label: 'DevOps',             color: '#2496ed' },
  13: { label: 'Cloud',              color: '#ff9900' },
  14: { label: 'AI / ML',            color: '#ff6f00' },
  15: { label: 'Security',           color: '#e53e3e' },
  16: { label: 'Embedded',           color: '#00979d' },
};

export default function RoadmapPage() {
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const progress = useStore(s => s.progress);

  useEffect(() => {
    loadTechnologies().then(setTechnologies).catch(() => {});
  }, []);

  const byStage = technologies.reduce<Record<number, Technology[]>>((acc, t) => {
    if (!acc[t.stage]) acc[t.stage] = [];
    acc[t.stage].push(t);
    return acc;
  }, {});

  const stages = Object.keys(byStage).map(Number).sort((a, b) => a - b);

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-k-text mb-2">Learning Roadmap</h1>
        <p className="text-k-muted">The complete KERNAL path from beginner to expert. Follow the stages in order for the best learning experience.</p>
      </header>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-8 bottom-8 w-px bg-k-border hidden md:block" />

        <div className="space-y-8">
          {stages.map((stage) => {
            const meta = STAGE_META[stage] ?? { label: `Stage ${stage}`, color: '#4fd1c5' };
            const techs = byStage[stage];
            const allEnabled = techs.every(t => t.enabled);

            return (
              <div key={stage} className="md:pl-12 relative">
                {/* Stage dot */}
                <div
                  className="hidden md:flex absolute left-0 w-10 h-10 rounded-full border-2 items-center justify-center text-xs font-bold font-mono z-10"
                  style={{ borderColor: meta.color, background: 'var(--bg)', color: meta.color }}
                >
                  S{stage}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="md:hidden text-xs font-bold font-mono px-2 py-0.5 rounded border" style={{ borderColor: meta.color, color: meta.color }}>S{stage}</span>
                    <h2 className="font-bold text-k-text">{meta.label}</h2>
                    {!allEnabled && <span className="text-xs text-k-muted bg-k-surface rounded-full px-2 py-0.5 border border-k-border">Coming soon</span>}
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {techs.map(tech => (
                      <Link
                        key={tech.id}
                        to={tech.enabled ? `/learn/${tech.id}` : '#'}
                        onClick={e => !tech.enabled && e.preventDefault()}
                        className={`
                          flex items-center gap-3 p-3 rounded-kernal border transition-kernal
                          ${tech.enabled
                            ? 'bg-k-surface border-k-border hover:border-k-accent/50 hover:bg-k-surface-2'
                            : 'bg-k-surface/50 border-k-border opacity-40 cursor-not-allowed'
                          }
                        `}
                      >
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0"
                          style={{ background: tech.color }}
                        >
                          {tech.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-k-text truncate">{tech.name}</div>
                          <div className="text-xs text-k-muted truncate">{tech.description}</div>
                        </div>
                        {tech.enabled && (
                          <ArrowRight size={14} className="text-k-muted shrink-0" />
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-12 p-5 bg-k-surface border border-k-border rounded-kernal">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 size={18} className="text-k-accent" />
          <h3 className="font-semibold text-k-text">Your progress</h3>
        </div>
        <p className="text-sm text-k-muted mb-3">
          You've completed <span className="text-k-text font-medium">{Object.values(progress).filter(Boolean).length}</span> lessons so far.
        </p>
        <Link to="/progress" className="text-xs text-k-accent hover:text-k-text transition-kernal">
          View detailed progress →
        </Link>
      </div>
    </div>
  );
}
