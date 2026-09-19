import { useState } from 'react';
import { Flame, Trophy, BookOpen, BarChart2, Download } from 'lucide-react';
import { useStore } from '@/store';
import { BADGES } from '@/lib/progress';
import { exportAllData } from '@/lib/storage';
import { getAverageQuizScore } from '@/lib/progress';

export default function ProgressPage() {
  const { streak, badges, progress, quizScores } = useStore();
  const completedCount = Object.values(progress).filter(Boolean).length;
  const avgQuiz = getAverageQuizScore();
  const [exported, setExported] = useState(false);

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kernal-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-k-text mb-2">Your Progress</h1>
        <p className="text-k-muted">All your learning data — stored privately on this device.</p>
      </header>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { icon: <BookOpen size={20} className="text-k-accent" />,   label: 'Lessons done',  value: completedCount },
          { icon: <Flame size={20} className="text-k-warning" />,     label: 'Current streak', value: `${streak.count}d` },
          { icon: <Flame size={20} className="text-k-success" />,     label: 'Best streak',    value: `${streak.longestStreak}d` },
          { icon: <BarChart2 size={20} className="text-k-accent" />,  label: 'Avg quiz score', value: `${avgQuiz}%` },
        ].map(s => (
          <div key={s.label} className="flex flex-col items-center p-4 bg-k-surface border border-k-border rounded-kernal text-center">
            {s.icon}
            <div className="text-2xl font-bold text-k-text mt-2">{s.value}</div>
            <div className="text-xs text-k-muted">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Badges */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-k-text mb-4 flex items-center gap-2">
          <Trophy size={18} className="text-k-warning" />
          Badges
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {BADGES.map(badge => {
            const earned = badges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`p-3 rounded-kernal border text-center transition-kernal ${
                  earned
                    ? 'bg-k-surface border-k-border'
                    : 'bg-k-surface/40 border-k-border/50 opacity-40 grayscale'
                }`}
              >
                <div className="text-2xl mb-1">{badge.icon}</div>
                <div className="text-xs font-semibold text-k-text">{badge.name}</div>
                <div className="text-xs text-k-muted mt-1">{badge.description}</div>
                {!earned && <div className="text-xs text-k-muted/60 mt-1">{badge.condition}</div>}
              </div>
            );
          })}
        </div>
      </section>

      {/* Quiz scores */}
      {Object.keys(quizScores).length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-k-text mb-4">Quiz Scores</h2>
          <div className="space-y-2">
            {Object.entries(quizScores).map(([lessonId, score]) => {
              const pct = Math.round((score.score / score.total) * 100);
              return (
                <div key={lessonId} className="flex items-center gap-4 p-3 bg-k-surface border border-k-border rounded-lg">
                  <div className="font-mono text-xs text-k-muted flex-1 truncate">{lessonId}</div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-k-surface-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: pct >= 80 ? 'var(--success)' : pct >= 60 ? 'var(--warning)' : 'var(--danger)',
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-k-text w-10 text-right">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Export */}
      <section className="p-5 bg-k-surface border border-k-border rounded-kernal">
        <h2 className="font-semibold text-k-text mb-2">Backup your data</h2>
        <p className="text-sm text-k-muted mb-4">
          Export all your progress, scores, notes, and preferences as a JSON file. Import it on any device to restore your data.
        </p>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-k-accent text-k-bg font-semibold text-sm hover:bg-k-accent/90 transition-kernal"
        >
          <Download size={15} />
          {exported ? 'Exported!' : 'Export data'}
        </button>
      </section>
    </div>
  );
}
