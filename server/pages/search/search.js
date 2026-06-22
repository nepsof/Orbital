const express = require('express');
const fs = require('fs');
const { MongoClient } = require('mongodb');
const auth = require('../../middleware/auth');
const searchEngine = require('./searchEngine');
const indexer = require('./indexer');
const iconHelper = require('./iconHelper');
require('dotenv').config();

const router = express.Router();
const MONGODB_URI = process.env.MONGODB_URI;

let db;
let usersCollection;
let searchHistoryCollection;
let systemLogsCollection;

async function connectToDatabase() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db('smart-file-management');
    usersCollection = db.collection('users');
    searchHistoryCollection = db.collection('search_history');
    await searchHistoryCollection.createIndex({ userId: 1, searchedAt: -1 });
    await searchHistoryCollection.createIndex({ userId: 1, query: 1 });
    systemLogsCollection = db.collection('system_logs');
    console.log('Connected to MongoDB in search routes');
  } catch (error) {
    console.error('MongoDB connection error in search routes:', error);
  }
}

connectToDatabase();

function getSearchConfig(user) {
  const settings = user.settings || {};
  const searchPrefs = settings.searchPreferences || {};

  return {
    fuzzySearch: searchPrefs.fuzzySearch !== false,
    caseSensitive: searchPrefs.caseSensitive === true,
    includeContent: searchPrefs.includeContent !== false,
    priority: settings.searchPriority || [
      { key: 'applications', label: 'Applications', enabled: true },
      { key: 'files', label: 'Files', enabled: true },
      { key: 'folders', label: 'Folders', enabled: true },
      { key: 'web', label: 'Web Search', enabled: false },
    ],
    modes: settings.searchModes || {
      appSearch: true,
      fileSearch: true,
      folderSearch: true,
      webSearch: false,
    },
    exclusions: settings.searchExclusions || [],
    resultLimit: settings.searchResultLimit || 25,
    searchPaths: settings.searchPaths || [],
  };
}

function extractPriority(config) {
  if (!config.priority) return ['applications', 'files', 'folders', 'web'];
  return config.priority
    .filter(p => p.enabled !== false)
    .map(p => p.key);
}

function extractModes(config) {
  return config.modes || {
    appSearch: true,
    fileSearch: true,
    folderSearch: true,
    webSearch: false,
  };
}

