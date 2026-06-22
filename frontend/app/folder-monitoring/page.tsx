"use client";

import { useState } from 'react';
import './folder-monitoring.css';
import '../settings/settings.css';
import Navbar from '../components/navbar';
import { useFolderMonitoring } from './hooks';
import { CategoryMapping, MonitoredFolder } from './types';

// ---- Sub-Components ----

const Toggle = ({ checked, onChange, disabled }: { checked: boolean, onChange: (val: boolean) => void, disabled?: boolean }) => (
  <label className="fm-switch">
    <input 
      type="checkbox" 
      checked={checked} 
      onChange={(e) => onChange(e.target.checked)}
      disabled={disabled}
    />
    <span className="fm-slider"></span>
  </label>
);

const SectionHeader = ({ title, subtitle }: { title: string, subtitle?: string }) => (
  <div className="fm-section-header">
    <h3>{title}</h3>
    {subtitle && <p className="fm-section-subtitle">{subtitle}</p>}
  </div>
);

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => (
  <div className="toast-container">
    <div className={`toast ${type}`}>
      <span className="toast-icon">{type === 'success' ? '✅' : '❌'}</span>
      <div className="toast-content">
        <span className="toast-title">{type === 'success' ? 'Success' : 'Error'}</span>
        <p className="toast-message">{message}</p>
      </div>
      <button className="password-toggle" onClick={onClose}>✕</button>
    </div>
  </div>
);

