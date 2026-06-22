const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const auth = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();
const MONGODB_URI = process.env.MONGODB_URI;

let db;
let systemLogsCollection;
let searchHistoryCollection;

async function connectToDatabase() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db('smart-file-management');
    systemLogsCollection = db.collection('system_logs');
    searchHistoryCollection = db.collection('search_history');
    await systemLogsCollection.createIndex({ userId: 1, timestamp: -1 });
    await systemLogsCollection.createIndex({ userId: 1, category: 1 });
    await systemLogsCollection.createIndex({ timestamp: -1 });
    console.log('Connected to MongoDB in logs routes');
  } catch (error) {
    console.error('MongoDB connection error in logs routes:', error);
  }
}

connectToDatabase();

const SEED_LOG_EVENTS = [
  { action: 'organized', fileName: 'Invoice_2024.pdf', oldPath: '/Downloads/Invoice_2024.pdf', newPath: '/Documents/Finance/Invoices/', category: 'File Organization', status: 'success', details: 'Invoice_2024.pdf moved from Downloads to Finance/Invoices' },
  { action: 'detected', fileName: 'photo (2).jpg', category: 'Security', status: 'warning', details: 'System identified 3 duplicate files in Projects folder' },
  { action: 'searched', fileName: '', category: 'Search Activity', status: 'info', details: 'Search for "react-hooks-context" in all local drives' },
  { action: 'monitored', fileName: 'new-project', oldPath: '/Users/manzil/Developer/new-project', category: 'Monitoring', status: 'success', details: '/Users/manzil/Developer/new-project is now being tracked' },
  { action: 'blocked', fileName: '', oldPath: '/System/Library/CoreServices', category: 'Security', status: 'failure', details: 'Access denied to /System/Library/CoreServices during scan' },
  { action: 'restored', fileName: 'Deleted_Draft_v1.docx', oldPath: 'Trash', newPath: '/Desktop/Deleted_Draft_v1.docx', category: 'Recovery Actions', status: 'success', details: 'Deleted_Draft_v1.docx restored from Trash to Desktop' },
  { action: 'compressed', fileName: 'project-assets', category: 'File Organization', status: 'success', details: 'Saved 450 MB by optimizing project assets' },
  { action: 'backup', fileName: '', category: 'Recovery Actions', status: 'success', details: 'Cloud synchronization completed successfully' },
  { action: 'undo', fileName: 'presentation_draft.pptx', oldPath: 'Trash', newPath: '/Desktop/presentation_draft.pptx', category: 'Recovery Actions', status: 'success', details: 'Restored presentation_draft.pptx from Trash to Desktop' },
  { action: 'monitored', fileName: 'Desktop', category: 'Monitoring', status: 'info', details: 'New activity detected in /Desktop' },
];

async function ensureSeedData(userId) {
  if (!systemLogsCollection) return;
  const count = await systemLogsCollection.countDocuments({ userId });
  if (count > 0) return;

  const seedEntries = SEED_LOG_EVENTS.map((event, i) => ({
    userId,
    action: event.action,
    fileName: event.fileName || '',
    oldPath: event.oldPath || '',
    newPath: event.newPath || '',
    category: event.category,
    status: event.status,
    error: event.status === 'failure' ? event.details : null,
    details: event.details || '',
    timestamp: new Date(Date.now() - i * 3600000 - Math.random() * 3600000),
  }));
  await systemLogsCollection.insertMany(seedEntries);
}

// GET /api/logs - Paginated logs
router.get('/logs', auth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    const offset = parseInt(req.query.offset) || 0;
    const category = req.query.category;
    const severity = req.query.severity;
    const search = req.query.search;

    await ensureSeedData(req.user.userId);

    const filter = { userId: req.user.userId };
    if (category && category !== 'All Logs') filter.category = category;
    if (severity) filter.status = severity;
    if (search) {
      filter.$or = [
        { details: { $regex: search, $options: 'i' } },
        { fileName: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await systemLogsCollection.countDocuments(filter);
    const logs = await systemLogsCollection.find(filter)
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    const result = logs.map(log => ({
      _id: log._id.toString(),
      action: log.action,
      fileName: log.fileName || '',
      oldPath: log.oldPath || '',
      newPath: log.newPath || '',
      category: log.category || 'General',
      status: log.status === 'failure' ? 'error' : log.status === 'warning' ? 'warning' : log.status === 'info' ? 'info' : 'success',
      error: log.error || null,
      details: log.details || '',
      timestamp: log.timestamp ? log.timestamp.toISOString() : new Date().toISOString(),
    }));

    res.json({ success: true, data: result, meta: { total, offset, limit } });
  } catch (error) {
    console.error('Logs fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch logs' });
  }
});

