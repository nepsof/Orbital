const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CACHE_DIR = '/tmp/orbital-icons';
const SWIFT_SRC = path.join(__dirname, 'icon_extractor.swift');
const SWIFT_BIN = path.join(__dirname, '.icon_extractor');
let swiftReady = false;

// Try to compile Swift binary on module load
if (process.platform === 'darwin') {
  try {
    const swiftcPath = execSync('which swiftc', { encoding: 'utf8', timeout: 3000 }).trim();
    if (swiftcPath && fs.existsSync(SWIFT_SRC)) {
      execSync(`"${swiftcPath}" -O -o "${SWIFT_BIN}" "${SWIFT_SRC}" 2>/dev/null`, { timeout: 30000 });
      if (fs.existsSync(SWIFT_BIN)) {
        fs.chmodSync(SWIFT_BIN, 0o755);
        swiftReady = true;
      }
    }
  } catch {
    // Swift compilation failed, will use fallback
  }
}

function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function getIconCachePath(filePath) {
  const hash = Buffer.from(filePath).toString('base64').replace(/[/+=]/g, '_');
  return path.join(CACHE_DIR, `${hash}.png`);
}

function getFileMtime(filePath) {
  try {
    return fs.statSync(filePath).mtimeMs;
  } catch {
    return 0;
  }
}

function isCacheValid(cachePath, filePath) {
  try {
    const cacheStat = fs.statSync(cachePath);
    const fileMtime = getFileMtime(filePath);
    return cacheStat.mtimeMs >= fileMtime;
  } catch {
    return false;
  }
}

const FILE_COLORS = {
  '.pdf': { bg: '#e74c3c', label: 'PDF' },
  '.doc': { bg: '#2980b9', label: 'DO' },
  '.docx': { bg: '#2980b9', label: 'DX' },
  '.xls': { bg: '#27ae60', label: 'XL' },
  '.xlsx': { bg: '#27ae60', label: 'XX' },
  '.ppt': { bg: '#e67e22', label: 'PP' },
  '.pptx': { bg: '#e67e22', label: 'PX' },
  '.txt': { bg: '#7f8c8d', label: 'TX' },
  '.md': { bg: '#7f8c8d', label: 'MD' },
  '.rtf': { bg: '#7f8c8d', label: 'RT' },
  '.jpg': { bg: '#2ecc71', label: 'JP' },
  '.jpeg': { bg: '#2ecc71', label: 'JPG' },
  '.png': { bg: '#2ecc71', label: 'PN' },
  '.gif': { bg: '#2ecc71', label: 'GI' },
  '.svg': { bg: '#2ecc71', label: 'SV' },
  '.webp': { bg: '#2ecc71', label: 'WP' },
  '.bmp': { bg: '#2ecc71', label: 'BM' },
  '.ico': { bg: '#2ecc71', label: 'IC' },
  '.mp3': { bg: '#9b59b6', label: 'MP' },
  '.wav': { bg: '#9b59b6', label: 'WA' },
  '.flac': { bg: '#9b59b6', label: 'FL' },
  '.aac': { bg: '#9b59b6', label: 'AA' },
  '.mp4': { bg: '#e67e22', label: 'MP' },
  '.mov': { bg: '#e67e22', label: 'MO' },
  '.avi': { bg: '#e67e22', label: 'AV' },
  '.mkv': { bg: '#e67e22', label: 'MK' },
  '.zip': { bg: '#f39c12', label: 'ZI' },
  '.rar': { bg: '#f39c12', label: 'RA' },
  '.7z': { bg: '#f39c12', label: '7Z' },
  '.tar': { bg: '#f39c12', label: 'TA' },
  '.gz': { bg: '#f39c12', label: 'GZ' },
  '.js': { bg: '#f1c40f', label: 'JS' },
  '.ts': { bg: '#3498db', label: 'TS' },
  '.jsx': { bg: '#f1c40f', label: 'JX' },
  '.tsx': { bg: '#3498db', label: 'TX' },
  '.py': { bg: '#2ecc71', label: 'PY' },
  '.rb': { bg: '#e74c3c', label: 'RB' },
  '.go': { bg: '#3498db', label: 'GO' },
  '.rs': { bg: '#e67e22', label: 'RS' },
  '.java': { bg: '#e74c3c', label: 'JV' },
  '.cpp': { bg: '#3498db', label: 'CP' },
  '.c': { bg: '#3498db', label: 'C' },
  '.h': { bg: '#95a5a6', label: 'H' },
  '.html': { bg: '#e74c3c', label: 'HT' },
  '.css': { bg: '#3498db', label: 'CS' },
  '.json': { bg: '#7f8c8d', label: 'JN' },
  '.xml': { bg: '#7f8c8d', label: 'XM' },
  '.yaml': { bg: '#7f8c8d', label: 'YM' },
  '.yml': { bg: '#7f8c8d', label: 'YM' },
  '.sh': { bg: '#2c3e50', label: 'SH' },
  '.bat': { bg: '#2c3e50', label: 'BT' },
  '.ps1': { bg: '#2c3e50', label: 'PS' },
  '.exe': { bg: '#6366f1', label: 'EX' },
  '.dmg': { bg: '#6366f1', label: 'DM' },
  '.app': { bg: '#6366f1', label: 'AP' },
  '.dll': { bg: '#6366f1', label: 'DL' },
  '.db': { bg: '#8e44ad', label: 'DB' },
  '.sql': { bg: '#8e44ad', label: 'SQ' },
  '.log': { bg: '#95a5a6', label: 'LG' },
  '.lock': { bg: '#95a5a6', label: 'LC' },
  '.cfg': { bg: '#95a5a6', label: 'CF' },
  '.ini': { bg: '#95a5a6', label: 'IN' },
  '.env': { bg: '#95a5a6', label: 'EN' },
  '.gitignore': { bg: '#95a5a6', label: 'GI' },
};

