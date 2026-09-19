import { Outlet } from 'react-router-dom';
import { useStore } from '@/store';
import TopNav from './TopNav';
import Sidebar from './Sidebar';
import CommandPalette from '@/components/ui/CommandPalette';

export default function Layout() {
  const sidebarOpen = useStore(s => s.sidebarOpen);

  return (
    <div className="flex flex-col min-h-screen bg-k-bg">
      <TopNav />

      <div className="flex flex-1 overflow-hidden" style={{ paddingTop: 'var(--nav-h)' }}>
        {/* Sidebar */}
        <aside
          className={`
            fixed left-0 top-[var(--nav-h)] bottom-0 z-30
            w-[var(--sidebar-w)] bg-k-surface border-r border-k-border
            overflow-y-auto transition-transform duration-200
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0
          `}
        >
          <Sidebar />
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/60 lg:hidden"
            onClick={() => useStore.getState().setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main
          className={`
            flex-1 min-w-0 overflow-y-auto
            transition-[margin] duration-200
            lg:ml-[var(--sidebar-w)]
          `}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>

      <CommandPalette />
    </div>
  );
}
