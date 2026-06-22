'use client';

import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { SettingsProps, SettingsState } from '../settings/types';
import { SkeletonSearch } from '../components/skeleton';
import './search.css';
import { useTheme } from '../components/ThemeProvider';
import Navbar from '../components/navbar';
import '../settings/settings.css';
import searchService, { SearchResult, SearchMeta } from '../services/searchService';

type PriorityItem = {
  key: string;
  label: string;
  icon: string;
};

type ToggleRowProps = {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
};

function ToggleRow({ label, description, checked, onChange, disabled }: ToggleRowProps) {
  return (
    <label className={`search-toggle-row ${disabled ? 'disabled' : ''}`}>
      <span className="search-toggle-text">
        <span className="search-toggle-label">{label}</span>
        {description ? (
          <span className="search-toggle-description">{description}</span>
        ) : null}
      </span>

      <span className="search-switch" aria-hidden="true">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <span className="search-switch-slider" />
      </span>
    </label>
  );
}

function FileIcon({ iconUrl, size = 20 }: { iconUrl?: string; size?: number }) {
  if (!iconUrl) {
    return <span className="search-result-icon-fallback" style={{ width: size, height: size }} />;
  }
  return (
    <img
      src={iconUrl}
      alt=""
      width={size}
      height={size}
      className="search-result-icon-img"
      style={{ objectFit: 'contain' }}
    />
  );
}

const DEFAULT_PRIORITY: PriorityItem[] = [
  { key: 'applications', label: 'Applications', icon: '🧩' },
  { key: 'files', label: 'Files', icon: '📄' },
  { key: 'folders', label: 'Folders', icon: '📁' },
  { key: 'web', label: 'Web Search', icon: '🌐' },
];

const EXCLUSION_SUGGESTIONS = [
  'node_modules',
  '.git',
  'Windows/System32',
  'hidden files',
  'cache folders',
  'temp',
] as const;

const SHORTCUT_FOCUS_DEFAULT = 'meta+k';
const SHORTCUT_BROWSER_DEFAULT = 'ctrl+shift+s';

function matchShortcut(e: KeyboardEvent, shortcut: string): boolean {
  if (!shortcut) return false;
  const parts = shortcut.toLowerCase().split('+');
  const keyPart = parts.pop()!;
  const eventKey = e.key === ' ' ? 'space' : e.key.toLowerCase();
  return (
    eventKey === keyPart &&
    parts.includes('ctrl') === e.ctrlKey &&
    parts.includes('meta') === e.metaKey &&
    parts.includes('shift') === e.shiftKey &&
    parts.includes('alt') === e.altKey
  );
}

function formatShortcut(s: string): string {
  if (!s) return '';
  return s.split('+').map(p => {
    switch (p) {
      case 'ctrl': return 'Ctrl';
      case 'meta': return '⌘';
      case 'shift': return '⇧';
      case 'alt': return '⌥';
      case 'space': return 'Space';
      default: return p.toUpperCase();
    }
  }).join(' + ');
}

function ShortcutRecorder({ value, onChange }: { value: string; onChange: (s: string) => void }) {
  const [recording, setRecording] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!recording) return;
    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const parts: string[] = [];
      if (e.ctrlKey) parts.push('ctrl');
      if (e.metaKey) parts.push('meta');
      if (e.shiftKey) parts.push('shift');
      if (e.altKey) parts.push('alt');
      if (parts.length === 0) return;
      const key = e.key === ' ' ? 'space' : e.key.toLowerCase();
      if (['control', 'shift', 'alt', 'meta'].includes(key)) return;
      parts.push(key);
      onChange(parts.join('+'));
      setRecording(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [recording, onChange]);

  return (
    <button
      ref={ref}
      type="button"
      className={`search-shortcut-recorder ${recording ? 'recording' : ''}`}
      onClick={() => setRecording(true)}
      onBlur={() => setRecording(false)}
      onFocus={() => setRecording(true)}
    >
      {recording ? 'Press shortcut...' : formatShortcut(value)}
    </button>
  );
}

