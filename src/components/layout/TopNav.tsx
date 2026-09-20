import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, Sun, Moon, BookOpen, Code2, Keyboard } from 'lucide-react';
import { useStore } from '@/store';
import { search as searchFn } from '@/lib/search';
import type { SearchEntry } from '@/lib/content-engine';

export default function TopNav() {
  const { theme, mode, sidebarOpen, setTheme, setMode, toggleSidebar, setCommandPaletteOpen } = useStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchEntry[]>([]);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    if (q.trim().length >= 2) {
      setResults(searchFn(q).slice(0, 8));
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, []);

  const handleResultClick = (entry: SearchEntry) => {
    setShowResults(false);
    setQuery('');
    navigate(entry.url.replace('#', ''));
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 flex items-center gap-3 px-4 border-b border-k-border bg-k-surface/95 backdrop-blur-sm"
      style={{ height: 'var(--nav-h)' }}
    >
      {/* Hamburger */}
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-lg text-k-muted hover:text-k-text hover:bg-k-surface-2 transition-kernal"
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        <Menu size={20} />
      </button>

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 select-none shrink-0">
        <img src="/icon-192.png" alt="KERNAL mascot" className="h-8 w-8 object-contain drop-shadow-sm" />
        <span className="font-black text-lg tracking-widest text-k-text uppercase hidden sm:inline">KERNAL</span>
      </Link>

      {/* Search */}
      <div className="flex-1 max-w-lg mx-2 relative">
        <div className="flex items-center gap-2 bg-k-bg border border-k-border rounded-lg px-3 py-1.5 focus-within:border-k-accent transition-kernal">
          <Search size={15} className="text-k-muted shrink-0" />
          <input
            type="text"
            placeholder="Search topics... (Ctrl+K)"
            value={query}
            onChange={e => handleSearch(e.target.value)}
            onFocus={() => query.length >= 2 && setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 150)}
            className="flex-1 bg-transparent text-sm text-k-text placeholder:text-k-muted outline-none min-w-0"
          />
          <kbd
            className="hidden sm:flex items-center gap-0.5 text-xs text-k-muted bg-k-surface-2 border border-k-border rounded px-1.5 py-0.5 cursor-pointer"
            onClick={() => setCommandPaletteOpen(true)}
          >
            Ctrl+K
          </kbd>
        </div>

        {/* Search Results Dropdown */}
        {showResults && results.length > 0 && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-k-surface border border-k-border rounded-kernal shadow-kernal overflow-hidden z-50 animate-slide-up">
            {results.map(r => (
              <button
                key={r.id}
                onMouseDown={() => handleResultClick(r)}
                className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-k-surface-2 transition-kernal"
              >
                <span className="text-xs text-k-accent font-mono uppercase bg-k-surface-2 rounded px-1.5 py-0.5 mt-0.5 shrink-0">
                  {r.tech ?? r.type}
                </span>
                <div className="min-w-0">
                  <div className="text-sm text-k-text font-medium truncate">{r.title}</div>
                  {r.subtitle && <div className="text-xs text-k-muted truncate">{r.subtitle}</div>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mode Toggle */}
      <div className="hidden sm:flex items-center bg-k-bg border border-k-border rounded-lg p-0.5">
        <button
          onClick={() => setMode('learn')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-kernal ${
            mode === 'learn' ? 'bg-k-accent text-k-bg' : 'text-k-muted hover:text-k-text'
          }`}
        >
          <BookOpen size={14} />
          <span className="hidden md:inline">Learn</span>
        </button>
        <button
          onClick={() => setMode('reference')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-kernal ${
            mode === 'reference' ? 'bg-k-accent text-k-bg' : 'text-k-muted hover:text-k-text'
          }`}
        >
          <Code2 size={14} />
          <span className="hidden md:inline">Reference</span>
        </button>
      </div>

      {/* Command Palette button */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="p-2 rounded-lg text-k-muted hover:text-k-text hover:bg-k-surface-2 transition-kernal"
        aria-label="Open command palette"
      >
        <Keyboard size={18} />
      </button>

      {/* Theme Toggle */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="p-2 rounded-lg text-k-muted hover:text-k-text hover:bg-k-surface-2 transition-kernal"
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </header>
  );
}
