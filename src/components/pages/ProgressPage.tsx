import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Trophy, BookOpen, BarChart2, Download, Award, CheckCircle2, Pencil, Check, X } from 'lucide-react';
import { useStore } from '@/store';
import { BADGES, getAverageQuizScore, getTechProgress } from '@/lib/progress';
import {
  exportAllData, getCertifications, addCertification,
  getUserName, setUserName,
} from '@/lib/storage';
import { loadTechnologies, loadModules } from '@/lib/content-engine';
import type { Technology, Module } from '@/types/content';
import type { Certificate } from '@/types/storage';
import clsx from 'clsx';

interface TechProgressData {
  tech: Technology;
  completed: number;
  total: number;
  percent: number;
}

const TECH_LESSON_COUNT = 15;

export default function ProgressPage() {
  const { streak, badges, progress, quizScores, earnCertificate } = useStore();
  const completedCount = Object.values(progress).filter(Boolean).length;
  const avgQuiz = getAverageQuizScore();

  const [exported, setExported] = useState(false);
  const [techData, setTechData] = useState<TechProgressData[]>([]);
  const [loadingTechs, setLoadingTechs] = useState(true);
  const [certs, setCerts] = useState<Certificate[]>(() => getCertifications());
  const [userName, setUserNameLocal] = useState(() => getUserName());
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(() => getUserName());

  const refreshTechData = useCallback(() => {
    loadTechnologies().then(techs => {
      const enabled = techs.filter(t => t.enabled);
      Promise.all(
        enabled.map(tech =>
          loadModules(tech.id)
            .then((modules: Module[]) => {
              const { completed, total, percent } = getTechProgress(modules);
              return { tech, completed, total, percent } as TechProgressData;
            })
            .catch(() => null)
        )
      ).then(results => {
        setTechData(results.filter((r): r is TechProgressData => r !== null));
        setLoadingTechs(false);
      });
    });
  }, []);

  useEffect(() => {
    refreshTechData();
  }, [progress, refreshTechData]);

  const handleEarnCert = (td: TechProgressData) => {
    const cert: Certificate = {
      id: `cert-${td.tech.id}-${new Date().toISOString().slice(0, 10)}`,
      techId: td.tech.id,
      techName: td.tech.name,
      earnedAt: new Date().toISOString(),
      lessonsCompleted: td.completed,
      totalLessons: td.total,
    };
    addCertification(cert);
    earnCertificate(td.tech.id, td.tech.name, td.total);
    setCerts(getCertifications());
  };

  const handleSaveName = () => {
    setUserName(nameInput);
    setUserNameLocal(nameInput);
    setEditingName(false);
  };

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

  const hasCert = (techId: string) => certs.some(c => c.techId === techId);

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-k-text mb-2">Your Progress</h1>
        <p className="text-k-muted">All your learning data — stored privately on this device.</p>
      </header>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { icon: <BookOpen size={20} className="text-k-accent" />,   label: 'Lessons done',   value: completedCount },
          { icon: <Flame size={20} className="text-k-warning" />,     label: 'Current streak',  value: `${streak.count}d` },
          { icon: <Flame size={20} className="text-k-success" />,     label: 'Best streak',     value: `${streak.longestStreak}d` },
          { icon: <BarChart2 size={20} className="text-k-accent" />,  label: 'Avg quiz score',  value: `${avgQuiz}%` },
        ].map(s => (
          <div key={s.label} className="flex flex-col items-center p-4 bg-k-surface border border-k-border rounded-kernal text-center">
            {s.icon}
            <div className="text-2xl font-bold text-k-text mt-2">{s.value}</div>
            <div className="text-xs text-k-muted">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Track progress */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-k-text mb-4 flex items-center gap-2">
          <BarChart2 size={18} className="text-k-accent" />
          Track Progress
        </h2>

        {loadingTechs ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-k-surface border border-k-border rounded-kernal animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {techData.map(td => {
              const pct = td.total > 0 ? Math.round((td.completed / td.total) * 100) : 0;
              const certified = hasCert(td.tech.id);
              const canClaim = td.completed >= td.total && td.total > 0 && !certified;

              return (
                <div
                  key={td.tech.id}
                  className={clsx(
                    'p-4 rounded-kernal border transition-kernal',
                    certified
                      ? 'bg-k-surface border-k-success/40'
                      : 'bg-k-surface border-k-border'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {certified && <CheckCircle2 size={14} className="text-k-success shrink-0" />}
                      <Link
                        to={`/learn/${td.tech.id}`}
                        className="font-semibold text-sm text-k-text hover:text-k-accent transition-kernal"
                      >
                        {td.tech.name}
                      </Link>
                    </div>
                    <span className="text-xs text-k-muted font-mono">
                      {td.completed}/{td.total}
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-k-surface-2 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background:
                          pct === 100 ? 'var(--success)' :
                          pct >= 50 ? 'var(--accent)' :
                          pct > 0 ? 'var(--warning)' : 'transparent',
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-k-muted">{pct}% complete</span>
                    {canClaim && (
                      <button
                        onClick={() => handleEarnCert(td)}
                        className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-k-success/20 text-k-success border border-k-success/30 hover:bg-k-success/30 transition-kernal"
                      >
                        <Award size={12} />
                        Claim Certificate
                      </button>
                    )}
                    {certified && (
                      <span className="flex items-center gap-1 text-xs text-k-success font-medium">
                        <Award size={12} />
                        Certified
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Certificates */}
      {certs.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-k-text mb-4 flex items-center gap-2">
            <Award size={18} className="text-k-warning" />
            Certificates
          </h2>

          {/* Name for certificate */}
          <div className="flex items-center gap-3 mb-4 p-3 bg-k-surface border border-k-border rounded-kernal">
            <span className="text-sm text-k-muted">Certificate name:</span>
            {editingName ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  autoFocus
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                  placeholder="Your full name"
                  className="flex-1 bg-k-surface-2 border border-k-border rounded-lg px-3 py-1.5 text-sm text-k-text outline-none focus:border-k-accent/60"
                />
                <button onClick={handleSaveName} className="p-1.5 text-k-success hover:bg-k-success/10 rounded transition-kernal"><Check size={14} /></button>
                <button onClick={() => setEditingName(false)} className="p-1.5 text-k-muted hover:bg-k-surface-2 rounded transition-kernal"><X size={14} /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm text-k-text font-medium">{userName || 'Not set'}</span>
                <button onClick={() => { setNameInput(userName); setEditingName(true); }} className="p-1 text-k-muted hover:text-k-accent transition-kernal">
                  <Pencil size={12} />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {certs.map(cert => (
              <CertificateCard key={cert.id} cert={cert} recipientName={userName} />
            ))}
          </div>
        </section>
      )}

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
                className={clsx(
                  'p-3 rounded-kernal border text-center transition-kernal',
                  earned ? 'bg-k-surface border-k-border' : 'bg-k-surface/40 border-k-border/50 opacity-40 grayscale'
                )}
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
          Export all your progress, scores, certificates, and preferences as a JSON file.
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

function CertificateCard({ cert, recipientName }: { cert: Certificate; recipientName: string }) {
  const date = new Date(cert.earnedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div
      className="relative overflow-hidden rounded-kernal border border-k-warning/40 bg-gradient-to-br from-k-surface to-k-surface-2 p-5"
      style={{ boxShadow: '0 0 0 1px rgba(251,191,36,0.1), inset 0 1px 0 rgba(255,255,255,0.04)' }}
    >
      {/* Decorative corner */}
      <div className="absolute top-0 right-0 w-16 h-16 opacity-5">
        <Award size={64} className="text-k-warning" />
      </div>

      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-k-warning/15 flex items-center justify-center shrink-0">
          <Award size={18} className="text-k-warning" />
        </div>
        <div>
          <div className="text-xs font-semibold text-k-warning uppercase tracking-wider mb-0.5">Certificate of Completion</div>
          <div className="text-base font-bold text-k-text">{cert.techName}</div>
        </div>
      </div>

      {recipientName && (
        <div className="mb-2">
          <span className="text-xs text-k-muted">Awarded to </span>
          <span className="text-sm font-semibold text-k-text">{recipientName}</span>
        </div>
      )}

      <div className="text-xs text-k-muted">
        {cert.lessonsCompleted} of {cert.totalLessons} lessons completed · {date}
      </div>

      <div className="mt-3 pt-3 border-t border-k-border/50">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-k-success/20 flex items-center justify-center">
            <CheckCircle2 size={10} className="text-k-success" />
          </div>
          <span className="text-xs text-k-success font-medium">KERNAL Platform — kernal.dhurta.org</span>
        </div>
      </div>
    </div>
  );
}
