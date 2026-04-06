import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Receipt,
  TrendingUp,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../hooks/useAuth';
import { Badge, roleBadgeVariant } from '../ui/Badge';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles?: ('ADMIN' | 'ANALYST' | 'VIEWER')[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['ADMIN', 'ANALYST'],
  },
  {
    label: 'Records',
    path: '/records',
    icon: <Receipt className="w-5 h-5" />,
  },
  {
    label: 'High Value',
    path: '/high-value',
    icon: <TrendingUp className="w-5 h-5" />,
    roles: ['ADMIN', 'ANALYST'],
  },
  {
    label: 'Users',
    path: '/users',
    icon: <Users className="w-5 h-5" />,
    roles: ['ADMIN'],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();

  const filteredItems = navItems.filter(
    (item) => !item.roles || item.roles.some((r) => hasRole([r]))
  );

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-[var(--bg-surface)] border-r border-[var(--bg-border)] z-40 flex flex-col overflow-hidden"
    >
      {/* Gradient top border */}
      <div className="h-[3px] bg-gradient-to-r from-[var(--accent-green)] to-[var(--accent-blue)] shrink-0" />

      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 shrink-0">
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-display font-bold text-lg text-[var(--text-primary)] tracking-tight"
          >
            FINANCE <span className="text-[var(--accent-green)]">OS</span>
          </motion.span>
        )}
        {collapsed && (
          <span className="font-display font-bold text-lg text-[var(--accent-green)] mx-auto">
            FO
          </span>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute top-[68px] -right-3 w-6 h-6 rounded-full bg-[var(--bg-elevated)] border border-[var(--bg-border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--bg-border-bright)] transition-colors z-50"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-all duration-150 group relative',
                isActive
                  ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[var(--accent-green)]"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="truncate"
                >
                  {item.label}
                </motion.span>
              )}
            </NavLink>
          );
        })}

        {/* Separator */}
        <div className="my-3 mx-3 border-t border-[var(--bg-border)]" />

        <NavLink
          to="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-all duration-150',
            location.pathname === '/settings'
              ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)]'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
          )}
        >
          <Settings className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>
      </nav>

      {/* User profile card */}
      <div className="px-2 py-4 border-t border-[var(--bg-border)] shrink-0">
        <div className="flex items-center gap-3 px-3 py-2">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center text-xs font-bold text-white font-mono shrink-0">
            {user?.name
              ?.split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)}
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 min-w-0"
            >
              <p className="text-sm font-medium text-[var(--text-primary)] truncate font-body">
                {user?.name}
              </p>
              <Badge variant={roleBadgeVariant(user?.role || 'VIEWER')}>
                {user?.role}
              </Badge>
            </motion.div>
          )}
        </div>
        <button
          onClick={logout}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 mt-1 rounded-lg text-sm font-body transition-all duration-150',
            'text-[var(--text-secondary)] hover:bg-[var(--accent-red)]/10 hover:text-[var(--accent-red)]'
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
}
