import { useState } from 'react';
import { Lightbulb, AlertTriangle, Info, BookOpen, Bug, FolderGit2, ChevronDown, ChevronRight } from 'lucide-react';
import type { ContentBlock, ExplainModes, WhyItExists } from '@/types/content';
import CodeBlock from './CodeBlock';
import QuizBlock from './QuizBlock';
import PlaygroundBlock from './PlaygroundBlock';

/* ─── Why It Exists Box ──────────────────────────────────── */
function WhyBox({ why }: { why: WhyItExists }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-k-accent/30 rounded-kernal my-6 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-k-accent/10 text-left"
      >
        <span className="text-k-accent font-semibold text-sm">Why does this exist?</span>
        {open ? <ChevronDown size={16} className="ml-auto text-k-accent" /> : <ChevronRight size={16} className="ml-auto text-k-accent" />}
      </button>
      {open && (
        <div className="px-4 py-4 grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs font-semibold text-k-danger uppercase mb-1">Problem</div>
            <p className="text-k-muted">{why.problem}</p>
          </div>
          <div>
            <div className="text-xs font-semibold text-k-success uppercase mb-1">Solution</div>
            <p className="text-k-muted">{why.solution}</p>
          </div>
          <div>
            <div className="text-xs font-semibold text-k-accent uppercase mb-1">Use it when</div>
            <p className="text-k-muted">{why.whenToUse}</p>
          </div>
          <div>
            <div className="text-xs font-semibold text-k-warning uppercase mb-1">Avoid it when</div>
            <p className="text-k-muted">{why.whenNotToUse}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Explain Mode Selector ──────────────────────────────── */
type ExplainLevel = keyof ExplainModes;
const LEVELS: { key: ExplainLevel; label: string }[] = [
  { key: 'beginner',  label: 'Beginner' },
  { key: 'simple',    label: 'Simple'   },
  { key: 'standard',  label: 'Standard' },
  { key: 'technical', label: 'Technical'},
  { key: 'deepDive',  label: 'Deep dive'},
];

function ExplainModeBox({ modes }: { modes: ExplainModes }) {
  const available = LEVELS.filter(l => modes[l.key]);
  const [active, setActive] = useState<ExplainLevel>(available[0]?.key ?? 'standard');
  if (available.length === 0) return null;

  return (
    <div className="border border-k-border rounded-kernal my-6">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-k-border bg-k-surface">
        <BookOpen size={14} className="text-k-accent" />
        <span className="text-xs font-semibold text-k-muted uppercase tracking-wider">Explain it like I'm…</span>
      </div>
      <div className="flex gap-1 px-3 pt-3 flex-wrap">
        {available.map(l => (
          <button
            key={l.key}
            onClick={() => setActive(l.key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-kernal ${
              active === l.key
                ? 'bg-k-accent text-k-bg'
                : 'bg-k-surface-2 text-k-muted hover:text-k-text'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
      <div className="px-4 py-4 text-sm text-k-muted leading-relaxed">{modes[active]}</div>
    </div>
  );
}

/* ─── Debug Challenge ────────────────────────────────────── */
function DebugBox({ block }: { block: Extract<ContentBlock, { type: 'debugChallenge' }> }) {
  const [revealedHints, setRevealedHints] = useState<number[]>([]);
  const [showSolution, setShowSolution] = useState(false);

  return (
    <div className="border border-k-danger/30 rounded-kernal my-6 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-k-danger/10 border-b border-k-danger/20">
        <Bug size={16} className="text-k-danger" />
        <span className="font-semibold text-sm text-k-text">Debug Challenge: {block.title}</span>
      </div>
      {block.description && (
        <p className="px-4 pt-3 text-sm text-k-muted">{block.description}</p>
      )}
      <div className="px-4 pt-3">
        <p className="text-xs text-k-muted mb-2 font-semibold uppercase tracking-wide">Find the bug:</p>
        <CodeBlock code={block.brokenCode} lang={block.language} />
      </div>
      {block.hints.length > 0 && (
        <div className="px-4 pb-3 space-y-1">
          {block.hints.map((hint, i) => (
            <div key={i}>
              {revealedHints.includes(i) ? (
                <div className="text-sm text-k-muted bg-k-surface-2 rounded-lg px-3 py-2">
                  💡 {hint}
                </div>
              ) : (
                <button
                  onClick={() => setRevealedHints(prev => [...prev, i])}
                  className="text-xs text-k-accent hover:text-k-text transition-kernal underline-offset-2 hover:underline"
                >
                  Reveal hint {i + 1}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="px-4 pb-4">
        {!showSolution ? (
          <button
            onClick={() => setShowSolution(true)}
            className="text-xs text-k-muted hover:text-k-danger transition-kernal"
          >
            Show solution
          </button>
        ) : (
          <div>
            <p className="text-xs font-semibold text-k-success uppercase tracking-wide mb-2">Solution:</p>
            <CodeBlock code={block.solution} lang={block.language} />
            <p className="text-sm text-k-muted leading-relaxed">{block.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Exercise Block ─────────────────────────────────────── */
function ExerciseBox({ block }: { block: Extract<ContentBlock, { type: 'exercise' }> }) {
  const [code] = useState(block.starterCode);
  const [showSolution, setShowSolution] = useState(false);

  return (
    <div className="border border-k-accent/30 rounded-kernal my-6 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-k-accent/10 border-b border-k-accent/20">
        <FolderGit2 size={16} className="text-k-accent" />
        <span className="font-semibold text-sm text-k-text">{block.title}</span>
      </div>
      <p className="px-4 pt-3 pb-1 text-sm text-k-muted">{block.description}</p>
      {block.hints && block.hints.length > 0 && (
        <div className="px-4 pb-2 text-xs text-k-muted">
          Hints: {block.hints.join(' · ')}
        </div>
      )}
      <div className="px-4 pb-3">
        <PlaygroundBlock lang={block.language ?? 'javascript'} starterCode={code} title="Your solution" />
      </div>
      <div className="px-4 pb-4">
        {!showSolution ? (
          <button
            onClick={() => setShowSolution(true)}
            className="text-xs text-k-muted hover:text-k-accent transition-kernal underline-offset-2 hover:underline"
          >
            View solution
          </button>
        ) : (
          <div>
            <p className="text-xs font-semibold text-k-muted uppercase tracking-wide mb-1">Solution</p>
            <CodeBlock code={block.solution} lang={block.language ?? 'javascript'} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Renderer ──────────────────────────────────────── */
interface Props {
  blocks: ContentBlock[];
  lessonId: string;
  whyItExists?: WhyItExists;
  explainModes?: ExplainModes;
}

export default function ContentRenderer({ blocks, lessonId, whyItExists, explainModes }: Props) {
  return (
    <div className="content-body">
      {/* Why It Exists */}
      {whyItExists && <WhyBox why={whyItExists} />}

      {/* Explain modes */}
      {explainModes && Object.values(explainModes).some(Boolean) && (
        <ExplainModeBox modes={explainModes} />
      )}

      {blocks.map((block, i) => {
        switch (block.type) {
          case 'paragraph':
            return (
              <p key={i} className="text-k-text leading-7 my-4 text-base"
                 dangerouslySetInnerHTML={{ __html: block.text }} />
            );

          case 'heading':
            if (block.level === 2) return (
              <h2 key={i} className="text-xl font-semibold text-k-text mt-8 mb-3 pb-2 border-b border-k-border">{block.text}</h2>
            );
            if (block.level === 3) return (
              <h3 key={i} className="text-lg font-semibold text-k-text mt-6 mb-2">{block.text}</h3>
            );
            return <h4 key={i} className="text-base font-semibold text-k-text mt-4 mb-2">{block.text}</h4>;

          case 'list':
            return block.ordered ? (
              <ol key={i} className="list-decimal list-outside ml-6 my-4 space-y-2">
                {block.items.map((item, j) => (
                  <li key={j} className="text-k-text leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: item }} />
                ))}
              </ol>
            ) : (
              <ul key={i} className="list-disc list-outside ml-6 my-4 space-y-2">
                {block.items.map((item, j) => (
                  <li key={j} className="text-k-text leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: item }} />
                ))}
              </ul>
            );

          case 'divider':
            return <hr key={i} className="border-k-border my-6" />;

          case 'code':
            return <CodeBlock key={i} code={block.code} lang={block.lang} filename={block.filename} caption={block.caption} />;

          case 'tip':
            return (
              <div key={i} className="flex gap-3 bg-k-success/10 border border-k-success/30 rounded-kernal px-4 py-3 my-4">
                <Lightbulb size={16} className="text-k-success shrink-0 mt-0.5" />
                <p className="text-sm text-k-text leading-relaxed" dangerouslySetInnerHTML={{ __html: block.text }} />
              </div>
            );

          case 'warning':
            return (
              <div key={i} className="flex gap-3 bg-k-warning/10 border border-k-warning/30 rounded-kernal px-4 py-3 my-4">
                <AlertTriangle size={16} className="text-k-warning shrink-0 mt-0.5" />
                <p className="text-sm text-k-text leading-relaxed" dangerouslySetInnerHTML={{ __html: block.text }} />
              </div>
            );

          case 'info':
            return (
              <div key={i} className="flex gap-3 bg-k-accent/10 border border-k-accent/30 rounded-kernal px-4 py-3 my-4">
                <Info size={16} className="text-k-accent shrink-0 mt-0.5" />
                <p className="text-sm text-k-text leading-relaxed" dangerouslySetInnerHTML={{ __html: block.text }} />
              </div>
            );

          case 'definition':
            return (
              <div key={i} className="border-l-2 border-k-accent pl-4 my-4">
                <dt className="font-semibold text-k-accent text-sm">{block.term}</dt>
                <dd className="text-k-muted text-sm mt-1 leading-relaxed">{block.meaning}</dd>
              </div>
            );

          case 'video':
            return (
              <div key={i} className="my-6">
                <div className="aspect-video rounded-kernal overflow-hidden bg-k-surface border border-k-border">
                  <iframe
                    loading="lazy"
                    src={`https://www.youtube.com/embed/${block.youtubeId}`}
                    title={block.title ?? 'Video'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
                {block.title && <p className="text-xs text-k-muted mt-2 text-center">{block.title}</p>}
              </div>
            );

          case 'playground':
            return <PlaygroundBlock key={i} lang={block.lang} starterCode={block.starterCode} title={block.title} />;

          case 'quiz':
            return <QuizBlock key={i} lessonId={lessonId} questions={block.questions} />;

          case 'exercise':
            return <ExerciseBox key={i} block={block} />;

          case 'debugChallenge':
            return <DebugBox key={i} block={block} />;

          case 'project':
            return (
              <div key={i} className="border border-k-border rounded-kernal p-5 my-6 bg-k-surface">
                <div className="flex items-center gap-2 mb-3">
                  <FolderGit2 size={18} className="text-k-accent" />
                  <h3 className="font-semibold text-k-text">{block.title}</h3>
                  {block.difficulty && (
                    <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-k-surface-2 text-k-muted capitalize">
                      {block.difficulty}
                    </span>
                  )}
                </div>
                <p className="text-sm text-k-muted mb-3 leading-relaxed">{block.description}</p>
                <div>
                  <p className="text-xs font-semibold text-k-muted uppercase tracking-wide mb-2">Requirements</p>
                  <ul className="space-y-1.5">
                    {block.requirements.map((req, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-k-text">
                        <span className="text-k-success mt-0.5">□</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
                {block.starterCode && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-k-muted uppercase tracking-wide mb-2">Starter Code</p>
                    <CodeBlock code={block.starterCode} lang="html" />
                  </div>
                )}
              </div>
            );

          case 'misconception':
            return (
              <div key={i} className="border border-k-danger/30 rounded-kernal my-4 overflow-hidden">
                <div className="px-4 py-2 bg-k-danger/10 border-b border-k-danger/20 text-xs font-semibold text-k-danger uppercase tracking-wide">
                  Common Misconception
                </div>
                <div className="px-4 py-3 grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-k-danger mb-1">❌ People think:</div>
                    <p className="text-k-muted">{block.claim}</p>
                  </div>
                  <div>
                    <div className="text-xs text-k-success mb-1">✓ Reality:</div>
                    <p className="text-k-muted">{block.reality}</p>
                  </div>
                </div>
              </div>
            );

          case 'comparison':
            return (
              <div key={i} className="my-6">
                <h4 className="text-sm font-semibold text-k-muted uppercase tracking-wide mb-3">{block.title}</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[block.a, block.b].map((item, j) => (
                    <div key={j} className="border border-k-border rounded-kernal p-4 bg-k-surface">
                      <div className="font-semibold text-k-text mb-2">{item.name}</div>
                      <p className="text-xs text-k-muted mb-3 leading-relaxed">{item.description}</p>
                      <div className="space-y-1">
                        {item.strengths.map((s, si) => (
                          <div key={si} className="flex gap-2 text-xs text-k-success">
                            <span>+</span><span>{s}</span>
                          </div>
                        ))}
                        {item.weaknesses?.map((w, wi) => (
                          <div key={wi} className="flex gap-2 text-xs text-k-danger">
                            <span>−</span><span>{w}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-k-border text-xs text-k-muted">
                        <span className="text-k-accent font-medium">Use when:</span> {item.useWhen}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