// GET /api/logs/summary - Category counts
router.get('/logs/summary', auth, async (req, res) => {
  try {
    await ensureSeedData(req.user.userId);

    const total = await systemLogsCollection.countDocuments({ userId: req.user.userId });

    const pipeline = [
      { $match: { userId: req.user.userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ];
    const catCounts = await systemLogsCollection.aggregate(pipeline).toArray();

    const catMap = {};
    for (const c of catCounts) catMap[c._id] = c.count;

    res.json({
      success: true,
      data: {
        total,
        categories: [
          { id: 'All Logs', label: 'All Logs', count: total },
          { id: 'File Organization', label: 'File Organization', count: catMap['File Organization'] || 0 },
          { id: 'Search Activity', label: 'Search Activity', count: catMap['Search Activity'] || 0 },
          { id: 'Recovery Actions', label: 'Recovery Actions', count: catMap['Recovery Actions'] || 0 },
          { id: 'Monitoring', label: 'Monitoring', count: catMap['Monitoring'] || 0 },
          { id: 'Security', label: 'Security', count: catMap['Security'] || 0 },
        ],
      },
    });
  } catch (error) {
    console.error('Logs summary error:', error);
    res.status(500).json({ success: false, message: 'Failed to get logs summary' });
  }
});

// GET /api/logs/category/:category - Logs by category
router.get('/logs/category/:category', auth, async (req, res) => {
  try {
    const cat = req.params.category;
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    await ensureSeedData(req.user.userId);

    const filter = { userId: req.user.userId };
    if (cat !== 'All Logs' && cat !== 'all') filter.category = cat;

    const logs = await systemLogsCollection.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    const result = logs.map(log => ({
      _id: log._id.toString(),
      action: log.action,
      fileName: log.fileName || '',
      oldPath: log.oldPath || '',
      newPath: log.newPath || '',
      category: log.category || 'General',
      status: log.status === 'failure' ? 'error' : log.status === 'warning' ? 'warning' : log.status === 'info' ? 'info' : 'success',
      error: log.error || null,
      details: log.details || '',
      timestamp: log.timestamp ? log.timestamp.toISOString() : new Date().toISOString(),
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Logs by category error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch logs by category' });
  }
});

// GET /api/logs/:id - Single log by ID
router.get('/logs/:id', auth, async (req, res) => {
  try {
    const log = await systemLogsCollection.findOne({ _id: new ObjectId(req.params.id), userId: req.user.userId });
    if (!log) return res.status(404).json({ success: false, message: 'Log not found' });
    res.json({ success: true, data: { ...log, _id: log._id.toString() } });
  } catch (error) {
    console.error('Log fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch log' });
  }
});

// POST /api/logs - Create a new log entry
router.post('/logs', auth, async (req, res) => {
  try {
    const { action, fileName, oldPath, newPath, category, status, error, details } = req.body;
    const entry = {
      userId: req.user.userId,
      action: action || 'info',
      fileName: fileName || '',
      oldPath: oldPath || '',
      newPath: newPath || '',
      category: category || 'General',
      status: status || 'info',
      error: error || null,
      details: details || '',
      timestamp: new Date(),
    };
    const result = await systemLogsCollection.insertOne(entry);
    res.json({ success: true, data: { ...entry, _id: result.insertedId.toString() } });
  } catch (error) {
    console.error('Log create error:', error);
    res.status(500).json({ success: false, message: 'Failed to create log' });
  }
});

// DELETE /api/logs/clear - Clear all logs for user
router.delete('/logs/clear', auth, async (req, res) => {
  try {
    await systemLogsCollection.deleteMany({ userId: req.user.userId });
    res.json({ success: true, message: 'All logs cleared' });
  } catch (error) {
    console.error('Logs clear error:', error);
    res.status(500).json({ success: false, message: 'Failed to clear logs' });
  }
});

module.exports = router;
