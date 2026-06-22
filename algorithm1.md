# Search Algorithm

This document explains the search algorithm powering the OS-level search engine.

## Overview

The search engine uses a **tiered, priority-based approach** with three distinct matching strategies depending on the content type being searched:

1. **Exact matching** — for applications (spelling-perfect)
2. **Fuzzy matching** — for files and folders (recommendation-based)
3. **Web fallback** — when no local results are found

---

## 1. Priority-Based Search Pipeline

Results are collected in the order defined by the **Search Priority Manager**:

```
applications → files → folders → web
```

Each category is searched sequentially. Results are deduplicated by path ID. The priority order is user-configurable via drag-and-drop in the UI.

### Algorithm Pseudocode

```
function searchAll(query, config):
    results = []
    seen = set()

    for category in config.priority:
        if category == "applications" and config.modes.appSearch:
            results += searchApps(query, exactOnly=true)
        elif category == "files" and config.modes.fileSearch:
            results += searchFiles(query, fuzzyThreshold=0.6)
        elif category == "folders" and config.modes.folderSearch:
            results += searchFolders(query, fuzzyThreshold=0.6)

        deduplicate by id
        sort by score descending
        limit to maxResults

    if results is empty and config.modes.webSearch:
        trigger web fallback (open browser)

    return results
```

---

## 2. Application Search — Exact Match

Applications are located by scanning well-known installation directories:

| Platform | Directories |
|----------|-------------|
| macOS    | `/Applications/`, `~/Applications/`, `/System/Applications/` |
| Windows  | `C:\Program Files\`, `C:\Program Files (x86)\` |
| Linux    | `/usr/share/applications/`, `/usr/local/share/applications/` |

### Scoring

The query is **normalized** (lowercased, non-alphanumeric stripped) before comparison:

```
normalize(str) = str.toLowerCase().replace(/[^a-z0-9]/g, '')

score(query, name):
    if normalized(name) == normalized(query)       → 1.0   (exact match)
    if normalized(name).startsWith(normalized(query)) → 0.95 (prefix match)
    if normalized(name).includes(normalized(query))   → 0.85 (substring match)
    else                                                → 0.0  (no match)
```

Only results with `score > 0` are returned. This ensures **perfect spelling matching** for applications.

---

## 3. File & Folder Search — Fuzzy Match

Files and folders are scanned recursively from the user's home directory (and optionally other configured paths).

### Scanning Constraints

| Constraint | Value |
|------------|-------|
| Maximum depth | 5 levels |
| Timeout | 5 seconds |
| Max results | 50 (configurable) |
| Excluded dirs | `node_modules`, `.git`, `.cache`, `temp`, `Library/System/Windows`, hidden files (`.*`) |

### Levenshtein Distance

The core of fuzzy matching is the **Levenshtein distance** between the normalized query and the normalized item name:

```
levenshtein(a, b):
    dp[m+1][n+1] where m = |a|, n = |b|
    initialize first row/column with 0..m, 0..n
    for i in 1..m, j in 1..n:
        cost = 0 if a[i] == b[j] else 1
        dp[i][j] = min(
            dp[i-1][j] + 1,       // deletion
            dp[i][j-1] + 1,       // insertion
            dp[i-1][j-1] + cost   // substitution
        )
    return dp[m][n]
```

### Fuzzy Scoring

```
similarity = 1 - (levenshtein(query, name) / max(|query|, |name|))

if normalized(name) == normalized(query)             → 1.0
elif normalized(name).startsWith(normalized(query))   → 0.9
elif normalized(name).includes(normalized(query))     → 0.8
elif similarity >= 0.6                                 → similarity * 0.7 (scale down)
else                                                    → 0.0 (reject)
```

The threshold of `0.6` means items must share at least 60% character similarity to be considered. This provides **recommendation-style results** — close matches appear, but distant ones are filtered out.

---

## 4. Web Fallback

When all local searches return zero results and **Web Search** mode is enabled, the system opens the default browser with:

```
https://www.google.com/search?q={encodeURIComponent(query)}
```

The platform-specific command used:

| Platform | Command |
|----------|---------|
| macOS    | `open "https://..."` |
| Windows  | `start "" "https://..."` |
| Linux    | `xdg-open "https://..."` |

---

## 5. OS-Level Operations

### Opening Files

Uses the platform's native file opener:

| Platform | Command |
|----------|---------|
| macOS    | `open "path"` |
| Windows  | `start "" "path"` |
| Linux    | `xdg-open "path"` |

### Show in Folder (Reveal in Finder/Explorer)

| Platform | Command |
|----------|---------|
| macOS    | `open -R "path"` |
| Windows  | `explorer /select,"path"` |
| Linux    | `xdg-open "parent_directory"` |

---

## 6. Search History & Analytics

Every search is logged to MongoDB (`search_history` collection) with:
- `userId` — who searched
- `query` — what they searched
- `resultsCount` — how many results were found
- `webFallback` — whether web fallback was triggered
- `searchedAt` — timestamp

Analytics are accumulated in the user's settings document:
- `totalSearches` — total search count
- `totalResultsFound` — cumulative results across all searches

---

## 7. File Indexing

An optional background indexer scans the filesystem and stores file metadata in a `search_index` MongoDB collection. This is not required for search to work (the engine scans on-the-fly), but it enables faster repeated searches.

The indexer:
- Walks directories up to depth 4
- Skips hidden files and excluded directories
- Stores: `name`, `path`, `extension`, `category`, `type`, `size`, `timestamps`
- Creates indexes on: `name`, `path`, `category`, `type`, `name_lower`, `userId`

---

## Summary

```
User types query
        │
        ▼
  Normalize query
        │
        ├──► Search Applications (exact match only)
        │       └── Score: 1.0 | 0.95 | 0.85 | 0.0
        │
        ├──► Search Files (fuzzy match)
        │       └── Levenshtein distance → similarity ≥ 0.6
        │
        ├──► Search Folders (fuzzy match)
        │       └── Levenshtein distance → similarity ≥ 0.6
        │
        ├──► Merge & sort by score, deduplicate
        │       └── Return up to maxResults
        │
        └──► If no results & web mode ON
                └── Open browser with Google search
```
