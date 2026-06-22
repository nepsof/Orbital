/**
 * Cross-platform path utilities supporting Windows, macOS, and Linux styles
 */

export const normalizePath = (path: string): string => {
  if (!path) return '';
  // Replace backslashes with forward slashes for internal consistency
  let normalized = path.replace(/\\/g, '/');
  // Remove trailing slashes unless it's the root
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
};

export const getBreadcrumbs = (path: string): string[] => {
  const normalized = normalizePath(path);
  if (!normalized || normalized === '/') return [];
  
  // Handle Windows drive letters (e.g., C:/)
  const driveMatch = normalized.match(/^([a-zA-Z]:)/);
  if (driveMatch) {
    const drive = driveMatch[1];
    const rest = normalized.slice(drive.length);
    return [drive, ...rest.split('/').filter(Boolean)];
  }
  
  // For absolute POSIX paths, we want to keep the root conceptually
  // but the breadcrumbs usually show the parts.
  return normalized.split('/').filter(Boolean);
};

export const reconstructPath = (breadcrumbs: string[]): string => {
  if (breadcrumbs.length === 0) return '/';
  
  const first = breadcrumbs[0];
  // If first part is a Windows drive letter
  if (first.match(/^[a-zA-Z]:$/)) {
    return first + '/' + breadcrumbs.slice(1).join('/');
  }
  
  // Otherwise assume POSIX absolute path
  return '/' + breadcrumbs.join('/');
};

export const joinPaths = (...parts: string[]): string => {
  const isAbsolute = parts[0]?.startsWith('/');
  const combined = parts
    .map(p => normalizePath(p))
    .filter(Boolean)
    .join('/')
    .replace(/\/+/g, '/');
    
  if (isAbsolute && !combined.startsWith('/')) {
    return '/' + combined;
  }
  // Special case for root-relative paths in our virtual system
  if (parts[0] === '' && parts[1]?.startsWith('/') && !combined.startsWith('/')) {
    return '/' + combined;
  }
  return combined;
};

export const getParentPath = (path: string): string => {
  const normalized = normalizePath(path);
  const parts = normalized.split('/');
  if (parts.length <= 1) return normalized.includes(':') ? normalized : '/';
  return parts.slice(0, -1).join('/') || '/';
};

export const getFileName = (path: string): string => {
  return normalizePath(path).split('/').pop() || '';
};

export const getExtension = (fileName: string): string => {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
};
