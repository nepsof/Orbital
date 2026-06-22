import React from 'react';
import { 
  FiFolder, FiFileText, FiImage, FiVideo, FiArchive, 
  FiMusic, FiCode, FiDatabase, FiLayers
} from 'react-icons/fi';

export const getFileIcon = (category: string, fileName: string, isFolder?: boolean) => {
  if (isFolder) return FiFolder;
  
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  
  switch (category) {
    case 'Videos': return FiVideo;
    case 'Images': return FiImage;
    case 'Audio': return FiMusic;
    case 'Archives': return FiArchive;
    case 'Documents': return FiFileText;
    case 'Design': return FiLayers;
    case 'Files':
      if (['js', 'ts', 'tsx', 'jsx', 'html', 'css', 'json', 'py', 'go', 'rs'].includes(ext)) {
        return FiCode;
      }
      if (['sql', 'db', 'sqlite'].includes(ext)) {
        return FiDatabase;
      }
      return FiFileText;
    default: return FiFileText;
  }
};

export const getIconClassName = (category: string, isFolder?: boolean) => {
  if (isFolder) return 'icon-folder';
  switch (category) {
    case 'Videos': return 'icon-video';
    case 'Images': return 'icon-image';
    case 'Audio': return 'icon-audio';
    case 'Archives': return 'icon-archive';
    case 'Documents': return 'icon-pdf';
    default: return 'icon-default';
  }
};
