import { useState } from 'react';
import { CheckCircle2, XCircle, HelpCircle, RefreshCw } from 'lucide-react';
import type { QuizQuestion } from '@/types/content';
import { useStore } from '@/store';
import clsx from 'clsx';

interface Props {
  lessonId: string;
  questions: QuizQuestion[];
}

export default function QuizBlock({ lessonId, questions }: Props) {
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showExplanations, setShowExplanations] = useState<Record<string, boolean>>({});
  const saveQuizScore = useStore(s => s.saveQuizScore);

  const score = submitted
    ? questions.filter(q => String(answers[q.id]) === String(q.correctAnswer)).length
    : 0;

  const handleAnswer = (qId: string, value: string | number) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < questions.length) return;
    const finalScore = questions.filter(q => String(answers[q.id]) === String(q.correctAnswer)).length;
    setSubmitted(true);
    saveQuizScore(lessonId, finalScore, questions.length);
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setShowExplanations({});
  };

  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  return (
    <div className="bg-k-surface border border-k-border rounded-kernal p-5 my-6">
      <div className="flex items-center gap-2 mb-5">
        <HelpCircle size={18} className="text-k-accent" />
        <h3 className="font-semibold text-k-text">Knowledge Check</h3>
        <span className="text-xs text-k-muted ml-auto">{questions.length} question{questions.length !== 1 ? 's' : ''}</span>
      </div>

      {questions.map((q, qi) => {
        const userAnswer = answers[q.id];
        const isCorrect = submitted && String(userAnswer) === String(q.correctAnswer);
        const isWrong   = submitted && userAnswer !== undefined && !isCorrect;
        const showExp   = showExplanations[q.id];

        return (
          <div key={q.id} className={clsx('mb-5 p-4 rounded-lg border', {
            'border-k-border bg-k-surface-2/50': !submitted,
            'border-k-success/40 bg-k-success/5': isCorrect,
            'border-k-danger/40 bg-k-danger/5': isWrong,
            'border-k-border/50 opacity-60': submitted && userAnswer === undefined,
          })}>
            <div className="flex items-start gap-2 mb-3">
              <span className="text-xs font-mono text-k-muted shrink-0 mt-0.5">Q{qi + 1}</span>
              <p className="text-sm text-k-text font-medium">{q.question}</p>
              {submitted && (
                <span className="ml-auto shrink-0">
                  {isCorrect
                    ? <CheckCircle2 size={16} className="text-k-success" />
                    : <XCircle size={16} className="text-k-danger" />
                  }
                </span>
              )}
            </div>

            {q.type === 'multiple-choice' && q.options && (
              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  const isSelected = String(userAnswer) === String(oi);
                  const isCorrectOpt = String(q.correctAnswer) === String(oi);

                  return (
                    <button
                      key={oi}
                      onClick={() => handleAnswer(q.id, oi)}
                      disabled={submitted}
                      className={clsx(
                        'w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg border text-sm transition-kernal',
                        submitted
                          ? isCorrectOpt
                            ? 'border-k-success bg-k-success/10 text-k-success'
                            : isSelected && !isCorrectOpt
                              ? 'border-k-danger bg-k-danger/10 text-k-danger'
                              : 'border-k-border text-k-muted'
                          : isSelected
                            ? 'border-k-accent bg-k-accent/10 text-k-accent'
                            : 'border-k-border text-k-text hover:border-k-accent/50 hover:bg-k-surface-2'
                      )}
                    >
                      <span className={clsx(
                        'w-5 h-5 rounded-full border text-xs flex items-center justify-center shrink-0 font-mono',
                        isSelected ? 'border-current bg-current text-k-bg' : 'border-current'
                      )}>
                        {String.fromCharCode(65 + oi)}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {q.type === 'true-false' && (
              <div className="flex gap-2">
                {['True', 'False'].map(opt => {
                  const val = opt === 'True' ? 'true' : 'false';
                  const isSelected = String(userAnswer) === val;
                  const isCorrectOpt = String(q.correctAnswer) === val;
                  return (
                    <button
                      key={opt}
                      onClick={() => handleAnswer(q.id, val)}
                      disabled={submitted}
                      className={clsx(
                        'flex-1 py-2 rounded-lg border text-sm font-medium transition-kernal',
                        submitted
                          ? isCorrectOpt
                            ? 'border-k-success bg-k-success/10 text-k-success'
                            : isSelected
                              ? 'border-k-danger bg-k-danger/10 text-k-danger'
                              : 'border-k-border text-k-muted'
                          : isSelected
                            ? 'border-k-accent bg-k-accent/10 text-k-accent'
                            : 'border-k-border text-k-text hover:border-k-accent/50'
                      )}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {submitted && (
              <div className="mt-3">
                <button
                  onClick={() => setShowExplanations(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                  className="text-xs text-k-accent hover:text-k-text transition-kernal"
                >
                  {showExp ? 'Hide' : 'Show'} explanation
                </button>
                {showExp && (
                  <p className="mt-2 text-xs text-k-muted bg-k-surface-2 rounded-lg p-3 leading-relaxed">
                    {q.explanation}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Submit / Results */}
      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length < questions.length}
          className="w-full py-2.5 rounded-lg bg-k-accent text-k-bg font-semibold text-sm hover:bg-k-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-kernal"
        >
          Submit answers
        </button>
      ) : (
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <div className={clsx(
              'text-2xl font-bold font-mono',
              pct === 100 ? 'text-k-success' : pct >= 60 ? 'text-k-warning' : 'text-k-danger'
            )}>
              {score}/{questions.length}
            </div>
            <div>
              <div className="text-sm font-medium text-k-text">{pct}% correct</div>
              <div className="text-xs text-k-muted">
                {pct === 100 ? 'Perfect! 🎉' : pct >= 60 ? 'Good job!' : 'Keep practicing'}
              </div>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-k-muted hover:text-k-text transition-kernal"
          >
            <RefreshCw size={12} />
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
