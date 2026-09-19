import { useState, useRef, useCallback } from 'react';
import { Play, RefreshCw, Share2, Terminal } from 'lucide-react';

interface Props {
  lang: string;
  starterCode: string;
  title?: string;
}

type OutputLine = { type: 'log' | 'error' | 'warn' | 'info'; text: string };

export default function PlaygroundBlock({ lang, starterCode, title }: Props) {
  const [code, setCode] = useState(starterCode);
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleRun = useCallback(() => {
    setIsRunning(true);
    setShowOutput(true);
    setOutput([]);

    if (lang === 'html') {
      // HTML preview mode
      const iframe = iframeRef.current;
      if (iframe) {
        iframe.srcdoc = code;
        setIsRunning(false);
      }
      return;
    }

    if (lang === 'javascript' || lang === 'js') {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.sandbox.add('allow-scripts');
      document.body.appendChild(iframe);

      const wrapped = `
        const _log = [];
        const console = {
          log:  (...a) => _log.push({ type: 'log',   text: a.map(String).join(' ') }),
          error:(...a) => _log.push({ type: 'error', text: a.map(String).join(' ') }),
          warn: (...a) => _log.push({ type: 'warn',  text: a.map(String).join(' ') }),
          info: (...a) => _log.push({ type: 'info',  text: a.map(String).join(' ') }),
        };
        try { ${code} } catch(e) { _log.push({ type: 'error', text: String(e) }); }
        window.parent.postMessage({ type: 'kernal-output', logs: _log }, '*');
      `;

      const handleMsg = (e: MessageEvent) => {
        if (e.data?.type !== 'kernal-output') return;
        setOutput(e.data.logs);
        setIsRunning(false);
        document.body.removeChild(iframe);
        window.removeEventListener('message', handleMsg);
      };

      window.addEventListener('message', handleMsg);
      iframe.contentWindow?.document.write(`<script>${wrapped}<\/script>`);
    }
  }, [code, lang]);

  const handleReset = () => {
    setCode(starterCode);
    setOutput([]);
    setShowOutput(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRun();
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = textareaRef.current!;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = code.slice(0, start) + '  ' + code.slice(end);
      setCode(newVal);
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      }, 0);
    }
  };

  const isHtml = lang === 'html';

  return (
    <div className="border border-k-border rounded-kernal overflow-hidden my-4 shadow-kernal-sm">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 bg-k-surface border-b border-k-border">
        <Terminal size={15} className="text-k-accent" />
        <span className="text-sm font-medium text-k-text flex-1">{title ?? 'Playground'}</span>
        <span className="text-xs text-k-muted font-mono">{lang.toUpperCase()}</span>
        <span className="text-xs text-k-muted ml-2 hidden sm:inline">Ctrl+Enter to run</span>
      </div>

      <div className={`flex ${isHtml ? 'flex-row' : 'flex-col'} min-h-[200px]`}>
        {/* Editor */}
        <div className={isHtml ? 'flex-1 border-r border-k-border' : 'w-full'}>
          <textarea
            ref={textareaRef}
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            className="w-full h-full min-h-[200px] resize-y bg-k-code-bg text-k-text font-mono text-sm px-4 py-3 outline-none leading-relaxed"
            style={{ fontFamily: "'Fira Code', 'JetBrains Mono', monospace", tabSize: 2 }}
          />
        </div>

        {/* HTML iframe preview */}
        {isHtml && (
          <div className="flex-1 bg-white">
            <iframe
              ref={iframeRef}
              sandbox="allow-scripts allow-modals"
              title="HTML preview"
              className="w-full h-full min-h-[200px] border-none"
            />
          </div>
        )}

        {/* JS Console output */}
        {!isHtml && showOutput && (
          <div className="border-t border-k-border bg-k-bg px-4 py-3 min-h-[80px] max-h-[200px] overflow-y-auto font-mono text-xs">
            {output.length === 0 && !isRunning && (
              <span className="text-k-muted">// No output</span>
            )}
            {output.map((line, i) => (
              <div key={i} className={
                line.type === 'error' ? 'text-k-danger' :
                line.type === 'warn'  ? 'text-k-warning' :
                'text-k-text'
              }>
                {line.type === 'error' ? '✗ ' : line.type === 'warn' ? '⚠ ' : '› '}
                {line.text}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer controls */}
      <div className="flex items-center gap-2 px-4 py-2 bg-k-surface border-t border-k-border">
        <button
          onClick={handleRun}
          disabled={isRunning}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-k-accent text-k-bg text-xs font-semibold hover:bg-k-accent/90 disabled:opacity-60 transition-kernal"
        >
          <Play size={12} />
          {isRunning ? 'Running…' : 'Run'}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-k-border text-k-muted text-xs hover:text-k-text hover:border-k-accent/50 transition-kernal"
        >
          <RefreshCw size={12} />
          Reset
        </button>
        <button
          onClick={() => {
            const hash = btoa(unescape(encodeURIComponent(JSON.stringify({ lang, code }))));
            navigator.clipboard.writeText(`${window.location.origin}#/playground?code=${hash}`).catch(() => {});
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-k-border text-k-muted text-xs hover:text-k-text transition-kernal ml-auto"
        >
          <Share2 size={12} />
          Share
        </button>
      </div>
    </div>
  );
}
