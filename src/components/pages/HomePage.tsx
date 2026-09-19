import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Trophy, BookOpen, Zap } from 'lucide-react';
import { loadTechnologies } from '@/lib/content-engine';
import { useStore } from '@/store';
import type { Technology } from '@/types/content';

const STAGE_LABELS: Record<number, string> = {
  0: 'Foundation',
  1: 'Structure',
  2: 'Style',
  3: 'Logic',
  4: 'Collaboration',
  5: 'General Programming',
  6: 'Data',
  7: 'Type Safety',
  8: 'UI Frameworks',
  9: 'Server Side',
  10: 'APIs',
  11: 'Databases',
  12: 'DevOps',
  13: 'Cloud',
  14: 'AI / ML',
  15: 'Security',
  16: 'Embedded',
};

export default function HomePage() {
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const { streak, badges, progress } = useStore();
  const completedCount = Object.values(progress).filter(Boolean).length;

  useEffect(() => {
    loadTechnologies().then(setTechnologies).catch(() => {});
  }, []);

  // Group by stage
  const byStage = technologies.reduce<Record<number, Technology[]>>((acc, t) => {
    if (!acc[t.stage]) acc[t.stage] = [];
    acc[t.stage].push(t);
    return acc;
  }, {});

  const stages = Object.keys(byStage).map(Number).sort((a, b) => a - b);

  // Find last visited topic
  const lastTopic = localStorage.getItem('kernal_lastTopic');

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="mb-12">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-2xl text-k-accent font-bold">&gt;_</span>
              <span className="font-mono text-2xl font-bold text-k-text">KERNAL</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-k-text mb-3 leading-tight">
              The core of every coder.
            </h1>
            <p className="text-k-muted text-lg leading-relaxed max-w-2xl">
              A free, offline-first developer learning platform. Learn HTML, CSS, JavaScript, Python, SQL, Git and more — entirely in your browser.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/learn/html"
            className="flex items-center gap-2 px-5 py-2.5 rounded-kernal bg-k-accent text-k-bg font-semibold text-sm hover:bg-k-accent/90 transition-kernal shadow-kernal-sm"
          >
            <BookOpen size={16} />
            Start Learning
          </Link>
          <Link
            to="/roadmap"
            className="flex items-center gap-2 px-5 py-2.5 rounded-kernal border border-k-border text-k-text font-semibold text-sm hover:border-k-accent/50 hover:bg-k-surface transition-kernal"
          >
            View Roadmap
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Stats row (only if any activity) */}
      {(completedCount > 0 || streak.count > 0 || badges.length > 0) && (
        <section className="grid grid-cols-3 gap-3 mb-10">
          <StatCard icon={<BookOpen size={18} className="text-k-accent" />} label="Completed" value={String(completedCount)} />
          <StatCard icon={<Flame size={18} className="text-k-warning" />} label="Day streak" value={String(streak.count)} />
          <StatCard icon={<Trophy size={18} className="text-k-success" />} label="Badges" value={String(badges.length)} />
        </section>
      )}

      {/* Continue learning */}
      {lastTopic && completedCount > 0 && (
        <section className="mb-10 p-4 bg-k-surface border border-k-accent/30 rounded-kernal flex items-center gap-4">
          <div className="p-2 rounded-lg bg-k-accent/15">
            <Zap size={20} className="text-k-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-k-muted mb-0.5">Continue where you left off</div>
            <div className="text-sm font-medium text-k-text truncate">{lastTopic}</div>
          </div>
          <Link
            to={`/learn/html`}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-k-accent/15 text-k-accent text-xs font-semibold hover:bg-k-accent/25 transition-kernal"
          >
            Resume →
          </Link>
        </section>
      )}

      {/* Learning Path */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-k-text">The KERNAL Learning Path</h2>
          <Link to="/roadmap" className="text-xs text-k-accent hover:text-k-text transition-kernal">
            Full roadmap →
          </Link>
        </div>

        <div className="space-y-6">
          {stages.map(stage => (
            <div key={stage}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-mono font-bold text-k-accent bg-k-accent/10 border border-k-accent/20 rounded px-2 py-0.5">
                  S{stage}
                </span>
                <span className="text-xs font-semibold text-k-muted uppercase tracking-wider">
                  {STAGE_LABELS[stage] ?? `Stage ${stage}`}
                </span>
                <div className="flex-1 h-px bg-k-border" />
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {byStage[stage].map(tech => (
                  <TechCard key={tech.id} tech={tech} completedCount={completedCount} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* KERNAL values */}
      <section className="mt-16 pt-8 border-t border-k-border">
        <h2 className="text-xl font-bold text-k-text mb-6 text-center">Built different.</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: '🔒', title: 'Private by default', desc: 'No accounts. No tracking. All data stays on your device.' },
            { icon: '✈️', title: 'Works offline', desc: 'Install as a PWA. Learn on a plane, ship, or remote site.' },
            { icon: '🆓', title: 'Free forever', desc: 'No paywalls. No premium tiers. No ads. Open source.' },
            { icon: '🧠', title: 'Actually explains why', desc: 'Every concept explains why it exists, not just what it does.' },
          ].map(item => (
            <div key={item.title} className="p-4 bg-k-surface rounded-kernal border border-k-border">
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="font-semibold text-sm text-k-text mb-1">{item.title}</div>
              <div className="text-xs text-k-muted leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-3 bg-k-surface border border-k-border rounded-kernal text-center">
      {icon}
      <div className="text-xl font-bold text-k-text mt-1">{value}</div>
      <div className="text-xs text-k-muted">{label}</div>
    </div>
  );
}

function TechCard({ tech }: { tech: Technology; completedCount: number }) {
  return (
    <Link
      to={tech.enabled ? `/learn/${tech.id}` : '#'}
      className={`
        group flex items-center gap-3 p-3 bg-k-surface border rounded-kernal transition-kernal
        ${tech.enabled
          ? 'border-k-border hover:border-k-accent/50 hover:bg-k-surface-2 cursor-pointer'
          : 'border-k-border opacity-50 cursor-not-allowed'
        }
      `}
      onClick={e => !tech.enabled && e.preventDefault()}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
        style={{ backgroundColor: tech.color }}
      >
        {tech.name.slice(0, 2).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-k-text group-hover:text-k-accent transition-kernal truncate">
          {tech.name}
        </div>
        <div className="text-xs text-k-muted truncate">{tech.description}</div>
      </div>
      {!tech.enabled && (
        <span className="text-xs text-k-muted/50 shrink-0">Soon</span>
      )}
      {tech.enabled && (
        <ArrowRight size={14} className="text-k-muted group-hover:text-k-accent transition-kernal shrink-0" />
      )}
    </Link>
  );
}
