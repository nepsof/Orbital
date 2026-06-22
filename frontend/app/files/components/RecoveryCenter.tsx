import React from 'react';
import { FiRefreshCw, FiFileText, FiTrash2, FiRotateCcw, FiImage, FiVideo, FiArchive } from 'react-icons/fi';
import { useFilesManager } from '../context/FilesContext';
import './recovery-center.css';

const RecoveryCenter: React.FC = () => {
  const { recoveryItems, restoreFile } = useFilesManager();

  const getFileIcon = (fileName: string) => {
    const name = fileName.toLowerCase();
    if (name.endsWith('.pdf')) return <FiFileText />;
    if (name.endsWith('.zip') || name.endsWith('.gz')) return <FiArchive />;
    if (name.endsWith('.mp4')) return <FiVideo />;
    if (name.endsWith('.fig') || name.endsWith('.jpg')) return <FiImage />;
    return <FiFileText />;
  };

  return (
    <section className="recovery-panel surface-raised">
      <div className="panel-header">
        <div className="header-title">
          <FiTrash2 className="icon-trash" />
          <h3>Recovery Center</h3>
        </div>
        <button className="btn-view-all">Open Trash</button>
      </div>

      <div className="deleted-files-list">
        {recoveryItems.length === 0 ? (
          <div className="empty-state-recovery">
            <p>Recovery Center is empty</p>
          </div>
        ) : (
          recoveryItems.map((file) => (
            <div key={file.id} className="deleted-file-card">
              <div className="file-icon-box">
                {getFileIcon(file.name)}
              </div>
              <div className="file-details">
                <h4>{file.name}</h4>
                <p>Was in: {file.originalPath}</p>
                <span className="file-meta">{file.sizeDisplay} • Deleted {new Date(file.deletedAt).toLocaleDateString()}</span>
              </div>
              <button 
                className="btn-restore" 
                title="Restore to original location"
                onClick={() => restoreFile(file.id)}
              >
                <FiRotateCcw /> Restore
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default RecoveryCenter;
