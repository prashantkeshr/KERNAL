import { useEffect, useRef, useState } from 'react';
import hljs from 'highlight.js';
import { Copy, Check, Terminal } from 'lucide-react';

interface Props {
  code: string;
  lang?: string;
  filename?: string;
  caption?: string;
  showTryButton?: boolean;
  onTry?: (code: string, lang: string) => void;
}

export default function CodeBlock({ code, lang = 'plaintext', filename, caption, showTryButton, onTry }: Props) {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!codeRef.current) return;
    codeRef.current.removeAttribute('data-highlighted');
    hljs.highlightElement(codeRef.current);
  }, [code, lang]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const el = document.createElement('textarea');
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const langLabel = lang === 'plaintext' ? '' : lang.toUpperCase();

  return (
    <div className="rounded-kernal overflow-hidden border border-k-border my-4 shadow-kernal-sm">
      {/* Header bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-k-surface border-b border-k-border">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        {filename && (
          <span className="text-xs text-k-muted font-mono ml-1 flex-1 truncate">{filename}</span>
        )}
        {!filename && langLabel && (
          <span className="text-xs text-k-accent font-mono ml-1 flex-1">{langLabel}</span>
        )}
        <div className="flex items-center gap-1 ml-auto">
          {showTryButton && onTry && (
            <button
              onClick={() => onTry(code, lang)}
              className="flex items-center gap-1 text-xs text-k-accent hover:text-k-text bg-k-accent/10 hover:bg-k-surface-2 rounded px-2 py-1 transition-kernal"
            >
              <Terminal size={12} />
              Try it
            </button>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-k-muted hover:text-k-text bg-k-surface-2 hover:bg-k-border rounded px-2 py-1 transition-kernal"
            aria-label="Copy code"
          >
            {copied ? <Check size={12} className="text-k-success" /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Code */}
      <pre className="overflow-x-auto text-sm leading-relaxed" style={{ background: 'var(--code-bg)' }}>
        <code
          ref={codeRef}
          className={`language-${lang} block px-5 py-4`}
          style={{ background: 'transparent', fontFamily: "'Fira Code', 'JetBrains Mono', monospace" }}
        >
          {code}
        </code>
      </pre>

      {caption && (
        <div className="px-4 py-2 bg-k-surface/50 border-t border-k-border text-xs text-k-muted italic">
          {caption}
        </div>
      )}
    </div>
  );
}