function getFileLabel(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const info = FILE_COLORS[ext];
  if (info) return info;
  const base = path.basename(filePath);
  if (!ext || ext === base) {
    // No extension or hidden file
    if (fs.existsSync(filePath)) {
      try {
        if (fs.statSync(filePath).isDirectory()) return { bg: '#3498db', label: 'FO' };
      } catch {}
    }
    return { bg: '#95a5a6', label: (ext || base).slice(1, 3).toUpperCase() || 'FI' };
  }
  return { bg: '#95a5a6', label: ext.replace('.', '').toUpperCase().slice(0, 2) || 'FI' };
}

function generateFallbackSvg(filePath) {
  const info = getFileLabel(filePath);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <rect width="64" height="64" rx="6" fill="${info.bg}" opacity="0.9"/>
    <text x="32" y="41" text-anchor="middle" font-family="-apple-system,Helvetica,Arial,sans-serif" font-size="22" font-weight="700" fill="#fff">${info.label}</text>
  </svg>`;
}

function getFileIconSync(filePath) {
  if (!fs.existsSync(filePath)) return null;

  ensureCacheDir();
  const cachePath = getIconCachePath(filePath);
  if (isCacheValid(cachePath, filePath)) {
    return fs.readFileSync(cachePath);
  }

  const platform = process.platform;

  // macOS — use compiled Swift binary
  if (platform === 'darwin' && swiftReady) {
    try {
      const data = execSync(`"${SWIFT_BIN}" "${filePath}"`, { timeout: 10000 });
      if (data && data.length > 50) {
        fs.writeFileSync(cachePath, data);
        return data;
      }
    } catch {
      // fall through to fallback
    }
  }

  // Windows — use PowerShell
  if (platform === 'win32') {
    try {
      const escapedPath = filePath.replace(/'/g, "''");
      const psScript = `
        Add-Type -AssemblyName System.Drawing;
        $icon = [System.Drawing.Icon]::ExtractAssociatedIcon('${escapedPath}');
        if ($icon) {
          $bitmap = $icon.ToBitmap();
          $ms = New-Object System.IO.MemoryStream;
          $bitmap.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png);
          [System.Convert]::ToBase64String($ms.ToArray());
        }
      `;
      const result = execSync(`powershell -NoProfile -Command "${psScript.replace(/"/g, '\\"')}"`, { timeout: 10000, encoding: 'utf8' });
      if (result && result.trim()) {
        const pngBuffer = Buffer.from(result.trim(), 'base64');
        if (pngBuffer.length > 50) {
          fs.writeFileSync(cachePath, pngBuffer);
          return pngBuffer;
        }
      }
    } catch {
      // fall through to fallback
    }
  }

  // Fallback: generate SVG icon
  const svg = generateFallbackSvg(filePath);
  // Convert SVG to PNG using sips on macOS (simple conversion)
  if (platform === 'darwin') {
    const tmpSvg = path.join(CACHE_DIR, `tmp_${Date.now()}.svg`);
    try {
      fs.writeFileSync(tmpSvg, svg);
      execSync(`sips -s format png "${tmpSvg}" --out "${cachePath}" 2>/dev/null`, { timeout: 10000 });
      if (fs.existsSync(cachePath)) {
        return fs.readFileSync(cachePath);
      }
    } catch {
      // fall through
    } finally {
      try { fs.unlinkSync(tmpSvg); } catch {}
    }
  }

  // Last resort: return SVG as buffer with .svg extension in cache
  // (The endpoint will sniff the content and set Content-Type accordingly)
  const svgPath = path.join(CACHE_DIR, `${path.basename(cachePath, '.png')}.svg`);
  fs.writeFileSync(svgPath, svg);
  // Store the SVG path in a marker file so the endpoint knows to serve SVG
  fs.writeFileSync(cachePath + '.type', 'svg');
  return svg;
}

// New: check whether a cached result is SVG or PNG
function getCachedIcon(filePath) {
  if (!fs.existsSync(filePath)) return null;
  ensureCacheDir();
  const cachePath = getIconCachePath(filePath);
  const typePath = cachePath + '.type';

  if (isCacheValid(cachePath, filePath)) {
    if (fs.existsSync(typePath)) {
      // Was SVG fallback
      const svgPath = cachePath.replace(/\.png$/, '.svg');
      if (fs.existsSync(svgPath)) {
        return { data: fs.readFileSync(svgPath, 'utf8'), type: 'svg' };
      }
    }
    return { data: fs.readFileSync(cachePath), type: 'png' };
  }

  // Not cached, generate fresh
  const pngData = getFileIconSync(filePath);
  if (!pngData) return null;

  if (fs.existsSync(typePath)) {
    const svgPath = cachePath.replace(/\.png$/, '.svg');
    if (fs.existsSync(svgPath)) {
      return { data: fs.readFileSync(svgPath, 'utf8'), type: 'svg' };
    }
  }

  return { data: pngData, type: 'png' };
}

module.exports = { getFileIconSync, getCachedIcon };