// POST /api/search - Main search endpoint
router.post('/search', auth, async (req, res) => {
  try {
    const { query, limit } = req.body;

    if (!query || !query.trim()) {
      return res.json({ success: true, data: [], message: 'Empty query' });
    }

    const trimmedQuery = query.trim();

    // Get user preferences
    const user = await usersCollection.findOne({ userId: req.user.userId });
    const config = user ? getSearchConfig(user) : getSearchConfig({ settings: {} });
    const resultLimit = limit || config.resultLimit;

    // Build priority order
    const priority = extractPriority(config);
    const modes = extractModes(config);

    // Perform search
    const results = await searchEngine.searchAll(trimmedQuery, {
      priority,
      modes,
      exclusions: config.exclusions,
      maxResults: resultLimit,
    });

    // Check if we need web fallback
    const webFallback = results.length === 0 && modes.webSearch;

    // Save to search history
    if (db && searchHistoryCollection) {
      try {
        await searchHistoryCollection.insertOne({
          userId: req.user.userId,
          query: trimmedQuery,
          resultsCount: results.length,
          webFallback,
          searchedAt: new Date(),
        });
      } catch (e) {
        // don't fail search if history save fails
      }
    }

    // Log search activity
    if (db && systemLogsCollection) {
      try {
        await systemLogsCollection.insertOne({
          userId: req.user.userId,
          action: 'searched',
          fileName: '',
          category: 'Search Activity',
          status: results.length > 0 ? 'success' : 'info',
          details: `Search for "${trimmedQuery}" - ${results.length} results`,
          timestamp: new Date(),
        });
      } catch (e) { /* non-critical */ }
    }

    // Update analytics in user settings
    if (db && usersCollection) {
      try {
        await usersCollection.updateOne(
          { userId: req.user.userId },
          {
            $inc: {
              'analytics.totalSearches': 1,
              'analytics.totalResultsFound': results.length,
            },
            $set: {
              'analytics.lastSearchAt': new Date(),
              'analytics.lastSearchQuery': trimmedQuery,
            },
          }
        );
      } catch (e) {
        // non-critical
      }
    }

    res.json({
      success: true,
      data: results,
      meta: {
        query: trimmedQuery,
        total: results.length,
        webFallback,
        fuzzyUsed: config.fuzzySearch,
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: 'Search failed', error: error.message });
  }
});

// POST /api/search/local - Local-only search (no auth, localhost only)
router.post('/search/local', async (req, res) => {
  const clientIp = req.ip || req.connection.remoteAddress;
  const localIps = ['::1', '::ffff:127.0.0.1', '127.0.0.1', 'localhost', '::ffff:192.168.', '192.168.'];
  const isLocal = localIps.some(prefix => clientIp && (clientIp === prefix || clientIp.startsWith(prefix)));
  if (!isLocal) {
    return res.status(403).json({ success: false, message: 'Local access only' });
  }

  try {
    const { query, limit } = req.body;
    if (!query || !query.trim()) {
      return res.json({ success: true, data: [], message: 'Empty query' });
    }

    const trimmedQuery = query.trim();
    const resultLimit = limit || 25;
    const config = {
      fuzzySearch: true,
      caseSensitive: false,
      includeContent: false,
      priority: [{ key: 'applications', label: 'Applications', enabled: true },{ key: 'files', label: 'Files', enabled: true },{ key: 'folders', label: 'Folders', enabled: true },{ key: 'web', label: 'Web Search', enabled: false }],
      modes: { appSearch: true, fileSearch: true, folderSearch: true, webSearch: false },
      exclusions: [],
    };

    const priority = ['applications', 'files', 'folders'];
    const results = await searchEngine.searchAll(trimmedQuery, {
      priority,
      modes: config.modes,
      exclusions: config.exclusions,
      maxResults: resultLimit,
    });

    res.json({ success: true, data: results, meta: { query: trimmedQuery, total: results.length, webFallback: false, fuzzyUsed: true } });
  } catch (error) {
    console.error('Local search error:', error);
    res.status(500).json({ success: false, message: 'Search failed', error: error.message });
  }
});

// POST /api/search/web-fallback - Open browser with search query
router.post('/search/web-fallback', auth, async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ success: false, message: 'Query is required' });
    }

    await searchEngine.openInBrowser(query.trim());

    res.json({ success: true, message: 'Browser opened' });
  } catch (error) {
    console.error('Web fallback error:', error);
    res.status(500).json({ success: false, message: 'Failed to open browser' });
  }
});

// POST /api/search/open - Open a file/folder at OS level
router.post('/search/open', auth, async (req, res) => {
  try {
    const { path: filePath } = req.body;
    if (!filePath) {
      return res.status(400).json({ success: false, message: 'Path is required' });
    }

    await searchEngine.openInOS(filePath);

    res.json({ success: true, message: 'Opened successfully' });
  } catch (error) {
    console.error('Open error:', error);
    res.status(500).json({ success: false, message: 'Failed to open', error: error.message });
  }
});

// POST /api/search/show-in-folder - Show file in folder
router.post('/search/show-in-folder', auth, async (req, res) => {
  try {
    const { path: filePath } = req.body;
    if (!filePath) {
      return res.status(400).json({ success: false, message: 'Path is required' });
    }

    await searchEngine.showInFolder(filePath);

    res.json({ success: true, message: 'Shown in folder' });
  } catch (error) {
    console.error('Show in folder error:', error);
    res.status(500).json({ success: false, message: 'Failed to show in folder', error: error.message });
  }
});

// GET /api/search/history - Get search history
router.get('/search/history', auth, async (req, res) => {
  try {
    if (!db || !searchHistoryCollection) {
      return res.json({ success: true, data: [] });
    }

    const limit = parseInt(req.query.limit) || 20;
    const history = await searchHistoryCollection
      .find({ userId: req.user.userId })
      .sort({ searchedAt: -1 })
      .limit(limit)
      .toArray();

    res.json({ success: true, data: history });
  } catch (error) {
    console.error('History fetch error:', error);
    res.json({ success: true, data: [] });
  }
});

