const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const EXCLUDED_DIRS = new Set([
  'node_modules', '.git', '.svn', '__pycache__',
  'Library', 'System', 'Windows', 'System32',
  '.cache', 'cache', 'temp', 'tmp', '.tmp',
  'Caches', 'Trash', '.Trash',
]);

const MAX_DEPTH = 4;
let isIndexing = false;
let indexProgress = { current: 0, total: 0, phase: '' };
let abortRequested = false;

async function getDb() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db('smart-file-management');
  return { client, db };
}

async function ensureIndexes(db) {
  const searchIndex = db.collection('search_index');
  await searchIndex.createIndex({ name: 1 });
  await searchIndex.createIndex({ path: 1 });
  await searchIndex.createIndex({ category: 1 });
  await searchIndex.createIndex({ type: 1 });
  await searchIndex.createIndex({ name_lower: 1 });
  await searchIndex.createIndex({ userId: 1 });
}

function shouldExclude(name) {
  if (name.startsWith('.')) return true;
  if (EXCLUDED_DIRS.has(name)) return true;
  const lower = name.toLowerCase();
  return ['cache', 'temp', 'tmp', 'backup'].some(x => lower.includes(x));
}

function getFileCategory(name, isDir) {
  if (isDir) return 'Folder';
  const ext = path.extname(name).toLowerCase();
  const categories = {
    '.pdf': 'Document', '.doc': 'Document', '.docx': 'Document',
    '.txt': 'Document', '.md': 'Document', '.rtf': 'Document',
    '.jpg': 'Image', '.jpeg': 'Image', '.png': 'Image',
    '.gif': 'Image', '.svg': 'Image', '.webp': 'Image', '.bmp': 'Image',
    '.mp3': 'Audio', '.wav': 'Audio', '.flac': 'Audio', '.aac': 'Audio', '.ogg': 'Audio',
    '.mp4': 'Video', '.mov': 'Video', '.avi': 'Video', '.mkv': 'Video', '.wmv': 'Video',
    '.zip': 'Archive', '.rar': 'Archive', '.7z': 'Archive', '.tar': 'Archive', '.gz': 'Archive',
    '.exe': 'Application', '.app': 'Application', '.dmg': 'Application',
    '.js': 'Code', '.ts': 'Code', '.py': 'Code', '.html': 'Code',
    '.css': 'Code', '.json': 'Code', '.jsx': 'Code', '.tsx': 'Code',
    '.go': 'Code', '.rs': 'Code', '.java': 'Code', '.cpp': 'Code',
  };
  return categories[ext] || 'Other';
}

async function scanDirectory(dirPath, userId, depth = 0) {
  if (abortRequested) return [];
  if (depth > MAX_DEPTH) return [];

  let entries;
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch {
    return [];
  }

  const results = [];

  for (const entry of entries) {
    if (abortRequested) return results;

    const name = entry.name;
    if (shouldExclude(name)) continue;

    const fullPath = path.join(dirPath, name);
    const isDir = entry.isDirectory();

    indexProgress.current++;

    try {
      const stats = fs.statSync(fullPath);
      const ext = path.extname(name).toLowerCase();
      const category = getFileCategory(name, isDir);

      results.push({
        userId,
        name,
        name_lower: name.toLowerCase(),
        path: fullPath,
        extension: ext,
        category,
        type: isDir ? 'folder' : 'file',
        size: stats.size,
        modifiedAt: stats.mtime,
        createdAt: stats.birthtime || stats.ctime,
        isDirectory: isDir,
        depth,
        indexedAt: new Date(),
      });

      if (isDir) {
        const subResults = await scanDirectory(fullPath, userId, depth + 1);
        results.push(...subResults);
      }
    } catch {
      // skip inaccessible files
    }
  }

  return results;
}

async function indexUserFiles(userId, rootPaths = null) {
  if (isIndexing) {
    throw new Error('Indexing already in progress');
  }

  isIndexing = true;
  abortRequested = false;
  indexProgress = { current: 0, total: 0, phase: 'Scanning filesystem...' };

  const homeDir = process.env.HOME || process.env.USERPROFILE || '/';
  const paths = rootPaths || [homeDir];

  try {
    const { client, db } = await getDb();
    const searchIndex = db.collection('search_index');
    await ensureIndexes(db);

    // Clear old index for this user
    await searchIndex.deleteMany({ userId });

    // Count total files first (estimate)
    indexProgress.phase = 'Indexing files...';

    let totalIndexed = 0;
    for (const rootPath of paths) {
      if (!fs.existsSync(rootPath)) continue;
      if (abortRequested) break;

      const files = await scanDirectory(rootPath, userId);
      if (files.length > 0) {
        await searchIndex.insertMany(files, { ordered: false });
        totalIndexed += files.length;
      }
    }

    await client.close();

    isIndexing = false;
    indexProgress.phase = 'Complete';

    return { indexed: totalIndexed, paths: paths.length };
  } catch (error) {
    isIndexing = false;
    indexProgress.phase = 'Error';
    throw error;
  }
}

async function abortIndexing() {
  abortRequested = true;
  isIndexing = false;
  indexProgress.phase = 'Aborted';
}

function getIndexStatus() {
  return {
    isIndexing,
    progress: { ...indexProgress },
    lastIndexTime: null,
  };
}

function resetIndexStatus() {
  isIndexing = false;
  abortRequested = false;
  indexProgress = { current: 0, total: 0, phase: '' };
}

module.exports = {
  indexUserFiles,
  abortIndexing,
  getIndexStatus,
  resetIndexStatus,
  ensureIndexes,
  getDb,
};