function buildSearchUrl(baseUrl: string, query: string): string {
  const encoded = encodeURIComponent(query);
  if (baseUrl.includes('{query}')) {
    return baseUrl.replace(/\{query\}/g, encoded);
  }
  return baseUrl + encoded;
}

function SearchBar({ onSearch, focusShortcut, appShortcut }: { onSearch: (q: string) => void; focusShortcut: string; appShortcut?: string }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (matchShortcut(e, focusShortcut) || (appShortcut && matchShortcut(e, appShortcut))) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setQuery('');
        onSearch('');
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSearch, focusShortcut, appShortcut]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  return (
    <form className="search-bar-form" onSubmit={handleSubmit}>
      <div className="search-bar-input-wrapper">
        <span className="search-bar-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="text"
          className="search-bar-input"
          placeholder={`Search apps, files, folders... (${formatShortcut(focusShortcut)})`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button type="button" className="search-bar-clear" onClick={() => { setQuery(''); onSearch(''); }}>
            ✕
          </button>
        )}
      </div>
      <button type="submit" className="search-bar-submit">Search</button>
    </form>
  );
}

function SearchResultsSection({ focusShortcut, appShortcut, domains, onOpenInBrowser }: {
  focusShortcut: string;
  appShortcut: string;
  domains: { name: string; url: string }[];
  onOpenInBrowser?: (query: string, domainUrl?: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [meta, setMeta] = useState<SearchMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const resultsRef = useRef<HTMLDivElement>(null);
  const queryRef = useRef(query);
  queryRef.current = query;

  const handleSearch = useCallback(async (q: string) => {
    setQuery(q);
    if (!q.trim()) {
      setResults([]);
      setMeta(null);
      setError('');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await searchService.search(q);
      if (res.data) {
        const responseData = res.data as unknown as { data: SearchResult[]; meta: SearchMeta };
        setResults(responseData.data || []);
        setMeta(responseData.meta || null);

        if (responseData.meta?.webFallback) {
          await searchService.webFallback(q);
        }
      } else {
        setError(res.error || 'Search failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
      setSelectedIndex(-1);
    }
  }, []);

  const handleOpen = useCallback(async (result: SearchResult) => {
    try {
      await searchService.openFile(result.path);
    } catch (err) {
      console.error('Failed to open:', err);
    }
  }, []);

  const handleShowInFolder = useCallback(async (result: SearchResult) => {
    try {
      await searchService.showInFolder(result.path);
    } catch (err) {
      console.error('Failed to show in folder:', err);
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!results.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleOpen(results[selectedIndex]);
    }
  }, [results, selectedIndex, handleOpen]);

  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const items = resultsRef.current.querySelectorAll('.search-result-item');
      if (items[selectedIndex]) {
        items[selectedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    const order: string[] = [];
    for (const r of results) {
      if (!groups[r.category]) {
        groups[r.category] = [];
        order.push(r.category);
      }
      groups[r.category].push(r);
    }
    return { groups, order };
  }, [results]);

  return (
    <div className="search-results-section">
      <SearchBar onSearch={handleSearch} focusShortcut={focusShortcut} appShortcut={appShortcut} />

      <div
        className="search-results-container"
        ref={resultsRef}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {loading && (
          <div className="search-loading">
            <div className="search-spinner" />
            <span>Searching...</span>
          </div>
        )}

        {error && <div className="search-error">{error}</div>}

        {!loading && !error && query && (
          <>
            {results.length === 0 && (
              <div className="search-no-results">
                <div className="search-no-results-icon">🔍</div>
                <div className="search-no-results-text">No results found for &quot;{query}&quot;</div>
              </div>
            )}

            {results.length > 0 && (
              <div className="search-results-list">
                {groupedResults.order.map(category => (
                  <div key={category} className="search-result-group">
                    <div className="search-result-group-header">{category}</div>
                    {groupedResults.groups[category].map((result) => {
                      const globalIdx = results.indexOf(result);
                      return (
                        <div
                          key={result.id}
                          className={`search-result-item ${globalIdx === selectedIndex ? 'selected' : ''}`}
                          onClick={() => handleOpen(result)}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            handleShowInFolder(result);
                          }}
                        >
                        <span className="search-result-icon" aria-hidden="true">
                          <FileIcon iconUrl={result.iconUrl} />
                        </span>
                          <div className="search-result-info">
                            <div className="search-result-name">{result.name}</div>
                            <div className="search-result-path">{result.path}</div>
                          </div>
                          <div className="search-result-actions">
                            <button
                              className="search-result-action"
                              onClick={(e) => { e.stopPropagation(); handleShowInFolder(result); }}
                              title="Show in folder"
                            >
                              📂
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            <div className="search-domain-bar">
              {domains.length > 0 ? domains.map(d => (
                <button key={d.name} className="search-domain-btn" onClick={() => onOpenInBrowser?.(query, buildSearchUrl(d.url, query))}>
                  Search on {d.name}
                </button>
              )) : (
                <button className="search-domain-btn" onClick={() => onOpenInBrowser?.(query)}>
                  Search in browser
                </button>
              )}
            </div>
          </>
        )}

        {!query && !loading && (
          <div className="search-welcome">
            <div className="search-welcome-icon">🔎</div>
            <div className="search-welcome-title">Search Your System</div>
            <div className="search-welcome-text">
              Search for applications (exact match), files & folders (fuzzy match), or use web fallback
            </div>
            <div className="search-welcome-shortcuts">
              <span><kbd>↑↓</kbd> Navigate</span>
              <span><kbd>↵</kbd> Open</span>
              <span><kbd>{formatShortcut(focusShortcut)}</kbd> Focus search</span>
              <span><kbd>{formatShortcut(appShortcut)}</kbd> Focus search</span>
              <span><kbd>esc</kbd> Clear</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function SearchContent({ settings, saveSettings, loading }: SettingsProps) {
  const [spotlightEnabled, setSpotlightEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('spotlightEnabled') !== 'false';
    }
    return true;
  });

  const handleToggleSpotlight = (next: boolean) => {
    setSpotlightEnabled(next);
    localStorage.setItem('spotlightEnabled', String(next));
    window.dispatchEvent(new Event('storage'));
  };

  const [focusShortcut, setFocusShortcut] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('search-focus-shortcut') || SHORTCUT_FOCUS_DEFAULT;
    return SHORTCUT_FOCUS_DEFAULT;
  });

  const handleChangeFocusShortcut = useCallback((next: string) => {
    setFocusShortcut(next);
    localStorage.setItem('search-focus-shortcut', next);
  }, []);

  const [openSearchAtStartup, setOpenSearchAtStartup] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('search-open-at-startup') === 'true';
    return false;
  });

  const handleToggleStartupSearch = (next: boolean) => {
    setOpenSearchAtStartup(next);
    localStorage.setItem('search-open-at-startup', String(next));
  };

  const [domains, setDomains] = useState<{ name: string; url: string }[]>(() => {
    if (typeof window !== 'undefined') {
      try { return JSON.parse(localStorage.getItem('search-domains') || '[]'); } catch {}
    }
    return [
      { name: 'Google', url: 'https://www.google.com/search?q=' },
      { name: 'YouTube', url: 'https://www.youtube.com/results?search_query=' },
    ];
  });

  const saveDomains = (next: { name: string; url: string }[]) => {
    setDomains(next);
    localStorage.setItem('search-domains', JSON.stringify(next));
  };

  const [editingDomain, setEditingDomain] = useState<number | null>(null);

  const [browserShortcut, setBrowserShortcut] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('search-browser-shortcut') || SHORTCUT_BROWSER_DEFAULT;
    return SHORTCUT_BROWSER_DEFAULT;
  });

  const handleChangeBrowserShortcut = useCallback((next: string) => {
    setBrowserShortcut(next);
    localStorage.setItem('search-browser-shortcut', next);
  }, []);

  const openInBrowser = useCallback((q: string, domainUrl?: string) => {
    const url = domainUrl || (domains.length > 0 ? buildSearchUrl(domains[0].url, q) : `https://www.google.com/search?q=${encodeURIComponent(q)}`);
    window.open(url, '_blank');
  }, [domains]);

  useEffect(() => {
    if (openSearchAtStartup && window.location.pathname !== '/search') {
      window.location.href = '/search';
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [priorityOrder, setPriorityOrder] = useState<PriorityItem[]>(DEFAULT_PRIORITY);
  const [draggingKey, setDraggingKey] = useState<string | null>(null);

  const [searchModes, setSearchModes] = useState({
    appSearch: true,
    fileSearch: true,
    folderSearch: true,
    webSearch: false,
    recentSearchHistory: false,
    smartSuggestions: true,
  });

  const [performance, setPerformance] = useState({
    backgroundIndexing: true,
    cacheResults: true,
    resultLimit: 25,
  });

  const [exclusions, setExclusions] = useState<string[]>([
    'node_modules',
    '.git',
    'Windows/System32',
    'hidden files',
    'cache folders',
  ]);

  const [activeExclusion, setActiveExclusion] = useState<number | null>(null);

  const [analytics, setAnalytics] = useState({
    totalSearches: 0,
    totalResultsFound: 0,
    lastSearchQuery: '',
    historyCount: 0,
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await searchService.getAnalytics();
        if (res.data) {
          const a = res.data as unknown as { totalSearches: number; totalResultsFound: number; lastSearchQuery: string; historyCount: number };
          setAnalytics({
            totalSearches: a.totalSearches || 0,
            totalResultsFound: a.totalResultsFound || 0,
            lastSearchQuery: a.lastSearchQuery || '',
            historyCount: a.historyCount || 0,
          });
        }
      } catch {
        // not critical
      }
    };
    fetchAnalytics();
  }, []);

  const [smartSuggestions, setSmartSuggestions] = useState({
    frequentlyUsedApps: true,
    recentFilesSuggestions: true,
    recommendedFolders: true,
    predictionSystem: true,
  });

  const [searchHistoryDisabled, setSearchHistoryDisabled] = useState(false);
  const [localOnlyIndexing, setLocalOnlyIndexing] = useState(true);

  const [indexStatus, setIndexStatus] = useState<{ isIndexing: boolean; progress: { phase: string; current: number } }>({
    isIndexing: false,
    progress: { phase: '', current: 0 },
  });

  const [indexingStarted, setIndexingStarted] = useState(false);

  const checkIndexStatus = useCallback(async () => {
    try {
      const res = await searchService.getIndexStatus();
      if (res.data) {
        const status = res.data as unknown as { isIndexing: boolean; progress: { phase: string; current: number } };
        setIndexStatus(status);
        if (status.isIndexing) {
          setTimeout(checkIndexStatus, 3000);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const startIndexing = useCallback(async () => {
    try {
      setIndexingStarted(true);
      const res = await searchService.startIndexing();
      if (res.data) {
        setIndexStatus(prev => ({ ...prev, isIndexing: true, progress: { ...prev.progress, phase: 'Indexing started...' } }));
        setTimeout(checkIndexStatus, 2000);
      }
    } catch {
      setIndexingStarted(false);
    }
  }, [checkIndexStatus]);

  const restorePriority = useCallback(() => {
    setPriorityOrder([...DEFAULT_PRIORITY]);
    setDraggingKey(null);
  }, []);

  const movePriority = useCallback((key: string, direction: -1 | 1) => {
    setPriorityOrder((prev) => {
      const fromIdx = prev.findIndex((x) => x.key === key);
      if (fromIdx < 0) return prev;

      const toIdx = fromIdx + direction;
      if (toIdx < 0 || toIdx >= prev.length) return prev;

      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  }, []);

  const onDropPriority = useCallback(
    (overKey: string) => {
      setPriorityOrder((prev) => {
        if (!draggingKey) return prev;
        if (draggingKey === overKey) return prev;

        const fromIdx = prev.findIndex((x) => x.key === draggingKey);
        const toIdx = prev.findIndex((x) => x.key === overKey);
        if (fromIdx < 0 || toIdx < 0) return prev;

        const next = [...prev];
        const [moved] = next.splice(fromIdx, 1);
        next.splice(toIdx, 0, moved);
        return next;
      });

      setDraggingKey(null);
    },
    [draggingKey]
  );

  const addExclusion = useCallback(() => {
    const remaining = EXCLUSION_SUGGESTIONS.filter((x) => !exclusions.includes(x));
    if (remaining.length === 0) return;
    const next = remaining[0];
    setExclusions((prev) => [...prev, next]);
    setActiveExclusion(exclusions.length);
  }, [exclusions]);

  const removeExclusion = useCallback(() => {
    setExclusions((prev) => {
      if (prev.length === 0) return prev;

      if (activeExclusion === null) {
        const next = prev.slice(0, -1);
        setActiveExclusion(next.length ? next.length - 1 : null);
        return next;
      }

      const idx = activeExclusion;
      if (idx < 0 || idx >= prev.length) return prev;

      const next = prev.filter((_, i) => i !== idx);
      setActiveExclusion(next.length ? Math.min(idx, next.length - 1) : null);
      return next;
    });
  }, [activeExclusion]);

  const clearSearchHistory = useCallback(async () => {
    try {
      await searchService.clearHistory();
      setAnalytics(prev => ({ ...prev, historyCount: 0 }));
    } catch {
      // ignore
    }
  }, []);

  const remainingExclusionCount = useMemo(() => {
    return EXCLUSION_SUGGESTIONS.filter((x) => !exclusions.includes(x)).length;
  }, [exclusions]);

  if (!settings) return null;

  const instantSuggestionsEnabled = settings?.searchPreferences?.fuzzySearch ?? true;

  return (
    <div className="tab-section search-settings">
      <h2>Search</h2>

      {/* Search Bar & Results */}
      <SearchResultsSection focusShortcut={focusShortcut} appShortcut={browserShortcut} domains={domains} onOpenInBrowser={openInBrowser} />

      {/* 1) Search System Overview Card */}
      <div className="search-card search-overview">
        <div className="search-card-header">
          <div>
            <h3 className="search-card-title">Spotlight-style Search</h3>
            <p className="search-card-subtitle">
              <kbd className="search-kbd">{formatShortcut(browserShortcut)}</kbd> search in browser · <kbd className="search-kbd">{formatShortcut(focusShortcut)}</kbd> focus
            </p>
          </div>

          <div className={`search-status ${spotlightEnabled ? 'on' : 'off'}`}>
            <span className="search-status-dot" aria-hidden="true" />
            <span className="search-status-text">
              {spotlightEnabled ? 'Running' : 'Paused'}
            </span>
          </div>
        </div>

        <div className="search-overview-content">
          <ToggleRow
            label="Enable Spotlight Search"
            description="Turn the search UI on/off for this app."
            checked={spotlightEnabled}
            onChange={handleToggleSpotlight}
          />
          <div className="search-shortcut-row">
            <label className="search-shortcut-label">
              <span className="search-toggle-label">Focus search shortcut</span>
              <span className="search-toggle-description">Press this combination to focus the search bar</span>
            </label>
            <ShortcutRecorder value={focusShortcut} onChange={handleChangeFocusShortcut} />
          </div>
          <div className="search-shortcut-row">
            <label className="search-shortcut-label">
              <span className="search-toggle-label">Browser search shortcut</span>
              <span className="search-toggle-description">Press this combination to search in browser</span>
            </label>
            <ShortcutRecorder value={browserShortcut} onChange={handleChangeBrowserShortcut} />
          </div>
          <div className="search-info-box">
            <strong>OS-level search</strong> — The search server continues running even when this tab is closed. Use the backend API directly from any process on this machine.
          </div>
        </div>
      </div>

      {/* 2) Search Priority Manager */}
      <div className="search-grid-2">
        <div className="search-card search-priority">
          <div className="search-card-header">
            <div>
              <h3 className="search-card-title">Search Priority Manager</h3>
              <p className="search-card-subtitle">Reorder how results are prioritized.</p>
            </div>
            <button type="button" className="search-btn" onClick={restorePriority}>
              Restore Default
            </button>
          </div>

          <div className="search-priority-list" role="list">
            {priorityOrder.map((item, index) => (
              <div
                key={item.key}
                className={`search-priority-item ${draggingKey === item.key ? 'dragging' : ''}`}
                draggable
                onDragStart={() => setDraggingKey(item.key)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDropPriority(item.key)}
                role="listitem"
                aria-label={`${index + 1}. ${item.label}`}
              >
                <span className="search-priority-number">{index + 1}</span>
                <span className="search-priority-icon" aria-hidden="true">{item.icon}</span>
                <div className="search-priority-main">
                  <div className="search-priority-label">{item.label}</div>
                  <div className="search-priority-hint">Drag to reorder or use arrows</div>
                </div>

                <div className="search-priority-actions" aria-label="Reorder actions">
                  <button
                    type="button"
                    className="search-icon-btn"
                    onClick={() => movePriority(item.key, -1)}
                    disabled={index === 0}
                    aria-label={`Move ${item.label} up`}
                  >↑</button>
                  <button
                    type="button"
                    className="search-icon-btn"
                    onClick={() => movePriority(item.key, 1)}
                    disabled={index === priorityOrder.length - 1}
                    aria-label={`Move ${item.label} down`}
                  >↓</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3) Search Modes */}
        <div className="search-card search-modes">
          <div className="search-card-header">
            <div>
              <h3 className="search-card-title">Search Modes</h3>
              <p className="search-card-subtitle">Choose which modes participate.</p>
            </div>
          </div>

          <div className="search-grid-3">
            <ToggleRow
              label="App Search"
              description="Exact match on installed apps."
              checked={searchModes.appSearch}
              onChange={(next) => setSearchModes((p) => ({ ...p, appSearch: next }))}
            />
            <ToggleRow
              label="File Search"
              description="Fuzzy match on file names."
              checked={searchModes.fileSearch}
              onChange={(next) => setSearchModes((p) => ({ ...p, fileSearch: next }))}
            />
            <ToggleRow
              label="Folder Search"
              description="Fuzzy match on folder names."
              checked={searchModes.folderSearch}
              onChange={(next) => setSearchModes((p) => ({ ...p, folderSearch: next }))}
            />
            <ToggleRow
              label="Web Search"
              description="Fallback to browser when no results."
              checked={searchModes.webSearch}
              onChange={(next) => setSearchModes((p) => ({ ...p, webSearch: next }))}
            />
            <ToggleRow
              label="Recent Search History"
              description="Rank recently accessed items higher."
              checked={searchModes.recentSearchHistory}
              onChange={(next) => setSearchModes((p) => ({ ...p, recentSearchHistory: next }))}
            />
            <ToggleRow
              label="Smart Suggestions"
              description="Boost likely results."
              checked={searchModes.smartSuggestions}
              onChange={(next) => setSearchModes((p) => ({ ...p, smartSuggestions: next }))}
            />
          </div>
        </div>
      </div>

      {/* 4) Search Performance Settings */}
      <div className="search-card search-performance">
        <div className="search-card-header">
          <div>
            <h3 className="search-card-title">Search Performance</h3>
            <p className="search-card-subtitle">Tuning for speed and responsiveness.</p>
          </div>
        </div>

        <div className="search-grid-2">
          <ToggleRow
            label="Include file content"
            description="Index file content for faster results."
            checked={settings?.searchPreferences?.includeContent ?? true}
            onChange={(next) =>
              saveSettings({
                searchPreferences: { ...(settings?.searchPreferences || {}), includeContent: next },
              } as Partial<SettingsState>)
            }
            disabled={loading}
          />
          <ToggleRow
            label="Background indexing"
            description="Index without blocking search."
            checked={performance.backgroundIndexing}
            onChange={(next) => setPerformance((p) => ({ ...p, backgroundIndexing: next }))}
          />
          <ToggleRow
            label="Cache results"
            description="Reuse previous results to reduce load."
            checked={performance.cacheResults}
            onChange={(next) => setPerformance((p) => ({ ...p, cacheResults: next }))}
          />
          <ToggleRow
            label="Instant suggestions"
            description="Show suggestions while typing."
            checked={instantSuggestionsEnabled}
            onChange={(next) =>
              saveSettings({
                searchPreferences: { ...(settings?.searchPreferences || {}), fuzzySearch: next },
              } as Partial<SettingsState>)
            }
            disabled={loading}
          />
        </div>

        <div className="search-performance-limit">
          <div className="search-select-row">
            <label className="search-select-label">
              Search result limit
              <select
                className="search-select"
                value={performance.resultLimit}
                onChange={(e) => setPerformance((p) => ({ ...p, resultLimit: Number(e.target.value) }))}
                disabled={loading}
              >
                <option value={10}>10 results</option>
                <option value={25}>25 results</option>
                <option value={50}>50 results</option>
              </select>
            </label>
          </div>
        </div>

        <div className="search-grid-2 search-extra-settings">
          <ToggleRow
            label="Case sensitive search"
            description="Prefer exact-case matches."
            checked={settings?.searchPreferences?.caseSensitive ?? false}
            onChange={(next) =>
              saveSettings({
                searchPreferences: { ...(settings?.searchPreferences || {}), caseSensitive: next },
              } as Partial<SettingsState>)
            }
            disabled={loading}
          />
        </div>
      </div>

      {/* 5) Search Exclusions */}
      <div className="search-card search-exclusions">
        <div className="search-card-header">
          <div>
            <h3 className="search-card-title">Search Exclusions</h3>
            <p className="search-card-subtitle">Ignored folders and files.</p>
          </div>
        </div>

        <div className="search-exclusions-actions">
          <button type="button" className="search-btn primary" onClick={addExclusion} disabled={remainingExclusionCount === 0}>
            Add exclusion
          </button>
          <button type="button" className="search-btn" onClick={removeExclusion}>
            Remove exclusion
          </button>
        </div>

        <div className="search-chip-grid" role="list" aria-label="Excluded items">
          {exclusions.map((chip, idx) => {
            const active = activeExclusion === idx;
            return (
              <button
                key={`${chip}-${idx}`}
                type="button"
                className={`search-chip ${active ? 'active' : ''}`}
                onClick={() => setActiveExclusion(idx)}
                aria-pressed={active}
              >
                {chip}
                <span className="search-chip-x" aria-hidden="true">×</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6) Search Analytics */}
      <div className="search-card search-analytics">
        <div className="search-card-header">
          <div>
            <h3 className="search-card-title">Search Analytics</h3>
          </div>
        </div>

        <div className="search-stat-grid">
          <div className="search-stat-card">
            <div className="search-stat-label">Total searches</div>
            <div className="search-stat-value">{analytics.totalSearches.toLocaleString()}</div>
          </div>
          <div className="search-stat-card">
            <div className="search-stat-label">Results found</div>
            <div className="search-stat-value">{analytics.totalResultsFound.toLocaleString()}</div>
          </div>
          <div className="search-stat-card">
            <div className="search-stat-label">History entries</div>
            <div className="search-stat-value">{analytics.historyCount.toLocaleString()}</div>
          </div>
          <div className="search-stat-card">
            <div className="search-stat-label">Last query</div>
            <div className="search-stat-value" style={{ fontSize: '0.85rem', wordBreak: 'break-all' }}>
              {analytics.lastSearchQuery || 'None'}
            </div>
          </div>
        </div>
      </div>

      {/* 7) Smart Suggestions */}
      <div className="search-card search-smart-suggestions">
        <div className="search-card-header">
          <div>
            <h3 className="search-card-title">Smart Suggestions</h3>
            <p className="search-card-subtitle">Boost discovery based on patterns.</p>
          </div>
        </div>

        <div className="search-grid-2">
          <ToggleRow
            label="Frequently used apps"
            description="Recommend likely apps first."
            checked={smartSuggestions.frequentlyUsedApps}
            onChange={(next) => setSmartSuggestions((p) => ({ ...p, frequentlyUsedApps: next }))}
          />
          <ToggleRow
            label="Recent files suggestions"
            description="Surface recent files automatically."
            checked={smartSuggestions.recentFilesSuggestions}
            onChange={(next) => setSmartSuggestions((p) => ({ ...p, recentFilesSuggestions: next }))}
          />
          <ToggleRow
            label="Recommended folders"
            description="Suggest folders you often search."
            checked={smartSuggestions.recommendedFolders}
            onChange={(next) => setSmartSuggestions((p) => ({ ...p, recommendedFolders: next }))}
          />
          <ToggleRow
            label="Search prediction"
            description="Predict queries and refine results."
            checked={smartSuggestions.predictionSystem}
            onChange={(next) => setSmartSuggestions((p) => ({ ...p, predictionSystem: next }))}
          />
        </div>
      </div>

      {/* 8) Custom Search Domains */}
      <div className="search-card search-domains">
        <div className="search-card-header">
          <div>
            <h3 className="search-card-title">Browser Search Domains</h3>
            <p className="search-card-subtitle">When no results are found, search in these domains. First domain is the default. Use <code>{'{query}'}</code> in the URL to place the query anywhere.</p>
          </div>
        </div>

        <div className="search-domains-list">
          {domains.map((d, i) => (
            <div key={i} className="search-domain-row">
              {editingDomain === i ? (
                <>
                  <input className="search-domain-input" value={d.name} onChange={(e) => {
                    const next = [...domains];
                    next[i] = { ...next[i], name: e.target.value };
                    saveDomains(next);
                  }} placeholder="Name" />
                  <input className="search-domain-input" value={d.url} onChange={(e) => {
                    const next = [...domains];
                    next[i] = { ...next[i], url: e.target.value };
                    saveDomains(next);
                  }} placeholder="https://example.com/search?q=" />
                  <button className="search-btn" onClick={() => setEditingDomain(null)}>Done</button>
                </>
              ) : (
                <>
                  <span className="search-domain-name">{d.name}</span>
                  <span className="search-domain-url">{d.url}</span>
                  <button className="search-icon-btn" onClick={() => setEditingDomain(i)}>✏️</button>
                  <button className="search-icon-btn" onClick={() => {
                    saveDomains(domains.filter((_, idx) => idx !== i));
                    if (editingDomain === i) setEditingDomain(null);
                  }}>🗑️</button>
                </>
              )}
            </div>
          ))}
        </div>

        <button className="search-btn primary" onClick={() => {
          saveDomains([...domains, { name: '', url: '' }]);
          setEditingDomain(domains.length);
        }} style={{ marginTop: '0.75rem' }}>
          + Add Domain
        </button>
      </div>

      {/* 9) Privacy & Security */}
      <div className="search-card search-privacy">
        <div className="search-card-header">
          <div>
            <h3 className="search-card-title">Privacy & Security</h3>
            <p className="search-card-subtitle">Local behavior controls.</p>
          </div>
        </div>

        <div className="search-grid-2">
          <div className="search-privacy-actions">
            <button type="button" className="search-btn primary" onClick={clearSearchHistory}>
              Clear search history
            </button>
          </div>

          <ToggleRow
            label="Disable search history"
            description="Do not keep recent search history."
            checked={searchHistoryDisabled}
            onChange={setSearchHistoryDisabled}
          />
          <ToggleRow
            label="Open search at startup"
            description="Automatically open search page when app starts."
            checked={openSearchAtStartup}
            onChange={handleToggleStartupSearch}
          />
        </div>

        <div className="search-grid-2" style={{ marginTop: '1rem' }}>
          <ToggleRow
            label="Local-only indexing"
            description="Keep indexing local to your device."
            checked={localOnlyIndexing}
            onChange={setLocalOnlyIndexing}
          />
        </div>

        <div className="search-indexing-section" style={{ marginTop: '1rem' }}>
          <button
            type="button"
            className="search-btn primary"
            onClick={startIndexing}
            disabled={indexingStarted && indexStatus.isIndexing}
          >
            {indexStatus.isIndexing ? 'Indexing...' : 'Re-index filesystem'}
          </button>
          {indexStatus.isIndexing && (
            <span className="search-inline-note" style={{ marginLeft: '0.75rem' }}>
              {indexStatus.progress.phase}
            </span>
          )}
        </div>

        <div className="search-info-card" role="note" aria-label="Search indexing info">
          Search indexing remains local. No personal files are uploaded.
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  const { settings, loading, updateSettings } = useTheme();

  const saveSettings = async (newSettings: Partial<SettingsState>) => {
    try {
      await updateSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return (
    <Navbar currentPage="Search">
      <div className="settings-container search-p-5">
        {loading ? (
          <SkeletonSearch />
        ) : (
          <SearchContent
            settings={settings}
            saveSettings={saveSettings}
            loading={loading}
          />
        )}
      </div>
    </Navbar>
  );
}
