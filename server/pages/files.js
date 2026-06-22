const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function logActivity(userId, action, fileName, category, status, details) {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db('smart-file-management');
    const collection = db.collection('system_logs');
    await collection.insertOne({
      userId, action, fileName: fileName || '', oldPath: '', newPath: '',
      category, status, details: details || '', timestamp: new Date(),
    });
    await client.close();
  } catch (e) { /* non-critical */ }
}

// Recursively compute directory size
function getDirectorySize(dirPath) {
  let totalSize = 0;
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      try {
        if (entry.isDirectory()) {
          totalSize += getDirectorySize(fullPath);
        } else if (entry.isFile()) {
          totalSize += fs.statSync(fullPath).size;
        }
      } catch { /* skip inaccessible entries */ }
    }
  } catch { /* skip inaccessible directories */ }
  return totalSize;
}

// Helper to determine category
const getCategory = (fileName, isDirectory) => {
  if (isDirectory) return 'Folder';
  const ext = path.extname(fileName).toLowerCase().slice(1);
  const categories = {
    Videos: ['mp4', 'mov', 'avi', 'mkv', 'wmv'],
    Images: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    Audio: ['mp3', 'wav', 'flac', 'aac', 'ogg'],
    Documents: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'],
    Archives: ['zip', 'rar', '7z', 'tar', 'gz'],
    Design: ['fig', 'psd', 'ai', 'sketch'],
  };

  for (const [category, extensions] of Object.entries(categories)) {
    if (extensions.includes(ext)) return category;
  }
  return 'Files';
};

