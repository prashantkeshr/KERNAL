import { useState, useEffect } from 'react';
import { Sun, Moon, BookOpen, Code2, Trash2, Upload } from 'lucide-react';
import { useStore } from '@/store';
import { clearAllData, importAllData, getStorageEstimate } from '@/lib/storage';

export default function SettingsPage() {
  const { theme, mode, fontSize, setTheme, setMode, setFontSize } = useStore();
  const [storageInfo, setStorageInfo] = useState<{ usage: number; quota: number } | null>(null);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    getStorageEstimate().then(setStorageInfo);
  }, []);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        importAllData(data);
        window.location.reload();
      } catch {
        alert('Invalid backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    if (confirm('This will delete ALL your progress, scores, and preferences. Are you sure?')) {
      clearAllData();
      setCleared(true);
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const pct = storageInfo
    ? Math.round((storageInfo.usage / storageInfo.quota) * 100)
    : 0;

  const fmt = (b: number) => {
    if (b === 0) return '0 B';
    const k = 1024;
    const s = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return `${parseFloat((b / Math.pow(k, i)).toFixed(1))} ${s[i]}`;
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-k-text mb-2">Settings</h1>
        <p className="text-k-muted">All preferences are stored locally on your device.</p>
      </header>

      <div className="space-y-6 max-w-xl">
        {/* Appearance */}
        <Section title="Appearance">
          <SettingRow label="Theme" description="Choose how KERNAL looks">
            <div className="flex bg-k-bg border border-k-border rounded-lg p-0.5">
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-kernal ${
                  theme === 'dark' ? 'bg-k-surface text-k-text' : 'text-k-muted hover:text-k-text'
                }`}
              >
                <Moon size={14} /> Dark
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-kernal ${
                  theme === 'light' ? 'bg-k-surface text-k-text' : 'text-k-muted hover:text-k-text'
                }`}
              >
                <Sun size={14} /> Light
              </button>
            </div>
          </SettingRow>

          <SettingRow label="Font size" description={`Current: ${fontSize}px`}>
            <input
              type="range"
              min={13}
              max={20}
              step={1}
              value={fontSize}
              onChange={e => setFontSize(Number(e.target.value))}
              className="w-32 accent-[var(--accent)]"
            />
          </SettingRow>
        </Section>

        {/* Mode */}
        <Section title="Learning Mode">
          <SettingRow label="Mode" description="How KERNAL presents content">
            <div className="flex bg-k-bg border border-k-border rounded-lg p-0.5">
              <button
                onClick={() => setMode('learn')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-kernal ${
                  mode === 'learn' ? 'bg-k-surface text-k-text' : 'text-k-muted hover:text-k-text'
                }`}
              >
                <BookOpen size={14} /> Learn
              </button>
              <button
                onClick={() => setMode('reference')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-kernal ${
                  mode === 'reference' ? 'bg-k-surface text-k-text' : 'text-k-muted hover:text-k-text'
                }`}
              >
                <Code2 size={14} /> Reference
              </button>
            </div>
          </SettingRow>
        </Section>

        {/* Storage */}
        {storageInfo && (
          <Section title="Storage">
            <div className="px-1">
              <div className="flex justify-between text-xs text-k-muted mb-1.5">
                <span>Used: {fmt(storageInfo.usage)}</span>
                <span>Available: {fmt(storageInfo.quota)}</span>
              </div>
              <div className="h-2 bg-k-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(pct, 100)}%`,
                    background: pct > 80 ? 'var(--danger)' : 'var(--accent)',
                  }}
                />
              </div>
              <p className="text-xs text-k-muted mt-1">{pct}% of available storage used</p>
            </div>
          </Section>
        )}

        {/* Data */}
        <Section title="Your Data">
          <div className="space-y-3">
            <div>
              <p className="text-xs text-k-muted mb-2">Import a backup file to restore your data.</p>
              <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-k-border text-k-muted text-sm hover:text-k-text hover:border-k-accent/50 cursor-pointer transition-kernal w-fit">
                <Upload size={14} />
                Import backup
                <input type="file" accept=".json" className="hidden" onChange={handleImport} />
              </label>
            </div>

            <div>
              <p className="text-xs text-k-muted mb-2">Permanently delete all your progress and preferences.</p>
              <button
                onClick={handleClear}
                disabled={cleared}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-k-danger/40 text-k-danger text-sm hover:bg-k-danger/10 disabled:opacity-50 transition-kernal"
              >
                <Trash2 size={14} />
                {cleared ? 'Cleared! Reloading…' : 'Clear all data'}
              </button>
            </div>
          </div>
        </Section>

        {/* About */}
        <Section title="About">
          <div className="text-xs text-k-muted space-y-1">
            <p>KERNAL v0.1.0-alpha · Phase 0 — Core Engine</p>
            <p>Built for Dhurta.Org · MIT License</p>
            <p className="font-mono text-k-accent">&gt;_ The core of every coder.</p>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-k-surface border border-k-border rounded-kernal overflow-hidden">
      <div className="px-4 py-2.5 border-b border-k-border bg-k-surface-2/50">
        <h2 className="text-xs font-semibold text-k-muted uppercase tracking-wider">{title}</h2>
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-sm font-medium text-k-text">{label}</div>
        {description && <div className="text-xs text-k-muted">{description}</div>}
      </div>
      {children}
    </div>
  );
}
