import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Badge, roleBadgeVariant } from '../ui/Badge';
import { GlobalSearch } from './GlobalSearch';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/records': 'Financial Records',
  '/records/new': 'New Record',
  '/high-value': 'High-Value Transactions',
  '/anomalies': 'Anomaly Detection',
  '/users': 'User Management',
  '/settings': 'Settings',
  '/unauthorized': 'Unauthorized',
};

function getPageTitle(pathname: string): string {
  // Check exact match first
  if (pageTitles[pathname]) return pageTitles[pathname];
  // Check if editing a record
  if (/^\/records\/.+\/edit$/.test(pathname)) return 'Edit Record';
  // Fallback: check prefix matches
  for (const [path, title] of Object.entries(pageTitles)) {
    if (pathname.startsWith(path)) return title;
  }
  return 'Finance OS';
}

interface TopbarProps {
  sidebarWidth: number;
}

export function Topbar({ sidebarWidth }: TopbarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className="fixed top-0 right-0 h-14 bg-[var(--bg-surface)]/80 backdrop-blur-md border-b border-[var(--bg-border)] z-30 flex items-center justify-between px-6 transition-all duration-200"
      style={{ left: sidebarWidth }}
    >
      {/* Left: Page title */}
      <h1 className="text-base font-display font-semibold text-[var(--text-primary)] shrink-0">
        {getPageTitle(location.pathname)}
      </h1>

      {/* Center: Global Search */}
      <GlobalSearch />

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button className="relative p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--accent-green)]" />
        </button>

        {/* User menu */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center text-[10px] font-bold text-white font-mono">
              {user?.name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </div>
            <span className="text-sm font-body text-[var(--text-primary)] hidden md:inline">
              {user?.name}
            </span>
            <ChevronDown className="w-3 h-3 text-[var(--text-secondary)]" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg shadow-2xl py-1 z-50">
              <div className="px-4 py-3 border-b border-[var(--bg-border)]">
                <p className="text-sm font-medium text-[var(--text-primary)] font-body">
                  {user?.name}
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-body">
                  {user?.email}
                </p>
                <Badge
                  variant={roleBadgeVariant(user?.role || 'VIEWER')}
                  className="mt-2"
                >
                  {user?.role}
                </Badge>
              </div>
              <button
                onClick={() => {
                  setShowDropdown(false);
                  logout();
                }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--accent-red)] hover:bg-[var(--accent-red)]/5 transition-colors font-body"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
