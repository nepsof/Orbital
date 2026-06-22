const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

function levenshteinDistance(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function exactMatchScore(query, name) {
  const q = normalize(query);
  const n = normalize(name);
  if (n === q) return 1;
  if (n.startsWith(q)) return 0.95;
  if (n.includes(q)) return 0.85;
  return 0;
}

function fuzzyMatchScore(query, name) {
  const q = normalize(query);
  const n = normalize(name);
  if (n === q) return 1;
  if (n.startsWith(q)) return 0.9;
  if (n.includes(q)) return 0.8;

  const distance = levenshteinDistance(q, n);
  const maxLen = Math.max(q.length, n.length);
  if (maxLen === 0) return 0;
  const similarity = 1 - distance / maxLen;

  if (similarity >= 0.6) return similarity * 0.7;
  return 0;
}

function getHomeDir() {
  return process.env.HOME || process.env.USERPROFILE || '/';
}

function getSearchPaths(options = {}) {
  const home = getHomeDir();
  const paths = [];

  if (options.includeHome !== false) {
    paths.push(home);
  }

  const platform = process.platform;
  if (platform === 'darwin') {
    paths.push('/Applications');
    paths.push(path.join(home, 'Applications'));
    paths.push('/System/Applications');
  } else if (platform === 'win32') {
    const programFiles = process.env.ProgramFiles || 'C:\\Program Files';
    const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
    paths.push(programFiles);
    paths.push(programFilesX86);
  } else {
    paths.push('/usr/share/applications');
    paths.push('/usr/local/share/applications');
    paths.push(path.join(home, '.local', 'share', 'applications'));
  }

  return paths;
}

const EXCLUDED_DIRS = new Set([
  'node_modules', '.git', '.svn', '__pycache__',
  'Library', 'System', 'Windows', 'System32',
  '.cache', 'cache', 'temp', 'tmp', '.tmp',
  'Caches', 'Trash', '.Trash', '回收站',
]);

const MAX_DEPTH = 5;
const SCAN_TIMEOUT_MS = 5000;

function shouldExclude(name, exclusions = []) {
  if (name.startsWith('.')) return true;
  if (EXCLUDED_DIRS.has(name)) return true;
  return exclusions.some(ex => name.toLowerCase().includes(ex.toLowerCase()));
}

function isBinaryExtension(ext) {
  const binaryExts = new Set([
    '.exe', '.dll', '.so', '.dylib', '.bin', '.dat',
    '.ico', '.png', '.jpg', '.jpeg', '.gif', '.bmp',
    '.mp3', '.mp4', '.avi', '.mkv', '.mov', '.wmv',
    '.zip', '.rar', '.7z', '.tar', '.gz', '.iso',
  ]);
  return binaryExts.has(ext.toLowerCase());
}

class SearchEngine {
  constructor() {
    this.indexedApps = [];
    this.indexedFiles = [];
    this.lastIndexTime = null;
    this.isIndexing = false;
    this.indexProgress = { current: 0, total: 0 };
  }

  async searchApps(query, exactOnly = true) {
    const q = normalize(query);
    if (!q) return [];

    const results = [];
    const appPaths = getSearchPaths();

    for (const dir of appPaths) {
      if (!fs.existsSync(dir)) continue;
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const name = entry.name.replace(/\.app$/i, '').replace(/\.lnk$/i, '').replace(/\.desktop$/i, '');
          const fullPath = path.join(dir, entry.name);

          let score;
          if (exactOnly) {
            score = exactMatchScore(q, name);
          } else {
            score = Math.max(exactMatchScore(q, name), fuzzyMatchScore(q, name));
          }

          if (score > 0) {
            const ext = path.extname(entry.name).toLowerCase();
            results.push({
              id: Buffer.from(fullPath).toString('base64'),
              name: name,
              fullName: entry.name,
              path: fullPath,
              type: 'application',
              category: 'Applications',
              score,
              iconUrl: getIconUrl(fullPath),
            });
          }
        }
      } catch (e) {
        // skip inaccessible directories
      }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, 20);
  }

  async searchFiles(query, options = {}) {
    const q = normalize(query);
    if (!q) return [];

    const {
      searchPaths = [getHomeDir()],
      exclusions = [],
      maxResults = 50,
      fuzzyThreshold = 0.6,
    } = options;

    const results = [];
    const scanned = { current: 0 };
    let timedOut = false;

    const timer = setTimeout(() => { timedOut = true; }, SCAN_TIMEOUT_MS);

    for (const rootPath of searchPaths) {
      if (timedOut) break;
      if (!fs.existsSync(rootPath)) continue;

      try {
        await this._walkDirectory(rootPath, q, results, {
          exclusions,
          maxResults,
          fuzzyThreshold,
          depth: 0,
          scanned,
          timedOut: () => timedOut,
        });
      } catch (e) {
        // continue with other paths
      }
    }

    clearTimeout(timer);
    return results.sort((a, b) => b.score - a.score).slice(0, maxResults);
  }

  async _walkDirectory(dirPath, query, results, options) {
    const {
      exclusions = [],
      maxResults = 50,
      fuzzyThreshold = 0.6,
      depth = 0,
      scanned,
      timedOut,
    } = options;

    if (timedOut()) return;
    if (depth > MAX_DEPTH) return;
    if (results.length >= maxResults) return;

    let entries;
    try {
      entries = fs.readdirSync(dirPath, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (timedOut()) return;
      if (results.length >= maxResults) return;

      const name = entry.name;
      if (shouldExclude(name, exclusions)) continue;

      const fullPath = path.join(dirPath, name);
      scanned.current++;

      const isDir = entry.isDirectory();

      let score = fuzzyMatchScore(query, name);
      if (score >= fuzzyThreshold) {
        const ext = path.extname(name).toLowerCase();
        const category = isDir ? 'Folders' : getFileCategory(ext);
        results.push({
          id: Buffer.from(fullPath).toString('base64'),
          name: name,
          path: fullPath,
          type: isDir ? 'folder' : 'file',
          category,
          score,
          size: 0,
          isDirectory: isDir,
          iconUrl: getIconUrl(fullPath),
        });
      }

      if (isDir) {
        await this._walkDirectory(fullPath, query, results, {
          ...options,
          depth: depth + 1,
        });
      }
    }
  }

  async searchFolders(query, options = {}) {
    const q = normalize(query);
    if (!q) return [];

    const results = [];
    const scanned = { current: 0 };
    let timedOut = false;

    const timer = setTimeout(() => { timedOut = true; }, SCAN_TIMEOUT_MS);

    const searchPaths = options.searchPaths || [getHomeDir()];

    for (const rootPath of searchPaths) {
      if (timedOut) break;
      if (!fs.existsSync(rootPath)) continue;

      try {
        await this._walkFolders(rootPath, q, results, {
          exclusions: options.exclusions || [],
          maxResults: options.maxResults || 25,
          depth: 0,
          scanned,
          timedOut: () => timedOut,
        });
      } catch (e) {
        // continue
      }
    }

    clearTimeout(timer);
    return results.sort((a, b) => b.score - a.score).slice(0, options.maxResults || 25);
  }

  async _walkFolders(dirPath, query, results, options) {
    const {
      exclusions = [],
      maxResults = 25,
      depth = 0,
      scanned,
      timedOut,
    } = options;

    if (timedOut()) return;
    if (depth > MAX_DEPTH) return;
    if (results.length >= maxResults) return;

    let entries;
    try {
      entries = fs.readdirSync(dirPath, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (timedOut()) return;
      if (results.length >= maxResults) return;

      const name = entry.name;
      if (shouldExclude(name, exclusions)) continue;

      if (!entry.isDirectory()) continue;

      const fullPath = path.join(dirPath, name);

      let score = fuzzyMatchScore(query, name);
      if (score >= 0.6) {
        results.push({
          id: Buffer.from(fullPath).toString('base64'),
          name: name,
          path: fullPath,
          type: 'folder',
          category: 'Folders',
          score,
          iconUrl: getIconUrl(fullPath),
        });
      }

      await this._walkFolders(fullPath, query, results, {
        ...options,
        depth: depth + 1,
      });
    }
  }

  async searchAll(query, options = {}) {
    const priority = options.priority || ['applications', 'files', 'folders', 'web'];
    const modes = options.modes || {
      appSearch: true,
      fileSearch: true,
      folderSearch: true,
      webSearch: false,
    };
    const exclusions = options.exclusions || [];

    const allResults = [];
    const seen = new Set();

    for (const category of priority) {
      let results = [];

      if (category === 'applications' && modes.appSearch) {
        results = await this.searchApps(query, true);
      } else if (category === 'files' && modes.fileSearch) {
        results = await this.searchFiles(query, { exclusions, maxResults: options.maxResults || 50 });
      } else if (category === 'folders' && modes.folderSearch) {
        results = await this.searchFolders(query, { exclusions, maxResults: options.maxResults || 25 });
      }

      for (const result of results) {
        if (!seen.has(result.id)) {
          seen.add(result.id);
          allResults.push(result);
        }
      }
    }

    return allResults;
  }

  openInOS(filePath) {
    return new Promise((resolve, reject) => {
      const platform = process.platform;
      let command;

      if (platform === 'darwin') {
        command = `open "${filePath}"`;
      } else if (platform === 'win32') {
        command = `start "" "${filePath}"`;
      } else {
        command = `xdg-open "${filePath}"`;
      }

      exec(command, (error) => {
        if (error) reject(error);
        else resolve(true);
      });
    });
  }

  openInBrowser(query) {
    return new Promise((resolve, reject) => {
      const encoded = encodeURIComponent(query);
      const url = `https://www.google.com/search?q=${encoded}`;
      const platform = process.platform;
      let command;

      if (platform === 'darwin') {
        command = `open "${url}"`;
      } else if (platform === 'win32') {
        command = `start "" "${url}"`;
      } else {
        command = `xdg-open "${url}"`;
      }

      exec(command, (error) => {
        if (error) reject(error);
        else resolve(true);
      });
    });
  }

  showInFolder(filePath) {
    return new Promise((resolve, reject) => {
      const platform = process.platform;
      let command;

      if (platform === 'darwin') {
        command = `open -R "${filePath}"`;
      } else if (platform === 'win32') {
        command = `explorer /select,"${filePath}"`;
      } else {
        command = `xdg-open "${path.dirname(filePath)}"`;
      }

      exec(command, (error) => {
        if (error) reject(error);
        else resolve(true);
      });
    });
  }
}

function getIconUrl(fullPath) {
  return `/api/search/icon-local?file=${Buffer.from(fullPath).toString('base64')}`;
}

function getFileCategory(ext) {
  const categories = {
    '.pdf': 'Documents', '.doc': 'Documents', '.docx': 'Documents',
    '.txt': 'Documents', '.md': 'Documents', '.rtf': 'Documents',
    '.jpg': 'Images', '.jpeg': 'Images', '.png': 'Images',
    '.gif': 'Images', '.svg': 'Images', '.webp': 'Images',
    '.mp3': 'Audio', '.wav': 'Audio', '.flac': 'Audio', '.aac': 'Audio',
    '.mp4': 'Videos', '.mov': 'Videos', '.avi': 'Videos', '.mkv': 'Videos',
    '.zip': 'Archives', '.rar': 'Archives', '.7z': 'Archives', '.tar': 'Archives',
    '.js': 'Code', '.ts': 'Code', '.py': 'Code', '.html': 'Code',
    '.css': 'Code', '.json': 'Code', '.jsx': 'Code', '.tsx': 'Code',
  };
  return categories[ext] || 'Files';
}

module.exports = new SearchEngine();
module.exports.SearchEngine = SearchEngine;