// GET /api/files/list?path=/some/path
router.get('/list', async (req, res) => {
  const targetPath = req.query.path;

  if (!targetPath) {
    return res.status(400).json({ error: 'Path is required' });
  }

  try {
    // Check if path exists
    if (!fs.existsSync(targetPath)) {
      return res.status(404).json({ error: 'Path not found' });
    }

    const stats = fs.statSync(targetPath);
    if (!stats.isDirectory()) {
      return res.status(400).json({ error: 'Path is not a directory' });
    }

    const files = fs.readdirSync(targetPath);
    const result = files.map(fileName => {
      const filePath = path.join(targetPath, fileName);
      try {
        const fileStats = fs.statSync(filePath);
        const isDirectory = fileStats.isDirectory();
        const category = getCategory(fileName, isDirectory);
        
        const itemSize = isDirectory ? getDirectorySize(filePath) : fileStats.size;
        return {
          id: Buffer.from(filePath).toString('base64'), // Stable ID based on path
          name: fileName,
          extension: isDirectory ? '' : path.extname(fileName).slice(1),
          path: targetPath,
          category: category,
          size: itemSize,
          sizeDisplay: formatFileSize(itemSize),
          modifiedAt: fileStats.mtime.toISOString(),
          createdAt: fileStats.birthtime.toISOString(),
          isFavorite: false,
          isDuplicate: false,
          isLarge: fileStats.size > 5000000,
          isFolder: isDirectory,
          tags: [category.toLowerCase()],
          sourceFolder: path.basename(targetPath),
          status: 'Safe'
        };
      } catch (err) {
        // Skip files that can't be accessed
        return null;
      }
    }).filter(Boolean);

    res.json(result);
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// POST /api/files/organize?path=/some/path
router.post('/organize', async (req, res) => {
  const targetPath = req.query.path;

  if (!targetPath) {
    return res.status(400).json({ error: 'Path is required' });
  }

  try {
    // Check if path exists and is a directory
    if (!fs.existsSync(targetPath)) {
      return res.status(404).json({ error: 'Path not found' });
    }

    const stats = fs.statSync(targetPath);
    if (!stats.isDirectory()) {
      return res.status(400).json({ error: 'Path is not a directory' });
    }

    const files = fs.readdirSync(targetPath);
    let organizedCount = 0;
    const results = {
      organizedCount: 0,
      skippedCount: 0,
      errorCount: 0,
      details: []
    };

    for (const fileName of files) {
      const filePath = path.join(targetPath, fileName);
      
      try {
        const fileStats = fs.statSync(filePath);
        
        // Skip directories and symbolic links
        if (fileStats.isDirectory() || fileStats.isSymbolicLink()) {
          results.skippedCount++;
          continue;
        }

        // Determine category
        const category = getCategory(fileName, false);

        // Create category folder if it doesn't exist
        const categoryFolder = path.join(targetPath, category);
        if (!fs.existsSync(categoryFolder)) {
          fs.mkdirSync(categoryFolder, { recursive: true });
        }

        // Move file to category folder
        const destPath = path.join(categoryFolder, fileName);
        
        // Handle duplicate filenames
        let finalDestPath = destPath;
        let counter = 1;
        const ext = path.extname(fileName);
        const nameWithoutExt = path.basename(fileName, ext);
        
        while (fs.existsSync(finalDestPath)) {
          const newName = `${nameWithoutExt} (${counter})${ext}`;
          finalDestPath = path.join(categoryFolder, newName);
          counter++;
        }

        fs.renameSync(filePath, finalDestPath);
        results.organizedCount++;
        results.details.push({
          fileName,
          category,
          status: 'success',
          newPath: finalDestPath
        });

      } catch (err) {
        results.errorCount++;
        results.details.push({
          fileName,
          status: 'error',
          error: err.message
        });
      }
    }

    // Log the activity
    const authHeader = req.headers.authorization;
    if (authHeader) {
      try {
        const jwt = require('jsonwebtoken');
        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        logActivity(decoded.userId, 'organized', `${results.organizedCount} files`, 'File Organization', 'success', `Successfully organized ${results.organizedCount} files in ${targetPath}`);
      } catch (e) { /* non-critical */ }
    }

    res.json({
      success: true,
      message: `Successfully organized ${results.organizedCount} files`,
      ...results
    });
  } catch (error) {
    console.error('Error organizing files:', error);
    res.status(500).json({ error: 'Failed to organize files', details: error.message });
  }
});

// Helper to extract userId from auth header
function getUserIdFromAuth(req) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;
    const jwt = require('jsonwebtoken');
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
  } catch { return null; }
}

function formatFileSize(bytes) {
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + ' GB';
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return bytes + ' B';
}

function getFileCategory(name) {
  const ext = path.extname(name).toLowerCase();
  if (['.jpg','.jpeg','.png','.gif','.webp','.svg','.ico','.bmp','.tiff'].includes(ext)) return 'Images';
  if (['.mp4','.mov','.avi','.mkv','.wmv','.flv','.webm'].includes(ext)) return 'Videos';
  if (['.mp3','.wav','.flac','.aac','.ogg','.wma','.m4a'].includes(ext)) return 'Audio';
  if (['.zip','.rar','.7z','.tar','.gz','.bz2'].includes(ext)) return 'Archives';
  if (['.pdf','.doc','.docx','.xls','.xlsx','.ppt','.pptx','.txt','.rtf','.csv'].includes(ext)) return 'Documents';
  return 'Files';
}

// Move a file/folder to the OS-native Trash/Recycle Bin
function moveToNativeTrash(targetPath) {
  const platform = os.platform();
  if (platform === 'darwin') {
    // macOS: use osascript with script via stdin to avoid shell escaping issues
    const script = `tell application "Finder" to delete POSIX file "${targetPath.replace(/"/g, '\\"')}"`;
    execSync('osascript -ss', { input: script, stdio: ['pipe', 'pipe', 'pipe'], timeout: 15000 });
  } else if (platform === 'win32') {
    // Windows: use PowerShell to send to Recycle Bin
    const psCmd = `Add-Type -AssemblyName Microsoft.VisualBasic; [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile('${targetPath.replace(/'/g, "''")}','OnlyErrorDialogs','SendToRecycleBin')`;
    execSync('powershell -Command -', { input: psCmd, stdio: ['pipe', 'pipe', 'pipe'], timeout: 15000 });
  }
}

// POST /api/files/create-folder
router.post('/create-folder', async (req, res) => {
  const { parentPath, folderName } = req.body;
  if (!parentPath) return res.status(400).json({ error: 'Parent path is required' });

  try {
    if (!fs.existsSync(parentPath)) return res.status(404).json({ error: 'Parent path not found' });

    let newName = folderName || 'Folder';
    let targetPath = path.join(parentPath, newName);
    let counter = 2;
    while (fs.existsSync(targetPath)) {
      newName = `Folder ${counter}`;
      targetPath = path.join(parentPath, newName);
      counter++;
    }

    fs.mkdirSync(targetPath, { recursive: true });
    const userId = getUserIdFromAuth(req);
    if (userId) logActivity(userId, 'create', newName, 'Folder', 'success', `Created folder in ${parentPath}`);

    res.json({ success: true, path: targetPath, name: newName });
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

// POST /api/files/duplicate
router.post('/duplicate', async (req, res) => {
  const { sourcePath } = req.body;
  if (!sourcePath) return res.status(400).json({ error: 'Source path is required' });

  try {
    if (!fs.existsSync(sourcePath)) return res.status(404).json({ error: 'Source file not found' });

    const dir = path.dirname(sourcePath);
    const ext = path.extname(sourcePath);
    const base = path.basename(sourcePath, ext);
    const isDir = fs.statSync(sourcePath).isDirectory();

    let newName = isDir ? `${base} copy` : `${base} copy${ext}`;
    let destPath = path.join(dir, newName);
    let counter = 2;
    while (fs.existsSync(destPath)) {
      newName = isDir ? `${base} copy ${counter}` : `${base} copy ${counter}${ext}`;
      destPath = path.join(dir, newName);
      counter++;
    }

    if (isDir) {
      fs.cpSync(sourcePath, destPath, { recursive: true });
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }

    const userId = getUserIdFromAuth(req);
    if (userId) logActivity(userId, 'duplicate', path.basename(sourcePath), 'File', 'success', `Duplicated to ${newName}`);

    res.json({ success: true, sourcePath, destPath, name: newName });
  } catch (error) {
    console.error('Error duplicating file:', error);
    res.status(500).json({ error: 'Failed to duplicate file' });
  }
});

// POST /api/files/rename — rename a file on the filesystem
router.post('/rename', async (req, res) => {
  const { fileId, newName } = req.body;
  if (!fileId || !newName) return res.status(400).json({ error: 'fileId and newName are required' });

  try {
    const oldPath = Buffer.from(fileId, 'base64').toString('utf-8');
    if (!fs.existsSync(oldPath)) return res.status(404).json({ error: 'File not found' });

    const dir = path.dirname(oldPath);
    const newPath = path.join(dir, newName);

    if (fs.existsSync(newPath)) return res.status(409).json({ error: 'A file with that name already exists' });

    fs.renameSync(oldPath, newPath);

    const stats = fs.statSync(newPath);
    const isDirectory = stats.isDirectory();

    const userId = getUserIdFromAuth(req);
    if (userId) logActivity(userId, 'rename', path.basename(oldPath), isDirectory ? 'Folder' : 'File', 'success', `Renamed to ${newName}`);

    res.json({
      success: true,
      oldPath,
      newPath,
      name: newName,
      newId: Buffer.from(newPath).toString('base64'),
    });
  } catch (error) {
    console.error('Error renaming file:', error);
    res.status(500).json({ error: 'Failed to rename file' });
  }
});

// POST /api/files/copy — copy files to target directory
router.post('/copy', async (req, res) => {
  const { sourcePaths, targetPath } = req.body;
  if (!sourcePaths || !targetPath) return res.status(400).json({ error: 'sourcePaths and targetPath are required' });

  try {
    if (!fs.existsSync(targetPath)) return res.status(404).json({ error: 'Target path not found' });

    const results = [];
    for (const src of sourcePaths) {
      if (!fs.existsSync(src)) { results.push({ src, status: 'error', error: 'Source not found' }); continue; }

      const ext = path.extname(src);
      const base = path.basename(src, ext);
      const isDir = fs.statSync(src).isDirectory();
      let newName = isDir ? base : `${base}${ext}`;
      let destPath = path.join(targetPath, newName);
      let counter = 2;
      while (fs.existsSync(destPath)) {
        newName = isDir ? `${base} ${counter}` : `${base} copy ${counter}${ext}`;
        destPath = path.join(targetPath, newName);
        counter++;
      }

      if (isDir) {
        fs.cpSync(src, destPath, { recursive: true });
      } else {
        fs.copyFileSync(src, destPath);
      }
      results.push({ src, destPath, name: newName, status: 'success' });
    }

    const userId = getUserIdFromAuth(req);
    if (userId) logActivity(userId, 'copy', `${sourcePaths.length} files`, 'File', 'success', `Copied to ${targetPath}`);

    res.json({ success: true, results });
  } catch (error) {
    console.error('Error copying files:', error);
    res.status(500).json({ error: 'Failed to copy files' });
  }
});

// POST /api/files/move — move files to target directory
router.post('/move', async (req, res) => {
  const { sourcePaths, targetPath } = req.body;
  if (!sourcePaths || !targetPath) return res.status(400).json({ error: 'sourcePaths and targetPath are required' });

  try {
    if (!fs.existsSync(targetPath)) return res.status(404).json({ error: 'Target path not found' });

    const results = [];
    for (const src of sourcePaths) {
      if (!fs.existsSync(src)) { results.push({ src, status: 'error', error: 'Source not found' }); continue; }

      const destPath = path.join(targetPath, path.basename(src));
      let finalDest = destPath;
      let counter = 2;
      while (fs.existsSync(finalDest)) {
        const ext = path.extname(destPath);
        const base = path.basename(destPath, ext);
        finalDest = path.join(targetPath, `${base} (${counter})${ext}`);
        counter++;
      }

      fs.renameSync(src, finalDest);
      results.push({ src, destPath: finalDest, status: 'success' });
    }

    const userId = getUserIdFromAuth(req);
    if (userId) logActivity(userId, 'move', `${sourcePaths.length} files`, 'File', 'success', `Moved to ${targetPath}`);

    res.json({ success: true, results });
  } catch (error) {
    console.error('Error moving files:', error);
    res.status(500).json({ error: 'Failed to move files' });
  }
});

// POST /api/files/delete — move to OS-native Trash/Recycle Bin
router.post('/delete', async (req, res) => {
  const { paths } = req.body;
  if (!paths || !Array.isArray(paths)) return res.status(400).json({ error: 'paths array is required' });

  try {
    const results = [];
    for (const filePath of paths) {
      if (!fs.existsSync(filePath)) { results.push({ path: filePath, status: 'error', error: 'Not found' }); continue; }
      try {
        moveToNativeTrash(filePath);
        results.push({ path: filePath, status: 'success' });
      } catch (err) {
        results.push({ path: filePath, status: 'error', error: err.message });
      }
    }

    const userId = getUserIdFromAuth(req);
    if (userId) logActivity(userId, 'delete', `${paths.length} items`, 'File', 'success', `Moved ${paths.length} items to OS trash`);

    res.json({ success: true, results });
  } catch (error) {
    console.error('Error deleting files:', error);
    res.status(500).json({ error: 'Failed to delete files' });
  }
});

// GET /api/files/preview?path=/full/path - Serve file for preview
router.get('/preview', async (req, res) => {
  const filePath = req.query.path;

  if (!filePath) {
    return res.status(400).json({ error: 'Path is required' });
  }

  try {
    const resolved = path.resolve(filePath);
    if (!fs.existsSync(resolved)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const stats = fs.statSync(resolved);
    if (stats.isDirectory()) {
      return res.status(400).json({ error: 'Cannot preview a directory' });
    }

    const ext = path.extname(resolved).toLowerCase();
    const mimeMap = {
      '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
      '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
      '.bmp': 'image/bmp', '.ico': 'image/x-icon',
      '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.avi': 'video/x-msvideo',
      '.mkv': 'video/x-matroska', '.webm': 'video/webm', '.wmv': 'video/x-ms-wmv',
      '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.flac': 'audio/flac',
      '.ogg': 'audio/ogg', '.aac': 'audio/aac', '.wma': 'audio/x-ms-wma',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain', '.md': 'text/markdown', '.csv': 'text/csv',
      '.json': 'application/json', '.xml': 'application/xml',
      '.js': 'text/javascript', '.ts': 'text/plain', '.jsx': 'text/javascript', '.tsx': 'text/plain',
      '.html': 'text/html', '.css': 'text/css',
      '.py': 'text/plain', '.java': 'text/plain', '.c': 'text/plain', '.cpp': 'text/plain',
      '.h': 'text/plain', '.rb': 'text/plain', '.php': 'text/plain', '.go': 'text/plain',
      '.rs': 'text/plain', '.swift': 'text/plain', '.kt': 'text/plain',
      '.sh': 'text/plain', '.bash': 'text/plain', '.zsh': 'text/plain',
      '.yaml': 'text/plain', '.yml': 'text/plain',
      '.toml': 'text/plain', '.ini': 'text/plain', '.cfg': 'text/plain',
      '.log': 'text/plain', '.env': 'text/plain',
      '.sql': 'text/plain', '.r': 'text/plain',
    };
    const mime = mimeMap[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Accept-Ranges', 'bytes');
    res.sendFile(resolved);
  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({ error: 'Failed to serve file' });
  }
});

// POST /api/files/permanent-delete — permanently delete files from trash
router.post('/permanent-delete', async (req, res) => {
  const { paths } = req.body;
  if (!paths || !Array.isArray(paths)) return res.status(400).json({ error: 'paths array is required' });

  try {
    const results = [];
    for (const filePath of paths) {
      if (!fs.existsSync(filePath)) { results.push({ path: filePath, status: 'error', error: 'Not found' }); continue; }
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(filePath);
      }
      results.push({ path: filePath, status: 'success' });
    }
    const userId = getUserIdFromAuth(req);
    if (userId) logActivity(userId, 'delete', `${paths.length} items`, 'File', 'success', `Permanently deleted ${paths.length} items`);
    res.json({ success: true, results });
  } catch (error) {
    console.error('Error permanently deleting files:', error);
    res.status(500).json({ error: 'Failed to permanently delete files' });
  }
});

// GET /api/files/trash-list — list OS-native Trash/Recycle Bin contents
router.get('/trash-list', async (req, res) => {
  try {
    const platform = os.platform();
    let items = [];

    if (platform === 'darwin') {
      const trashDir = path.join(os.homedir(), '.Trash');
      if (!fs.existsSync(trashDir)) return res.json([]);

      const names = fs.readdirSync(trashDir).filter(n => !n.startsWith('.'));

      // Batch-get original paths from Finder (best-effort)
      let origPaths = {};
      try {
        const pathsScript = names.map(n => `"${n.replace(/"/g, '\\"')}"`).join(', ');
        const script = `tell application "Finder"\nset output to ""\nset trashItems to every item of trash\nrepeat with itemRef in trashItems\nset itemName to name of itemRef\ntry\nset origPath to POSIX path of (original path of itemRef as alias)\nset output to output & itemName & "\\t" & origPath & "\\n"\nend try\nend repeat\nreturn output\nend tell`;
        const result = execSync('osascript -ss', { input: script, stdio: ['pipe', 'pipe', 'pipe'], timeout: 15000 });
        result.stdout.toString().split('\n').filter(Boolean).forEach(line => {
          const parts = line.split('\t');
          if (parts.length >= 2) origPaths[parts[0]] = parts[1];
        });
      } catch { /* osascript failed, continue without original paths */ }

      for (const name of names) {
        const itemPath = path.join(trashDir, name);
        try {
          const stats = fs.statSync(itemPath);
          items.push({
            id: `trash-${name}`,
            name,
            path: '',
            originalPath: origPaths[name] || null,
            realPath: itemPath,
            size: stats.size,
            sizeDisplay: formatFileSize(stats.size),
            isFolder: stats.isDirectory(),
            category: stats.isDirectory() ? 'Folder' : getFileCategory(name),
            extension: path.extname(name),
            modifiedAt: stats.mtime,
            deletedAt: stats.birthtime,
            status: 'Deleted',
          });
        } catch {}
      }
    } else if (platform === 'win32') {
      // Windows: query Recycle Bin via PowerShell
      try {
        const psScript = `Get-ChildItem 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\BitBucket\\Volume' -ErrorAction SilentlyContinue | ForEach-Object { $_.GetValueNames() | ForEach-Object { $val = $_.GetValue($_); if ($val) { [System.Text.Encoding]::Unicode.GetString($val) } } }`;
        const result = execSync('powershell -Command -', { input: psScript, stdio: ['pipe', 'pipe', 'pipe'], timeout: 15000 });
        // Simple parsing — returns list of original paths
        const lines = result.stdout.toString().split('\n').filter(Boolean);
        for (const origPath of lines) {
          const name = path.basename(origPath);
          items.push({
            id: `trash-${name}-${items.length}`,
            name,
            path: '',
            originalPath: origPath,
            realPath: null,
            size: 0,
            sizeDisplay: '--',
            isFolder: false,
            category: getFileCategory(name),
            extension: path.extname(name),
            modifiedAt: new Date().toISOString(),
            deletedAt: new Date().toISOString(),
            status: 'Deleted',
          });
        }
      } catch { /* fallback */ }
    }

    res.json(items);
  } catch (error) {
    console.error('Error listing trash:', error);
    res.status(500).json({ error: 'Failed to list trash items' });
  }
});

// POST /api/files/empty-trash — empty the OS-native trash
router.post('/empty-trash', async (req, res) => {
  try {
    const platform = os.platform();
    if (platform === 'darwin') {
      execSync("osascript -e 'tell application \"Finder\" to set WarnOnEmptyTrash to false' -e 'tell application \"Finder\" to empty trash'", { stdio: 'pipe', timeout: 30000 });
    } else if (platform === 'win32') {
      execSync('powershell -Command "Clear-RecycleBin -Force"', { stdio: 'pipe', timeout: 30000 });
    }

    const userId = getUserIdFromAuth(req);
    if (userId) logActivity(userId, 'delete', 'Trash', 'File', 'success', 'Emptied OS trash');

    res.json({ success: true });
  } catch (error) {
    console.error('Error emptying trash:', error);
    res.status(500).json({ error: 'Failed to empty trash' });
  }
});

module.exports = router;