export function FolderMonitoringContent() {
  const {
    fmSettings,
    monitoredFolders,
    ignoredItems,
    categoryMappings,
    recentActivity,
    recoveryHistory,
    loading,
    saving,
    updateFmSettings,
    addFolder,
    updateFolder,
    removeFolder,
    undoRemoval,
    restoreFolder,
    toggleFolderStatus,
    updateFolderStats,
    addExclusion,
    removeExclusion,
    updateCategoryMapping
  } = useFolderMonitoring();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<MonitoredFolder | null>(null);
  const [newFolderPath, setNewFolderPath] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [newExclusion, setNewExclusion] = useState('');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryMapping | null>(null);
  const [folderStats, setFolderStats] = useState({ files: 0, storage: '0 KB' });
  const [refreshingFolderId, setRefreshingFolderId] = useState<string | null>(null);
  const [activityPage, setActivityPage] = useState(1);
  const activitiesPerPage = 10;

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) {
      setRefreshingFolderId(null);
      return;
    }

    // Calculate total size and file count
    let totalSize = 0;
    const fileCount = files.length;
    
    // Safely iterate through FileList
    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (file) {
        totalSize += file.size;
      }
    }

    // Format size
    let storage = '0 KB';
    if (totalSize >= 1073741824) {
      storage = `${(totalSize / 1073741824).toFixed(1)} GB`;
    } else if (totalSize >= 1048576) {
      storage = `${(totalSize / 1048576).toFixed(1)} MB`;
    } else if (totalSize >= 1024) {
      storage = `${(totalSize / 1024).toFixed(1)} KB`;
    } else {
      storage = `${totalSize} B`;
    }

    const stats = { files: fileCount, storage };

    if (refreshingFolderId) {
      updateFolderStats(refreshingFolderId, stats);
      showToast('Folder stats updated successfully', 'success');
      setRefreshingFolderId(null);
    } else {
      // Get the folder name safely
      let folderName = 'Selected Folder';
      
      if (fileCount > 0) {
        const firstFile = files[0] || files.item(0);
        if (firstFile) {
          if (firstFile.webkitRelativePath) {
            folderName = firstFile.webkitRelativePath.split('/')[0];
          } else if (firstFile.name) {
            folderName = firstFile.name;
          }
        }
      }

      // Update stats before opening modal
      setFolderStats(stats);
      
      // Try to get the actual path from the file input if available
      // Note: browsers don't expose full paths for security, but we can try
      let actualPath = '';
      if (files.length > 0) {
        const firstFile = files[0];
        if (firstFile.webkitRelativePath) {
          // Extract the folder path from the relative path
          const parts = firstFile.webkitRelativePath.split('/');
          // Remove the filename, keep the folder structure
          const folderPath = parts.slice(0, -1).join('/');
          // This is still relative, so we need user to provide the base path
          // For now, use a sensible default that user can edit
          actualPath = `/Users/${process.env.USER || 'manzil'}/${folderPath}`;
        }
      }
      
      // If we couldn't detect the path, use a sensible default
      if (!actualPath) {
        actualPath = `/Users/${process.env.USER || 'manzil'}/Documents/${folderName}`;
      }
      
      setNewFolderPath(actualPath);
      setNewFolderName(folderName);
      setIsAddModalOpen(true);
    }
    
    // Reset the input so the same folder can be picked again if needed
    e.target.value = '';
  };

  const handleRefreshClick = (id: string) => {
    setRefreshingFolderId(id);
    document.getElementById('folder-picker')?.click();
  };

  const handleAddFolder = () => {
    const result = addFolder(newFolderPath, newFolderName, folderStats);
    if (result.valid) {
      setIsAddModalOpen(false);
      setNewFolderPath('');
      setNewFolderName('');
      setFolderStats({ files: 0, storage: '0 KB' });
      showToast('Folder added successfully', 'success');
    } else {
      showToast(result.error || 'Failed to add folder', 'error');
    }
  };

  const handleUpdateFolder = () => {
    if (editingFolder) {
      updateFolder(editingFolder.id, {
        name: newFolderName,
        path: newFolderPath,
        rules: editingFolder.rules
      });
      setEditingFolder(null);
      setNewFolderPath('');
      setNewFolderName('');
      showToast('Folder updated successfully', 'success');
    }
  };

  const handleEditClick = (folder: MonitoredFolder) => {
    setEditingFolder(folder);
    setNewFolderName(folder.name);
    setNewFolderPath(folder.path);
  };

  const handleAddExclusion = () => {
    if (newExclusion.trim()) {
      addExclusion(newExclusion);
      setNewExclusion('');
      showToast('Exclusion added', 'success');
    }
  };

  const handleUpdateCategory = (updates: Partial<CategoryMapping>) => {
    if (editingCategory) {
      updateCategoryMapping(editingCategory.id, updates);
      setEditingCategory(null);
      showToast('Category updated', 'success');
    }
  };

  const formatActivityTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return timestamp; // Return as is if not a valid date
      
      const now = new Date();
      const isToday = date.getDate() === now.getDate() &&
                      date.getMonth() === now.getMonth() &&
                      date.getFullYear() === now.getFullYear();

      if (isToday) {
        return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      } else {
        // Format: Thu 14 May 2026
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        const dayName = days[date.getDay()];
        const day = date.getDate();
        const monthName = months[date.getMonth()];
        const year = date.getFullYear();
        
        return `${dayName} ${day} ${monthName} ${year}`;
      }
    } catch (error) {
      console.error('Error parsing timestamp:', error);
      return timestamp;
    }
  };

  if (loading) {
    return (
      <div className="settings-loading">
        <div className="spinner"></div>
        <p>Loading monitoring engine...</p>
      </div>
    );
  }

  const globalEnabled = fmSettings.monitoringEnabled;
  const activeFoldersCount = monitoredFolders.filter(f => f.status === 'active').length;

  return (
    <div className="tab-section folder-monitoring-settings">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <h2>Folder Monitoring</h2>

      {/* 1. Overview Card */}
      <div className="fm-overview-card">
        <div className="fm-overview-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className={`fm-status-badge ${globalEnabled ? 'active' : 'paused'}`}>
                <span className="fm-status-dot"></span>
                {globalEnabled ? 'System Active' : 'System Paused'}
              </div>
              {saving && <span className="fm-saving-indicator">Saving...</span>}
            </div>
            <p className="fm-section-subtitle fm-mt-2">
              Monitoring {monitoredFolders.length} folders for safety and performance.
            </p>
          </div>
          <Toggle 
            checked={globalEnabled} 
            onChange={(val) => updateFmSettings({ monitoringEnabled: val })} 
            disabled={saving} 
          />
        </div>

        <div className="fm-overview-stats">
          <div className="fm-stat-item">
            <span className="fm-stat-value">{monitoredFolders.length}</span>
            <span className="fm-stat-label">Monitored</span>
          </div>
          <div className="fm-stat-item">
            <span className="fm-stat-value">{activeFoldersCount}</span>
            <span className="fm-stat-label">Active</span>
          </div>
          <div className="fm-stat-item">
            <span className="fm-stat-value">
              {recentActivity[0]?.time ? formatActivityTime(recentActivity[0].time) : 'Never'}
            </span>
            <span className="fm-stat-label">Last Activity</span>
          </div>
          <div className="fm-stat-item">
            <span className="fm-stat-value">{globalEnabled ? 'Healthy' : 'Paused'}</span>
            <span className="fm-stat-label">Engine Status</span>
          </div>
        </div>

        <div className="fm-info-box">
          ℹ️ Only selected folders are monitored for safety and performance.
        </div>
      </div>

      {/* 2. Monitored Folders List */}
      <div className="fm-section">
        <SectionHeader title="Monitored Folders" subtitle="Manage specific directories for smart organization." />
        <div className="fm-folders-grid">
          {monitoredFolders.map((folder, idx) => (
            <div key={`${folder.id}-${idx}`} className="fm-folder-card">
              <div className="fm-folder-header">
                <div className="fm-folder-icon">{folder.icon}</div>
                <div className="fm-folder-info">
                  <div className="fm-folder-name">{folder.name}</div>
                  <div className="fm-folder-path" title={folder.path}>{folder.path}</div>
                  <div className="fm-active-rules-badges">
                    {folder.rules?.autoOrganize && <span className="fm-rule-badge" title="Auto Organize">📂</span>}
                    {folder.rules?.detectDuplicates && <span className="fm-rule-badge" title="Detect Duplicates">👯</span>}
                    {folder.rules?.compressionSuggestions && <span className="fm-rule-badge" title="Compression">🗜️</span>}
                  </div>
                </div>
                <div className={`fm-status-badge fm-status-badge-small ${folder.status === 'active' ? 'active' : 'paused'}`}>
                  {folder.status}
                </div>
              </div>

              <div className="fm-folder-stats">
                <div className="fm-fstat-item">
                  <span className="fm-fstat-label">Files</span>
                  <span className="fm-fstat-value">{(folder.files || 0).toLocaleString()}</span>
                </div>
                <div className="fm-fstat-item">
                  <span className="fm-fstat-label">Storage</span>
                  <span className="fm-fstat-value">{folder.storage || '0 KB'}</span>
                </div>
                <div className="fm-fstat-item">
                  <span className="fm-fstat-label">Last Scan</span>
                  <span className="fm-fstat-value">{folder.lastScan}</span>
                </div>
                <div className="fm-fstat-item">
                  <span className="fm-fstat-label">Type</span>
                  <span className="fm-fstat-value">{folder.type}</span>
                </div>
              </div>

              <div className="fm-folder-actions">
                <Toggle 
                  checked={folder.status === 'active'} 
                  onChange={() => toggleFolderStatus(folder.id)} 
                />
                <div className="fm-action-btns">
                  <button 
                    className={`fm-icon-btn ${refreshingFolderId === folder.id ? 'fm-spin' : ''}`} 
                    title="Scan/Refresh Folder"
                    onClick={() => handleRefreshClick(folder.id)}
                  >
                    🔄
                  </button>
                  <button className="fm-icon-btn" title="Edit Folder" onClick={() => handleEditClick(folder)}>✏️</button>
                  <button className="fm-icon-btn danger" title="Remove" onClick={() => removeFolder(folder.id)}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
          {monitoredFolders.length === 0 && (
            <div className="fm-empty-state">
              <p>No folders are currently being monitored.</p>
            </div>
          )}
        </div>
      </div>

      {/* 3. Add Folder Section */}
      <div className="fm-section">
        <input 
          type="file" 
          id="folder-picker" 
          style={{ display: 'none' }} 
          /* @ts-expect-error - webkitdirectory is a non-standard attribute but works in modern browsers */
          webkitdirectory="" 
          directory="" 
          onChange={handleFolderSelect}
        />
        
        {!isAddModalOpen ? (
          <div className="fm-add-folder-card" onClick={() => document.getElementById('folder-picker')?.click()}>
            <div className="fm-add-icon">📂</div>
            <div className="fm-text-center">
              <div className="fm-rule-label">Choose Folder from PC</div>
              <p className="fm-rule-desc">Click to open system folder selector</p>
            </div>
          </div>
        ) : (
          <div className="fm-add-folder-form">
            <h4>Confirm Monitoring Folder</h4>
            <div className="fm-info-box fm-mb-4">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Selected: <strong>{newFolderName}</strong></span>
                <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>{folderStats.files} files • {folderStats.storage}</span>
              </div>
            </div>
            <div className="fm-form-group">
              <label>Folder Path (Required)</label>
              <input 
                type="text" 
                value={newFolderPath}
                onChange={(e) => setNewFolderPath(e.target.value)}
                placeholder="/path/to/folder"
                style={{ borderColor: newFolderPath ? '#4CAF50' : '#ff4444' }}
              />
              <p className="fm-rule-desc fm-mt-1">Enter the actual system path. This path will be used to fetch files from the backend.</p>
            </div>
            <div className="fm-form-group">
              <label>Display Name</label>
              <input 
                type="text" 
                placeholder="e.g. Work Documents" 
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
            </div>
            <div className="fm-form-actions">
              <button className="fm-btn outline" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
              <button className="fm-btn primary" onClick={handleAddFolder}>Confirm & Start Monitoring</button>
            </div>
          </div>
        )}
        <div className="fm-warning-box">
          ⚠️ Protected system directories cannot be monitored.
        </div>
      </div>

      {/* 4. Edit Folder Modal */}
      {editingFolder && (
        <div className="fm-modal-overlay">
          <div className="fm-modal">
            <h4>Edit Folder Settings</h4>
            <div className="fm-form-group">
              <label>Folder Name</label>
              <input 
                type="text" 
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
            </div>
            <div className="fm-form-group">
              <label>Folder Path</label>
              <input 
                type="text" 
                value={newFolderPath}
                onChange={(e) => setNewFolderPath(e.target.value)}
              />
            </div>

            <div className="fm-edit-rules-section">
              <SectionHeader title="Active Rules for this Folder" />
              <div className="fm-mini-rules">
                {[
                  { key: 'autoOrganize', label: 'Auto Organize', emoji: '📂' },
                  { key: 'detectDuplicates', label: 'Detect Duplicates', emoji: '👯' },
                  { key: 'compressionSuggestions', label: 'Compression', emoji: '🗜️' }
                ].map((rule) => (
                  <div key={rule.key} className="fm-mini-rule-item">
                    <div className="fm-mini-rule-info">
                      <span>{rule.emoji}</span>
                      <span className="fm-mini-rule-label">{rule.label}</span>
                    </div>
                    <Toggle 
                      checked={editingFolder.rules?.[rule.key as keyof typeof editingFolder.rules] ?? true} 
                      onChange={(val) => {
                        setEditingFolder({
                          ...editingFolder,
                          rules: {
                            ...(editingFolder.rules || {
                              autoOrganize: true,
                              detectDuplicates: true,
                              compressionSuggestions: true
                            }),
                            [rule.key]: val
                          }
                        });
                      }} 
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="fm-form-actions">
              <button className="fm-btn outline" onClick={() => setEditingFolder(null)}>Cancel</button>
              <button className="fm-btn primary" onClick={handleUpdateFolder}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Organization Rules */}
      <div className="fm-section">
        <SectionHeader title="Organization Rules" subtitle="Configure how files are handled automatically." />
        <div className="fm-rules-grid">
          {[
            { key: 'autoOrganize', label: 'Auto organize files', desc: 'Automatically move files to categories.' },
            { key: 'autoCreateFolders', label: 'Auto create category folders', desc: 'Create missing destination folders.' },
            { key: 'detectDuplicates', label: 'Auto detect duplicates', desc: 'Identify and flag identical files.' },
            { key: 'compressionSuggestions', label: 'Auto compression suggestions', desc: 'Suggest archives for old large files.' },
            { key: 'askBeforeMove', label: 'Ask before moving files', desc: 'Require confirmation for all actions.' },
            { key: 'safeMode', label: 'Safe mode (suggest only)', desc: 'Generate reports without moving files.' },
          ].map((rule) => (
            <div key={rule.key} className="fm-rule-item">
              <div className="fm-rule-content">
                <div className="fm-rule-label">{rule.label}</div>
                <div className="fm-rule-desc">{rule.desc}</div>
              </div>
              <Toggle 
                checked={fmSettings.organizationRules[rule.key as keyof typeof fmSettings.organizationRules]} 
                onChange={(val) => updateFmSettings({ 
                  organizationRules: { ...fmSettings.organizationRules, [rule.key]: val } 
                })} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* 5. Category Mapping */}
      <div className="fm-section">
        <SectionHeader title="Category Mapping" subtitle="Define where different file types should be moved." />
        <div className="fm-categories-grid">
          {categoryMappings.map(cat => (
            <div key={cat.id} className="fm-category-card" onClick={() => setEditingCategory(cat)}>
              <div className="fm-cat-header">
                <div className="fm-cat-icon">{cat.icon}</div>
                <div className="fm-cat-title">{cat.title}</div>
                <div className="fm-cat-toggle">
                  <Toggle 
                    checked={cat.enabled} 
                    onChange={(val) => updateCategoryMapping(cat.id, { enabled: val })} 
                  />
                </div>
              </div>
              <div className="fm-cat-exts">{cat.exts}</div>
              <div className="fm-cat-dest">
                <span>📂</span> {cat.dest}
              </div>
            </div>
          ))}
        </div>

        {editingCategory && (
          <div className="fm-modal-overlay">
            <div className="fm-modal">
              <h4>Edit Category: {editingCategory.title}</h4>
              <div className="fm-form-group">
                <label>Destination Path</label>
                <input 
                  type="text" 
                  value={editingCategory.dest}
                  onChange={(e) => setEditingCategory({ ...editingCategory, dest: e.target.value })}
                />
              </div>
              <div className="fm-form-group">
                <label>File Extensions (comma separated)</label>
                <input 
                  type="text" 
                  value={editingCategory.exts}
                  onChange={(e) => setEditingCategory({ ...editingCategory, exts: e.target.value })}
                />
              </div>
              <div className="fm-form-actions">
                <button className="fm-btn outline" onClick={() => setEditingCategory(null)}>Cancel</button>
                <button className="fm-btn primary" onClick={() => handleUpdateCategory(editingCategory)}>Save Changes</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. Ignored Items */}
      <div className="fm-section">
        <SectionHeader title="Ignored Files & Folders" subtitle="Files and directories that will be skipped during scans." />
        <div className="fm-tags-container">
          {ignoredItems.map(tag => (
            <div key={tag} className="fm-tag">
              {tag} <span className="fm-tag-remove" onClick={() => removeExclusion(tag)}>×</span>
            </div>
          ))}
          <div className="fm-add-tag-wrapper">
            <input 
              type="text" 
              placeholder="Add exclusion..." 
              value={newExclusion}
              onChange={(e) => setNewExclusion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddExclusion()}
              className="fm-tag-input"
            />
            <button className="fm-add-tag-btn" onClick={handleAddExclusion}>+</button>
          </div>
        </div>
      </div>

      {/* 7. Performance Settings */}
      <div className="fm-section">
        <SectionHeader title="Monitoring Performance" subtitle="Balance system impact and scanning speed." />
        <div className="fm-perf-grid">
          <div className="fm-perf-card">
            <div className="fm-perf-header">
              <div className="fm-rule-label">Real-time Monitoring</div>
              <Toggle 
                checked={fmSettings.performance.realtimeMonitoring} 
                onChange={(val) => updateFmSettings({ 
                  performance: { ...fmSettings.performance, realtimeMonitoring: val } 
                })} 
              />
            </div>
            <p className="fm-rule-desc">Detect changes as they happen.</p>
          </div>
          <div className="fm-perf-card">
            <div className="fm-perf-header">
              <div className="fm-rule-label">Background Scanning</div>
              <Toggle 
                checked={fmSettings.performance.backgroundScanning} 
                onChange={(val) => updateFmSettings({ 
                  performance: { ...fmSettings.performance, backgroundScanning: val } 
                })} 
              />
            </div>
            <p className="fm-rule-desc">Scan even when app is minimized.</p>
          </div>
          <div className="fm-perf-card">
            <div className="fm-rule-label">Scan Interval</div>
            <select 
              className="fm-select" 
              value={fmSettings.performance.scanInterval}
              onChange={(e) => updateFmSettings({ 
                performance: { ...fmSettings.performance, scanInterval: e.target.value } 
              })}
            >
              <option value="5s">5 seconds</option>
              <option value="10s">10 seconds</option>
              <option value="30s">30 seconds</option>
              <option value="manual">Manual only</option>
            </select>
          </div>
          <div className="fm-perf-card">
            <div className="fm-perf-header">
              <div className="fm-rule-label">CPU Optimization</div>
              <Toggle 
                checked={fmSettings.performance.cpuOptimization} 
                onChange={(val) => updateFmSettings({ 
                  performance: { ...fmSettings.performance, cpuOptimization: val } 
                })} 
              />
            </div>
            <p className="fm-rule-desc">Prioritize system responsiveness.</p>
          </div>
        </div>
      </div>

      {/* 8. Activity Preview Timeline */}
      <div className="fm-section">
        <SectionHeader title="Recent Activity" subtitle="Latest actions performed by the monitoring engine." />
        <div className="fm-timeline">
          {recentActivity
            .slice((activityPage - 1) * activitiesPerPage, activityPage * activitiesPerPage)
            .map((act, idx) => (
            <div key={`${act.id}-${idx}`} className="fm-timeline-item">
              <div className={`fm-timeline-dot ${act.type}`}></div>
              <div className="fm-timeline-header">
                <span className="fm-timeline-title">{act.title}</span>
                <span className="fm-timeline-time">{formatActivityTime(act.time)}</span>
              </div>
              <p className="fm-timeline-desc">{act.desc}</p>
            </div>
          ))}
          {recentActivity.length === 0 && (
            <div className="fm-empty-state">
              <p>No recent activity.</p>
            </div>
          )}
        </div>

        {recentActivity.length > activitiesPerPage && (
          <div className="fm-pagination">
            <button 
              className="fm-btn outline sm" 
              onClick={() => setActivityPage(prev => Math.max(1, prev - 1))}
              disabled={activityPage === 1}
            >
              Previous
            </button>
            <span className="fm-page-info">
              Page {activityPage} of {Math.ceil(recentActivity.length / activitiesPerPage)}
            </span>
            <button 
              className="fm-btn outline sm" 
              onClick={() => setActivityPage(prev => Math.min(Math.ceil(recentActivity.length / activitiesPerPage), prev + 1))}
              disabled={activityPage === Math.ceil(recentActivity.length / activitiesPerPage)}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* 9. Recovery & Undo */}
      <div className="fm-section">
        <div className="fm-recovery-card">
          <div className="fm-recovery-info">
            <h4>Recovery & Undo</h4>
            <p className="fm-rule-desc">All automated actions can be reverted from Recovery Center.</p>
          </div>
          <div className="fm-recovery-actions">
            <button 
              className="fm-btn outline" 
              onClick={undoRemoval}
              disabled={recoveryHistory.length === 0}
            >
              Undo History ({recoveryHistory.length})
            </button>
            <button 
              className="fm-btn primary"
              onClick={() => setIsRecoveryModalOpen(true)}
            >
              Open Recovery Center
            </button>
          </div>
        </div>
      </div>

      {/* Recovery Center Modal */}
      {isRecoveryModalOpen && (
        <div className="fm-modal-overlay">
          <div className="fm-modal fm-modal-large">
            <div className="fm-modal-header">
              <h4>Recovery Center</h4>
              <button className="fm-close-btn" onClick={() => setIsRecoveryModalOpen(false)}>✕</button>
            </div>
            <p className="fm-section-subtitle fm-mb-4">Restore previously removed monitored folders.</p>
            
            <div className="fm-recovery-list">
              {recoveryHistory.map((folder) => (
                <div key={folder.id} className="fm-recovery-item">
                  <div className="fm-folder-info">
                    <div className="fm-folder-name">{folder.name}</div>
                    <div className="fm-folder-path">{folder.path}</div>
                  </div>
                  <button 
                    className="fm-btn outline sm"
                    onClick={() => restoreFolder(folder.id)}
                  >
                    Restore
                  </button>
                </div>
              ))}
              {recoveryHistory.length === 0 && (
                <div className="fm-empty-state">
                  <p>No folders in recovery history.</p>
                </div>
              )}
            </div>
            
            <div className="fm-form-actions">
              <button className="fm-btn primary" onClick={() => setIsRecoveryModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* 10. Folder Monitoring Safety */}
      <div className="fm-section">
        <div className="fm-safety-card">
          <SectionHeader title="Monitoring Safety" />
          <div className="fm-safety-list">
            <div className="fm-safety-item">
              <span className="fm-safety-icon">🛡️</span>
              <span>Protected OS folders excluded</span>
            </div>
            <div className="fm-safety-item">
              <span className="fm-safety-icon">🚫</span>
              <span>C: drive restrictions active</span>
            </div>
            <div className="fm-safety-item">
              <span className="fm-safety-icon">👁️</span>
              <span>Hidden/system file protection</span>
            </div>
            <div className="fm-safety-item">
              <span className="fm-safety-icon">🤝</span>
              <span>User confirmation for risky actions</span>
            </div>
          </div>
          <div className="fm-warning-box fm-safety-footer">
            This application does not modify critical operating system directories.
          </div>
        </div>
      </div>

    </div>
  );
}

export default function FolderMonitoringPage() {
  return (
    <Navbar currentPage="Folder Monitoring">
      <div className="settings-container fm-p-5">
        <FolderMonitoringContent />
      </div>
    </Navbar>
  );
}
