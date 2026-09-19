import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, ChevronLeft, ChevronRight, Bookmark, BookmarkCheck, Clock, ExternalLink } from 'lucide-react';
import { loadLesson, loadCourse, loadModules } from '@/lib/content-engine';
import { useStore } from '@/store';
import type { Lesson, Course, Module } from '@/types/content';
import ContentRenderer from '@/components/content/ContentRenderer';
import clsx from 'clsx';

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner:     'text-k-success bg-k-success/10 border-k-success/30',
  intermediate: 'text-k-warning bg-k-warning/10 border-k-warning/30',
  advanced:     'text-k-danger  bg-k-danger/10  border-k-danger/30',
};

export default function LearnPage() {
  const { tech, lessonId } = useParams<{ tech: string; lessonId?: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { progress, bookmarks, markComplete, markIncomplete, toggleBookmark } = useStore();
  const isComplete  = lessonId ? !!progress[lessonId] : false;
  const isBookmarked = lessonId ? bookmarks.includes(lessonId) : false;

  useEffect(() => {
    if (!tech) return;
    setLoading(true);
    setError(null);

    Promise.all([
      loadCourse(tech),
      loadModules(tech),
    ]).then(([c, mods]) => {
      setCourse(c);
      setModules(mods);
      // Auto-redirect to first lesson if no lessonId
      if (!lessonId && mods[0]?.lessons[0]) {
        navigate(`/learn/${tech}/${mods[0].lessons[0].id}`, { replace: true });
      }
    }).catch(() => setError(`Could not load course for "${tech}".`));
  }, [tech, navigate, lessonId]);

  useEffect(() => {
    if (!tech || !lessonId) return;
    setLoading(true);
    setError(null);

    loadLesson(tech, lessonId)
      .then(l => { setLesson(l); setLoading(false); })
      .catch(() => { setError(`Lesson "${lessonId}" not found.`); setLoading(false); });
  }, [tech, lessonId]);

  // Flatten all lessons for prev/next
  const allLessons = modules.flatMap(m => m.lessons);
  const currentIdx = lessonId ? allLessons.findIndex(l => l.id === lessonId) : -1;
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  // FAQ section
  const faq = lesson?.faq ?? [];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-k-danger mb-4">{error}</p>
        <Link to="/" className="text-k-accent hover:underline text-sm">← Back to home</Link>
      </div>
    );
  }

  if (loading && !lesson) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-8 bg-k-surface rounded-lg w-2/3" />
        <div className="h-4 bg-k-surface rounded w-1/3" />
        <div className="h-32 bg-k-surface rounded-kernal mt-4" />
        <div className="h-4 bg-k-surface rounded w-full" />
        <div className="h-4 bg-k-surface rounded w-5/6" />
        <div className="h-4 bg-k-surface rounded w-4/6" />
      </div>
    );
  }

  if (!lesson) return null;

  return (
    <article>
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-k-muted mb-6" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-k-text transition-kernal">Home</Link>
        <ChevronRight size={12} />
        <Link to={`/learn/${tech}`} className="hover:text-k-text transition-kernal capitalize">{course?.name ?? tech}</Link>
        <ChevronRight size={12} />
        <span className="text-k-text truncate max-w-[200px]">{lesson.title}</span>
      </nav>

      {/* Lesson Header */}
      <header className="mb-8">
        <div className="flex items-start gap-3 flex-wrap mb-3">
          <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full border capitalize', DIFFICULTY_COLOR[lesson.difficulty])}>
            {lesson.difficulty}
          </span>
          <span className="flex items-center gap-1 text-xs text-k-muted">
            <Clock size={12} /> {lesson.estimatedMinutes} min
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => lessonId && toggleBookmark(lessonId)}
              className="p-1.5 rounded-lg text-k-muted hover:text-k-warning hover:bg-k-surface transition-kernal"
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this lesson'}
            >
              {isBookmarked ? <BookmarkCheck size={16} className="text-k-warning" /> : <Bookmark size={16} />}
            </button>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-k-text mb-2">{lesson.title}</h1>
        <p className="text-k-muted text-base">{lesson.subtitle}</p>

        {/* Skills taught */}
        {lesson.skillsTaught.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {lesson.skillsTaught.map(s => (
              <span key={s} className="text-xs bg-k-accent/10 text-k-accent border border-k-accent/20 rounded-full px-2 py-0.5 font-mono">
                {s}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Content */}
      <ContentRenderer
        blocks={lesson.content}
        lessonId={lesson.id}
        whyItExists={lesson.whyItExists}
        explainModes={lesson.explainModes}
      />

      {/* FAQ Section */}
      {faq.length > 0 && (
        <section className="mt-10" itemScope itemType="https://schema.org/FAQPage">
          <h2 className="text-lg font-semibold text-k-text mb-4">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faq.map((item, i) => (
              <details
                key={i}
                className="border border-k-border rounded-kernal overflow-hidden group"
                itemScope itemProp="mainEntity" itemType="https://schema.org/Question"
              >
                <summary
                  itemProp="name"
                  className="flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-medium text-k-text hover:bg-k-surface-2 transition-kernal list-none"
                >
                  {item.q}
                  <ChevronRight size={14} className="text-k-muted group-open:rotate-90 transition-transform" />
                </summary>
                <div
                  itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer"
                  className="px-4 py-3 border-t border-k-border bg-k-surface-2/50"
                >
                  <p itemProp="text" className="text-sm text-k-muted leading-relaxed">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Sources */}
      {lesson.sources && lesson.sources.length > 0 && (
        <section className="mt-8 pt-6 border-t border-k-border">
          <h3 className="text-xs font-semibold text-k-muted uppercase tracking-wider mb-3">Sources & References</h3>
          <div className="flex flex-wrap gap-2">
            {lesson.sources.map((src, i) => (
              <a
                key={i}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-k-muted hover:text-k-accent border border-k-border hover:border-k-accent/50 rounded-lg px-3 py-1.5 transition-kernal"
              >
                <ExternalLink size={11} />
                {src.name}
                <span className="text-k-muted/50">· {src.verified}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Complete / Incomplete toggle */}
      <div className="mt-10 pt-6 border-t border-k-border">
        <button
          onClick={() => {
            if (lessonId) {
              if (isComplete) markIncomplete(lessonId); else markComplete(lessonId);
            }
          }}
          className={clsx(
            'flex items-center gap-2 px-5 py-2.5 rounded-kernal font-semibold text-sm transition-kernal',
            isComplete
              ? 'bg-k-success/20 text-k-success border border-k-success/30 hover:bg-k-success/10'
              : 'bg-k-accent text-k-bg hover:bg-k-accent/90'
          )}
        >
          {isComplete
            ? <><CheckCircle2 size={16} /> Completed — click to undo</>
            : <><Circle size={16} /> Mark as complete</>
          }
        </button>
      </div>

      {/* Prev / Next navigation */}
      <nav className="flex items-center justify-between mt-8 pt-6 border-t border-k-border gap-4" aria-label="Lesson navigation">
        {prevLesson ? (
          <Link
            to={`/learn/${tech}/${prevLesson.id}`}
            className="flex-1 max-w-xs flex items-center gap-2 p-3 rounded-kernal border border-k-border hover:border-k-accent/50 hover:bg-k-surface transition-kernal"
          >
            <ChevronLeft size={16} className="text-k-muted shrink-0" />
            <div className="min-w-0">
              <div className="text-xs text-k-muted">Previous</div>
              <div className="text-sm text-k-text font-medium truncate">{prevLesson.title}</div>
            </div>
          </Link>
        ) : <div className="flex-1" />}

        {nextLesson && (
          <Link
            to={`/learn/${tech}/${nextLesson.id}`}
            className="flex-1 max-w-xs flex items-center justify-end gap-2 p-3 rounded-kernal border border-k-border hover:border-k-accent/50 hover:bg-k-surface transition-kernal text-right"
          >
            <div className="min-w-0">
              <div className="text-xs text-k-muted">Next</div>
              <div className="text-sm text-k-text font-medium truncate">{nextLesson.title}</div>
            </div>
            <ChevronRight size={16} className="text-k-muted shrink-0" />
          </Link>
        )}
      </nav>

      {/* Real world */}
      {lesson.realWorld && (
        <section className="mt-8 p-4 rounded-kernal bg-k-surface border border-k-border">
          <h3 className="text-xs font-semibold text-k-muted uppercase tracking-wider mb-3">Used in the real world</h3>
          <div className="flex flex-wrap gap-2 mb-2">
            {lesson.realWorld.usedIn.map(use => (
              <span key={use} className="text-xs bg-k-surface-2 text-k-muted rounded-full px-2 py-0.5">{use}</span>
            ))}
          </div>
          {lesson.realWorld.examples.map((ex, i) => (
            <p key={i} className="text-xs text-k-muted">• {ex}</p>
          ))}
        </section>
      )}
    </article>
  );
}
