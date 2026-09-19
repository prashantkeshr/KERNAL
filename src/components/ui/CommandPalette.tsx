import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command, Search, BookOpen, Map, BarChart2, Settings, Sun, Moon, Code2 } from 'lucide-react';
import { useStore } from '@/store';
import { search as searchFn } from '@/lib/search';
import type { SearchEntry } from '@/lib/content-engine';

interface Action {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
}

export default function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen, theme, setTheme, mode, setMode } = useStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchEntry[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const actions: Action[] = [
    { id: 'home',      label: 'Go to Home',        icon: <BookOpen size={16} />, action: () => navigate('/') },
    { id: 'roadmap',   label: 'View Roadmap',       icon: <Map size={16} />,      action: () => navigate('/roadmap') },
    { id: 'progress',  label: 'My Progress',        icon: <BarChart2 size={16} />,action: () => navigate('/progress') },
    { id: 'settings',  label: 'Settings',           icon: <Settings size={16} />, action: () => navigate('/settings') },
    { id: 'light',     label: 'Switch to Light Theme', icon: <Sun size={16} />,   action: () => setTheme('light'), description: mode },
    { id: 'dark',      label: 'Switch to Dark Theme',  icon: <Moon size={16} />,  action: () => setTheme('dark') },
    { id: 'learn',     label: 'Switch to Learn Mode',   icon: <BookOpen size={16} />, action: () => setMode('learn') },
    { id: 'reference', label: 'Switch to Reference Mode', icon: <Code2 size={16} />, action: () => setMode('reference') },
  ].filter(a => {
    if (a.id === 'light' && theme === 'light') return false;
    if (a.id === 'dark'  && theme === 'dark')  return false;
    if (a.id === 'learn' && mode === 'learn')  return false;
    if (a.id === 'reference' && mode === 'reference') return false;
    return true;
  });

  const filteredActions = query
    ? actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()))
    : actions;

  const allItems = [...results, ...filteredActions.map(a => ({ ...a, _isAction: true }))];

  useEffect(() => {
    if (!commandPaletteOpen) return;
    inputRef.current?.focus();
    setQuery('');
    setSelectedIdx(0);
  }, [commandPaletteOpen]);

  useEffect(() => {
    setSelectedIdx(0);
    if (query.length >= 2) {
      setResults(searchFn(query).slice(0, 5));
    } else {
      setResults([]);
    }
  }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        useStore.getState().toggleCommandPalette();
      }
      if (!commandPaletteOpen) return;
      if (e.key === 'Escape') setCommandPaletteOpen(false);
      if (e.key === 'ArrowDown') setSelectedIdx(i => Math.min(i + 1, allItems.length - 1));
      if (e.key === 'ArrowUp')   setSelectedIdx(i => Math.max(i - 1, 0));
      if (e.key === 'Enter') {
        const item = allItems[selectedIdx];
        if (!item) return;
        if ('_isAction' in item) {
          (item as Action).action();
        } else {
          navigate((item as SearchEntry).url.replace('#', ''));
        }
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [commandPaletteOpen, allItems, selectedIdx, navigate, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={() => setCommandPaletteOpen(false)}
      />

      {/* Panel */}
      <div className="fixed left-1/2 top-[20vh] -translate-x-1/2 z-50 w-full max-w-xl px-4 animate-slide-up">
        <div className="bg-k-surface border border-k-border rounded-kernal shadow-kernal overflow-hidden">
          {/* Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-k-border">
            <Command size={18} className="text-k-accent shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search topics or type a command…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-k-text placeholder:text-k-muted outline-none text-sm"
            />
            <kbd className="text-xs text-k-muted bg-k-surface-2 border border-k-border rounded px-1.5 py-0.5">Esc</kbd>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto">
            {results.length > 0 && (
              <>
                <div className="px-4 py-2 text-xs font-semibold text-k-muted uppercase tracking-wider">Topics</div>
                {results.map((r, i) => (
                  <button
                    key={r.id}
                    onClick={() => { navigate(r.url.replace('#', '')); setCommandPaletteOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-kernal ${
                      i === selectedIdx ? 'bg-k-accent/15' : 'hover:bg-k-surface-2'
                    }`}
                  >
                    <Search size={14} className="text-k-muted shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm text-k-text truncate">{r.title}</div>
                      {r.subtitle && <div className="text-xs text-k-muted truncate">{r.subtitle}</div>}
                    </div>
                    {r.tech && <span className="text-xs text-k-accent font-mono ml-auto shrink-0">{r.tech}</span>}
                  </button>
                ))}
              </>
            )}

            {filteredActions.length > 0 && (
              <>
                <div className="px-4 py-2 text-xs font-semibold text-k-muted uppercase tracking-wider">
                  {results.length > 0 ? 'Actions' : 'Quick actions'}
                </div>
                {filteredActions.map((a, i) => {
                  const idx = results.length + i;
                  return (
                    <button
                      key={a.id}
                      onClick={() => { a.action(); setCommandPaletteOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-kernal ${
                        idx === selectedIdx ? 'bg-k-accent/15' : 'hover:bg-k-surface-2'
                      }`}
                    >
                      <span className="text-k-muted shrink-0">{a.icon}</span>
                      <span className="text-sm text-k-text">{a.label}</span>
                    </button>
                  );
                })}
              </>
            )}

            {query && results.length === 0 && filteredActions.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-k-muted">
                No results for "<span className="text-k-text">{query}</span>"
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
