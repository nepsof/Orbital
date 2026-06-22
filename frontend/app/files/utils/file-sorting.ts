import { FileItem } from '../context/FilesContext';

export type SortField = 'name' | 'size' | 'modifiedAt' | 'category' | 'status';
export type SortDirection = 'asc' | 'desc';

export const sortFiles = (
  files: FileItem[],
  field: SortField,
  direction: SortDirection
): FileItem[] => {
  return [...files].sort((a, b) => {
    // Folders always come first in most file explorers
    if (a.isFolder && !b.isFolder) return -1;
    if (!a.isFolder && b.isFolder) return 1;

    let comparison = 0;
    
    switch (field) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'size':
        comparison = (a.size || 0) - (b.size || 0);
        break;
      case 'modifiedAt':
        comparison = new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime();
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
      case 'status':
        comparison = (a.status || '').localeCompare(b.status || '');
        break;
      default:
        comparison = 0;
    }

    return direction === 'asc' ? comparison : -comparison;
  });
};