// DELETE /api/search/history - Clear search history
router.delete('/search/history', auth, async (req, res) => {
  try {
    if (db && searchHistoryCollection) {
      await searchHistoryCollection.deleteMany({ userId: req.user.userId });
    }

    res.json({ success: true, message: 'Search history cleared' });
  } catch (error) {
    console.error('History clear error:', error);
    res.status(500).json({ success: false, message: 'Failed to clear history' });
  }
});

// GET /api/search/analytics - Get search analytics
router.get('/search/analytics', auth, async (req, res) => {
  try {
    const user = await usersCollection.findOne({ userId: req.user.userId });
    const analytics = user?.analytics || {};
    const historyCount = db && searchHistoryCollection
      ? await searchHistoryCollection.countDocuments({ userId: req.user.userId })
      : 0;

    res.json({
      success: true,
      data: {
        totalSearches: analytics.totalSearches || 0,
        totalResultsFound: analytics.totalResultsFound || 0,
        lastSearchAt: analytics.lastSearchAt || null,
        lastSearchQuery: analytics.lastSearchQuery || null,
        historyCount,
      },
    });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    res.json({ success: true, data: null });
  }
});

// POST /api/search/index - Trigger manual indexing
router.post('/search/index', auth, async (req, res) => {
  try {
    const { paths } = req.body;

    // Start indexing asynchronously
    indexer.indexUserFiles(req.user.userId, paths).then(result => {
      console.log(`Indexing complete for user ${req.user.userId}:`, result);
    }).catch(err => {
      console.error('Indexing failed:', err);
    });

    res.json({ success: true, message: 'Indexing started' });
  } catch (error) {
    console.error('Index start error:', error);
    res.status(500).json({ success: false, message: 'Failed to start indexing' });
  }
});

// GET /api/search/index/status - Get indexing status
router.get('/search/index/status', auth, async (req, res) => {
  try {
    const status = indexer.getIndexStatus();
    res.json({ success: true, data: status });
  } catch (error) {
    res.json({ success: true, data: null });
  }
});

// GET /api/search/icon-local - Local-only icon (no auth)
router.get('/search/icon-local', (req, res) => {
  const clientIp = req.ip || req.connection.remoteAddress;
  const localIps = ['::1', '::ffff:127.0.0.1', '127.0.0.1', 'localhost'];
  const isLocal = localIps.some(prefix => clientIp && (clientIp === prefix || clientIp.startsWith(prefix)));
  if (!isLocal) {
    return res.status(403).json({ success: false, message: 'Local access only' });
  }

  const fileParam = req.query.file || req.query.path;
  if (!fileParam) {
    return res.status(400).json({ success: false, message: 'File parameter required' });
  }

  let filePath;
  try {
    filePath = Buffer.from(fileParam, 'base64').toString('utf8');
  } catch {
    filePath = fileParam;
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'File not found' });
  }

  const cached = iconHelper.getCachedIcon(filePath);
  if (!cached) {
    return res.status(404).json({ success: false, message: 'Icon not available' });
  }

  const mime = cached.type === 'svg' ? 'image/svg+xml' : 'image/png';
  res.set('Content-Type', mime);
  res.set('Cache-Control', 'public, max-age=86400');
  res.send(cached.data);
});

// GET /api/search/icon - Get file icon (PNG or SVG)
router.get('/search/icon', auth, (req, res) => {
  const fileParam = req.query.file || req.query.path;
  if (!fileParam) {
    return res.status(400).json({ success: false, message: 'File parameter required' });
  }

  let filePath;
  try {
    filePath = Buffer.from(fileParam, 'base64').toString('utf8');
  } catch {
    filePath = fileParam;
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'File not found' });
  }

  const cached = iconHelper.getCachedIcon(filePath);
  if (!cached) {
    return res.status(404).json({ success: false, message: 'Icon not available' });
  }

  const mime = cached.type === 'svg' ? 'image/svg+xml' : 'image/png';
  res.set('Content-Type', mime);
  res.set('Cache-Control', 'public, max-age=86400');
  res.send(cached.data);
});

module.exports = router;
