import { FileItem } from '../context/FilesContext';

export const filterFiles = (
  files: FileItem[],
  query: string,
  currentPath: string,
  filterType: string
): FileItem[] => {
  let filtered = files;

  // 1. Filter by current directory (if not in a special smart filter mode)
  if (filterType === 'all') {
    const normalizedPath = currentPath === '/' ? '/' : currentPath.replace(/\/$/, '');
    if (query.trim()) {
      filtered = filtered.filter((f) =>
        f.path === normalizedPath ||
        f.path.startsWith(normalizedPath === '/' ? '/' : `${normalizedPath}/`)
      );
    } else {
      filtered = filtered.filter((f) => f.path === normalizedPath);
    }
  }

  // 2. Apply Smart Filters
  switch (filterType) {
    case 'favorites':
      filtered = filtered.filter(f => f.isFavorite);
      break;
    case 'recent':
      filtered = filtered.filter(f => f.status === 'Recent');
      break;
    case 'large':
      filtered = filtered.filter(f => f.isLarge);
      break;
    case 'duplicates':
      filtered = filtered.filter(f => f.isDuplicate);
      break;
    case 'videos':
      filtered = filtered.filter(f => f.category === 'Videos');
      break;
    case 'images':
      filtered = filtered.filter(f => f.category === 'Images');
      break;
    case 'files':
      filtered = filtered.filter(f => f.category === 'Files');
      break;
    case 'audio':
      filtered = filtered.filter(f => f.category === 'Audio');
      break;
  }

  // 3. Apply Search Query
  if (query.trim()) {
    const lowerQuery = query.toLowerCase();
    filtered = filtered.filter(f => 
      f.name.toLowerCase().includes(lowerQuery) ||
      f.category.toLowerCase().includes(lowerQuery) ||
      f.tags.some(t => t.toLowerCase().includes(lowerQuery))
    );
  }

  return filtered;
};
