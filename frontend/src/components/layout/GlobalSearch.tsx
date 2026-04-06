import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2, ArrowUp, ArrowDown, CornerDownLeft } from 'lucide-react';
import { useSearch } from '../../hooks/useSearch';
import { formatINR } from '../../utils/currency';
import { cn } from '../../utils/cn';

export function GlobalSearch() {
  const navigate = useNavigate();
  const { query, setQuery, results, isLoading, isFetching, isActive, totalCount } = useSearch();
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // ── Keyboard shortcut: Cmd+K / Ctrl+K to focus ──────────────
  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    }
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // ── Click outside to close ──────────────────────────────────
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Reset active index when results change ──────────────────
  useEffect(() => {
    setActiveIndex(-1);
  }, [results]);

  // ── Scroll active item into view ────────────────────────────
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-search-item]');
      items[activeIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  // ── Keyboard navigation ─────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
        return;
      }

      if (!isActive || results.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
      } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        const item = results[activeIndex];
        navigateToResult(item.id);
      }
    },
    [isActive, results, activeIndex]
  );

  const navigateToResult = (id: string) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/records/${id}/edit`);
  };

  const handleClear = () => {
    setQuery('');
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const showDropdown = isOpen && (isActive || query.length > 0);

  return (
    <div ref={containerRef} className="relative flex-1 max-w-md mx-4">
      {/* Search Input */}
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--accent-blue)] transition-colors" />
        <input
          ref={inputRef}
          id="global-search-input"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search transactions..."
          className="w-full h-9 pl-9 pr-20 rounded-lg bg-[var(--bg-elevated)] border border-[var(--bg-border)] text-sm font-body text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-blue)]/50 focus:ring-1 focus:ring-[var(--accent-blue)]/20 transition-all"
          autoComplete="off"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {(isLoading || isFetching) && query.length >= 2 && (
            <Loader2 className="w-3.5 h-3.5 text-[var(--accent-blue)] animate-spin" />
          )}
          {query.length > 0 ? (
            <button
              onClick={handleClear}
              className="p-0.5 rounded text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--bg-border)] text-[10px] font-mono text-[var(--text-muted)]">
              ⌘K
            </kbd>
          )}
        </div>
      </div>

      {/* Dropdown Results */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg shadow-2xl overflow-hidden z-50">
          {/* Results */}
          {isActive && (
            <>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 text-[var(--accent-blue)] animate-spin" />
                  <span className="ml-2 text-sm text-[var(--text-secondary)] font-body">
                    Searching...
                  </span>
                </div>
              ) : results.length > 0 ? (
                <>
                  <div ref={listRef} className="max-h-80 overflow-y-auto">
                    {results.map((item, index) => (
                      <button
                        key={item.id}
                        data-search-item
                        onClick={() => navigateToResult(item.id)}
                        onMouseEnter={() => setActiveIndex(index)}
                        className={cn(
                          'flex items-center w-full px-4 py-3 text-left transition-colors border-b border-[var(--bg-border)]/50 last:border-b-0',
                          activeIndex === index
                            ? 'bg-[var(--bg-elevated)]'
                            : 'hover:bg-[var(--bg-elevated)]/50'
                        )}
                      >
                        {/* Type indicator */}
                        <div
                          className={cn(
                            'w-1.5 h-8 rounded-full mr-3 shrink-0',
                            item.type === 'income'
                              ? 'bg-[var(--accent-green)]'
                              : 'bg-[var(--accent-red)]'
                          )}
                        />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-body text-[var(--text-primary)] truncate">
                            {item.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-body px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
                              {item.category}
                            </span>
                            <span className="text-[11px] font-body text-[var(--text-muted)]">
                              {item.date}
                            </span>
                          </div>
                        </div>

                        {/* Amount */}
                        <span
                          className={cn(
                            'text-sm font-mono font-medium ml-3 shrink-0',
                            item.type === 'income'
                              ? 'text-[var(--accent-green)]'
                              : 'text-[var(--accent-red)]'
                          )}
                        >
                          {item.type === 'income' ? '+' : '-'}
                          {formatINR(item.amount)}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between px-4 py-2 bg-[var(--bg-elevated)]/50 border-t border-[var(--bg-border)]">
                    <span className="text-[11px] text-[var(--text-muted)] font-body">
                      {totalCount} result{totalCount !== 1 ? 's' : ''} found
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] font-mono">
                        <ArrowUp className="w-3 h-3" />
                        <ArrowDown className="w-3 h-3" />
                        navigate
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] font-mono">
                        <CornerDownLeft className="w-3 h-3" />
                        open
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center py-8">
                  <Search className="w-8 h-8 text-[var(--text-muted)] mb-2" />
                  <p className="text-sm text-[var(--text-secondary)] font-body">
                    No results found
                  </p>
                  <p className="text-xs text-[var(--text-muted)] font-body mt-1">
                    Try a different search term
                  </p>
                </div>
              )}
            </>
          )}

          {/* Hint when typing */}
          {!isActive && query.length > 0 && query.length < 2 && (
            <div className="flex items-center justify-center py-6">
              <p className="text-xs text-[var(--text-muted)] font-body">
                Type at least 2 characters to search
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
