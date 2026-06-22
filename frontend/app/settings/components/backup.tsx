import React from 'react';
import { SettingsProps } from '../types';
import { 
  FiShield, FiClock, FiDatabase, FiRefreshCw, 
  FiRotateCcw, FiHardDrive, FiCheckCircle, FiAlertCircle,
  FiTrash2, FiActivity, FiFolder, FiCpu, FiExternalLink,
  FiPlus, FiMinus, FiSettings, FiSave, FiEye
} from 'react-icons/fi';
import { MdHistory, MdBackup, MdRestore, MdSecurity } from 'react-icons/md';
import { HiOutlineLightBulb } from 'react-icons/hi';
import './backup.css';

export default function BackupSettings({ settings, saveSettings, loading }: SettingsProps) {
  // Dummy data for metrics
  const metrics = [
    { label: 'Recovery Snapshots', value: '124', icon: <FiCamera />, color: 'var(--brand-primary)' },
    { label: 'Undo History Size', value: '1.2 GB', icon: <FiRotateCcw />, color: 'var(--brand-purple)' },
    { label: 'Protected Files', value: '45,201', icon: <FiShield />, color: 'var(--brand-secondary)' },
    { label: 'Last Backup', value: '2 mins ago', icon: <FiClock />, color: 'var(--brand-success)' },
    { label: 'Recoverable Actions', value: '850', icon: <FiActivity />, color: 'var(--brand-accent)' },
    { label: 'Storage Usage', value: '85%', icon: <FiHardDrive />, color: 'var(--brand-danger)', progress: 85 },
  ];

  // Dummy data for recoverable items
  const recoverableItems = [
    { id: 1, name: 'Project_Report.pdf', type: 'PDF', location: '/Documents/Work', timestamp: '2024-05-12 14:30', badge: 'Restored' },
    { id: 2, name: 'Vacation_Photos', type: 'Folder', location: '/Pictures', timestamp: '2024-05-12 11:15', badge: 'Recovered' },
    { id: 3, name: 'Duplicates_Cleanup', type: 'Action', location: '/Downloads', timestamp: '2024-05-11 09:45', badge: 'Reverted' },
  ];

  // Dummy data for backup locations
  const locations = [
    { id: 1, name: 'Local Recovery Storage', path: 'C:/Users/AppData/Local/Recovery', usage: '45.2 GB', status: 'Healthy' },
    { id: 2, name: 'External SSD Backup', path: 'E:/SmartBackups', usage: '128.5 GB', status: 'Active' },
    { id: 3, name: 'Archive Folder', path: 'D:/Archives/2024', usage: '12.8 GB', status: 'Standby' },
  ];

  // Dummy data for recommendations
  const recommendations = [
    { id: 1, text: 'Recovery history can be optimized', severity: 'medium', icon: <FiCpu /> },
    { id: 2, text: 'Old backups consume high storage', severity: 'low', icon: <FiDatabase /> },
    { id: 3, text: 'Enable automatic snapshots for safer automation', severity: 'high', icon: <FiShield /> },
  ];

  // Dummy data for activity timeline
  const activities = [
    { id: 1, event: 'Snapshot created', time: '10:15 AM', status: 'success' },
    { id: 2, event: 'File restored: document.pdf', time: '09:45 AM', status: 'info' },
    { id: 3, event: 'Undo completed: delete action', time: 'Yesterday', status: 'success' },
    { id: 4, event: 'Backup optimized', time: 'Yesterday', status: 'warning' },
    { id: 5, event: 'Recovery cleaned', time: '2 days ago', status: 'info' },
  ];

  return (
    <div className="backup-container">
      {/* 1. Backup Overview Header */}
      <header className="backup-header glass-card">
        <div className="header-content">
          <div className="title-area">
            <h1>Backup & Recovery Center</h1>
            <p>Manage recovery history, restore preferences, backup safety, and undo operations.</p>
          </div>
          <div className="header-badges">
            <div className="status-badge healthy">
              <FiCheckCircle />
              <span>System Healthy</span>
            </div>
            <div className="health-score">
              <span className="score-value">98</span>
              <span className="score-label">Health Score</span>
            </div>
            <div className="recovery-badge">
              <FiShield />
              <span>Local Recovery Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Recovery System Overview Cards */}
      <section className="overview-section">
        <div className="grid-container">
          {metrics.map((metric, index) => (
            <div key={index} className="metric-card glass-card">
              <div className="metric-icon" style={{ backgroundColor: metric.color + '15', color: metric.color }}>
                {metric.icon}
              </div>
              <div className="metric-info">
                <span className="metric-label">{metric.label}</span>
                <span className="metric-value">{metric.value}</span>
              </div>
              {metric.progress !== undefined && (
                <div className="metric-progress-container">
                  <div className="metric-progress-bar" style={{ width: `${metric.progress}%`, backgroundColor: metric.color }}></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 3. Automatic Backup Preferences Section */}
      <section className="settings-section glass-card">
        <div className="section-header">
          <MdBackup className="section-icon" />
          <h3>Automatic Backup Preferences</h3>
        </div>
        <div className="settings-grid">
          <div className="setting-item">
            <div className="setting-info">
              <label>Enable automatic recovery snapshots</label>
              <p>Creates a snapshot of your files before any changes</p>
            </div>
            <div className="toggle-switch">
              <input type="checkbox" id="auto-snapshots" defaultChecked />
              <label htmlFor="auto-snapshots"></label>
            </div>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <label>Backup before organization</label>
              <p>Protect files before smart organization tasks</p>
            </div>
            <div className="toggle-switch">
              <input type="checkbox" id="backup-org" defaultChecked />
              <label htmlFor="backup-org"></label>
            </div>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <label>Snapshot frequency</label>
              <select className="custom-select">
                <option>Real-time</option>
                <option>Every 10 minutes</option>
                <option>Hourly</option>
                <option>Daily</option>
              </select>
            </div>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <label>Retention duration</label>
              <select className="custom-select">
                <option>7 days</option>
                <option>30 days</option>
                <option>90 days</option>
              </select>
            </div>
          </div>
        </div>
        <div className="info-card">
          <FiAlertCircle />
          <p>Recovery snapshots remain stored locally unless cloud sync is enabled.</p>
        </div>
      </section>

      {/* 4. Undo & Recovery Preferences Section */}
      <section className="settings-section glass-card">
        <div className="section-header">
          <FiRotateCcw className="section-icon" />
          <h3>Undo & Recovery Preferences</h3>
        </div>
        <div className="settings-grid">
          <div className="setting-item">
            <div className="setting-info">
              <label>Enable undo history</label>
              <p>Allow reversing file actions within the application</p>
            </div>
            <div className="toggle-switch">
              <input type="checkbox" id="enable-undo" defaultChecked />
              <label htmlFor="enable-undo"></label>
            </div>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <label>Undo history size</label>
              <select className="custom-select">
                <option>50 actions</option>
                <option>100 actions</option>
                <option>Unlimited</option>
              </select>
            </div>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <label>Smart recovery suggestions</label>
              <p>AI-driven recommendations for file recovery</p>
            </div>
            <div className="toggle-switch">
              <input type="checkbox" id="smart-recovery" defaultChecked />
              <label htmlFor="smart-recovery"></label>
            </div>
          </div>
        </div>
        <div className="usage-display">
          <span className="usage-label">Estimated recovery storage usage:</span>
          <span className="usage-value">1.24 GB / 5.0 GB</span>
        </div>
      </section>

      {/* 5. Backup Storage Management Section */}
      <section className="settings-section glass-card">
        <div className="section-header">
          <FiDatabase className="section-icon" />
          <h3>Backup Storage Management</h3>
        </div>
        <div className="storage-cards">
          <div className="storage-card">
            <span>Backup cache usage</span>
            <strong>450 MB</strong>
          </div>
          <div className="storage-card">
            <span>Recovery snapshots size</span>
            <strong>850 MB</strong>
          </div>
          <div className="storage-card">
            <span>Temporary restore data</span>
            <strong>120 MB</strong>
          </div>
          <div className="storage-card">
            <span>Indexed recovery history</span>
            <strong>2.4 GB</strong>
          </div>
        </div>
        <div className="action-buttons">
          <button className="btn-secondary"><FiTrash2 /> Clear backup cache</button>
          <button className="btn-secondary"><FiCpu /> Optimize storage</button>
          <button className="btn-primary"><FiRefreshCw /> Rebuild recovery index</button>
        </div>
        <div className="warning-note">
          <FiAlertCircle />
          <p>Removing recovery data may disable undo for previous actions.</p>
        </div>
      </section>

      {/* 6. Restore Center Preview Section */}
      <section className="preview-section glass-card">
        <div className="section-header">
          <MdRestore className="section-icon" />
          <h3>Restore Center Preview</h3>
        </div>
        <div className="recoverable-list">
          {recoverableItems.map(item => (
            <div key={item.id} className="recoverable-item">
              <div className="item-info">
                <span className="item-name">{item.name}</span>
                <span className="item-details">{item.location}</span>
              </div>
              <div className="item-meta">
                <span className="item-timestamp">{item.timestamp}</span>
                <span className={`item-badge ${item.badge.toLowerCase()}`}>{item.badge}</span>
              </div>
              <div className="item-actions">
                <button className="icon-btn" title="Preview"><FiEye /></button>
                <button className="btn-restore">Restore</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Backup Safety Controls Section */}
      <section className="settings-section glass-card">
        <div className="section-header">
          <MdSecurity className="section-icon" />
          <h3>Backup Safety Controls</h3>
        </div>
        <div className="safety-grid">
          <div className="setting-item">
            <div className="setting-info">
              <label>Protect system folders</label>
              <p>Prevent any backup actions on OS directories</p>
            </div>
            <div className="toggle-switch">
              <input type="checkbox" id="protect-sys" defaultChecked disabled />
              <label htmlFor="protect-sys"></label>
            </div>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <label>Exclude hidden files</label>
              <p>Do not include hidden or system files in snapshots</p>
            </div>
            <div className="toggle-switch">
              <input type="checkbox" id="exclude-hidden" defaultChecked />
              <label htmlFor="exclude-hidden"></label>
            </div>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <label>Require confirmation before restore</label>
            </div>
            <div className="toggle-switch">
              <input type="checkbox" id="confirm-restore" defaultChecked />
              <label htmlFor="confirm-restore"></label>
            </div>
          </div>
        </div>
        <div className="warning-card safety">
          <FiShield />
          <p>The application never modifies protected operating system directories.</p>
        </div>
      </section>

      {/* 8. Backup Locations Section */}
      <section className="locations-section">
        <div className="section-header">
          <FiFolder className="section-icon" />
          <h3>Backup Locations</h3>
        </div>
        <div className="locations-grid">
          {locations.map(loc => (
            <div key={loc.id} className="location-card glass-card">
              <div className="location-info">
                <h4>{loc.name}</h4>
                <code>{loc.path}</code>
              </div>
              <div className="location-meta">
                <span className="location-usage">{loc.usage}</span>
                <span className={`location-status ${loc.status.toLowerCase()}`}>{loc.status}</span>
              </div>
              <div className="location-actions">
                <button className="icon-btn danger"><FiMinus /></button>
              </div>
            </div>
          ))}
          <button className="add-location-card glass-card">
            <FiPlus />
            <span>Add Backup Location</span>
          </button>
        </div>
      </section>

      {/* 9. Smart Recovery Recommendations Section */}
      <section className="recommendations-section glass-card">
        <div className="section-header">
          <HiOutlineLightBulb className="section-icon" />
          <h3>Smart Recovery Recommendations</h3>
        </div>
        <div className="recommendations-grid">
          {recommendations.map(rec => (
            <div key={rec.id} className="recommendation-card">
              <div className={`rec-icon ${rec.severity}`}>
                {rec.icon}
              </div>
              <div className="rec-content">
                <p>{rec.text}</p>
                <button className="btn-text">Apply Fix</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. Backup Activity Timeline Section */}
      <section className="timeline-section glass-card">
        <div className="section-header">
          <FiActivity className="section-icon" />
          <h3>Backup Activity Timeline</h3>
        </div>
        <div className="timeline-list">
          {activities.map(act => (
            <div key={act.id} className="timeline-item">
              <div className={`timeline-dot ${act.status}`}></div>
              <div className="timeline-content">
                <span className="event-name">{act.event}</span>
                <span className="event-time">{act.time}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 11. Disaster Recovery Preview Section */}
      <section className="disaster-recovery glass-card">
        <div className="section-header">
          <FiAlertCircle className="section-icon" />
          <h3>Disaster Recovery Preview</h3>
        </div>
        <div className="disaster-grid">
          <div className="disaster-metric">
            <span className="label">Recovery Readiness Score</span>
            <div className="progress-circle">
              <svg viewBox="0 0 36 36" className="circular-chart">
                <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="circle" strokeDasharray="92, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <text x="18" y="20.35" className="percentage">92%</text>
              </svg>
            </div>
          </div>
          <div className="disaster-stats">
            <div className="d-stat">
              <span>Total Recoverable Actions</span>
              <strong>12,450</strong>
            </div>
            <div className="d-stat">
              <span>Protected Folders Count</span>
              <strong>42</strong>
            </div>
            <div className="d-stat">
              <span>Last Successful Snapshot</span>
              <strong>Today, 10:15 AM</strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Helper component for icon
function FiCamera(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      height="1em"
      width="1em"
      {...props}
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
      <circle cx="12" cy="13" r="4"></circle>
    </svg>
  );
}
