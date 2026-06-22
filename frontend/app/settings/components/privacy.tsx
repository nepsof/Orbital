import { useState } from 'react';
import { SettingsProps } from '../types';
import { 
  FiShield, 
  FiSearch, 
  FiFolder, 
  FiBarChart2, 
  FiActivity, 
  FiZap, 
  FiRotateCcw, 
  FiLock, 
  FiHardDrive, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiEye,
  FiDatabase,
  FiTrash2,
  FiDownload,
  FiInfo
} from 'react-icons/fi';
import { HiOutlineFingerPrint } from 'react-icons/hi2';
import './privacy.css';

interface ToggleRowProps {
  label: string;
  desc: string;
  checked: boolean;
  onChange: () => void;
}

const ToggleRow = ({ label, desc, checked, onChange }: ToggleRowProps) => (
  <div className="toggle-row">
    <div className="toggle-info">
      <span className="toggle-label">{label}</span>
      <span className="toggle-desc">{desc}</span>
    </div>
    <label className="switch">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="slider"></span>
    </label>
  </div>
);

export default function PrivacySettings({ settings, saveSettings }: SettingsProps) {
  // Local state for dummy toggles not in global settings
  const [localToggles, setLocalToggles] = useState({
    saveSearchHistory: true,
    smartSuggestions: true,
    recentTracking: true,
    searchAnalytics: false,
    appLaunchHistory: true,
    webFallback: false,
    monitoredIndexing: true,
    ignoreHidden: settings.folderMonitoring.excludeHidden,
    ignoreSystem: true,
    restrictApproved: true,
    localAnalytics: true,
    usageStats: true,
    smartRecs: true,
    perfDiagnostics: true,
    saveActivityLogs: true,
    saveRecoveryHistory: true,
    saveOrgHistory: true,
    saveNotifHistory: true,
    localOnlySearch: true,
    disableWebSuggest: true,
    disablePredictive: false,
    excludeSensitive: true,
    saveUndoHistory: true,
    recoverySnapshots: true,
    backupBeforeOrg: true,
    autoLogout: false,
    sessionProtection: true,
    secureStorage: true,
    requirePassword: true,
    privacyMode: false
  });

  const handleToggle = (key: keyof typeof localToggles) => {
    setLocalToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="privacy-container">
      {/* 1. Privacy Overview Header */}
      <header className="privacy-header">
        <div className="header-content">
          <h1>Privacy & Data Control</h1>
          <p>Control local data usage, indexing behavior, search privacy, and monitoring permissions.</p>
        </div>
        <div className="header-badges">
          <div className="badge badge-status">
            <FiCheckCircle /> Protected
          </div>
          <div className="badge badge-score">
            Privacy Score: 98/100
          </div>
          <div className="badge badge-local">
            <FiDatabase /> Local-First
          </div>
        </div>
      </header>

      {/* 11. Privacy Mode Preview Section (Moved up for better visibility) */}
      <section className="health-panel">
        <div className="health-info">
          <h2>Privacy Health Score</h2>
          <p>Your data is currently stored locally and encrypted.</p>
          <div className="preview-list health-previews">
            <div className="preview-item">
              <span className="preview-item-label"><FiShield /> Current Privacy Mode</span>
              <span style={{ color: 'var(--brand-success)' }}>Maximum Protection</span>
            </div>
            <div className="preview-item">
              <span className="preview-item-label"><FiFolder /> Protected Directories</span>
              <span>12 Folders Excluded</span>
            </div>
            <div className="preview-item">
              <span className="preview-item-label"><FiDatabase /> Local-only Indexing</span>
              <span style={{ color: 'var(--brand-success)' }}>Active</span>
            </div>
          </div>
        </div>
        <div className="health-score-container">
          <div className="score-circle">98</div>
          <span className="stat-label">Excellent Health</span>
        </div>
      </section>

      <div className="settings-grid">
        {/* 2. Search Privacy Settings */}
        <div className="settings-card">
          <div className="card-header">
            <div className="card-icon"><FiSearch /></div>
            <h3>Search Privacy</h3>
          </div>
          <ToggleRow 
            label="Save search history" 
            desc="Keep a local log of your recent searches"
            checked={localToggles.saveSearchHistory}
            onChange={() => handleToggle('saveSearchHistory')}
          />
          <ToggleRow 
            label="Smart search suggestions" 
            desc="Predictive suggestions based on local index"
            checked={localToggles.smartSuggestions}
            onChange={() => handleToggle('smartSuggestions')}
          />
          <ToggleRow 
            label="Recent search tracking" 
            desc="Display recent searches in spotlight"
            checked={localToggles.recentTracking}
            onChange={() => handleToggle('recentTracking')}
          />
          <div className="retention-control">
            <span>Search history retention</span>
            <select className="retention-select" defaultValue="30 days">
              <option value="7 days">7 days</option>
              <option value="30 days">30 days</option>
              <option value="90 days">90 days</option>
              <option value="Never save">Never save</option>
            </select>
          </div>
          <div className="info-box blue">
            <FiInfo />
            <span>Search indexing and history remain stored locally on your device.</span>
          </div>
        </div>

        {/* 3. Folder Monitoring Permissions */}
        <div className="settings-card">
          <div className="card-header">
            <div className="card-icon"><FiFolder /></div>
            <h3>Folder Monitoring</h3>
          </div>
          <ToggleRow 
            label="Allow folder indexing" 
            desc="Automatically index contents of monitored folders"
            checked={localToggles.monitoredIndexing}
            onChange={() => handleToggle('monitoredIndexing')}
          />
          <ToggleRow 
            label="Ignore hidden files" 
            desc="Do not index or monitor hidden system files"
            checked={localToggles.ignoreHidden}
            onChange={() => handleToggle('ignoreHidden')}
          />
          <ToggleRow 
            label="Exclude protected directories" 
            desc="Always skip system and sensitive folders"
            checked={localToggles.excludeSensitive}
            onChange={() => handleToggle('excludeSensitive')}
          />
          <div className="preview-list">
            <span className="stat-label">Monitored Access</span>
            <div className="preview-item">
              <span className="preview-item-label"><div className="status-indicator status-active" /> Downloads</span>
              <span>Active</span>
            </div>
            <div className="preview-item">
              <span className="preview-item-label"><div className="status-indicator status-active" /> Desktop</span>
              <span>Active</span>
            </div>
            <div className="preview-item">
              <span className="preview-item-label"><div className="status-indicator status-inactive" /> D:/Projects</span>
              <span>Paused</span>
            </div>
          </div>
        </div>

        {/* 4. Analytics & Usage Data */}
        <div className="settings-card">
          <div className="card-header">
            <div className="card-icon"><FiBarChart2 /></div>
            <h3>Analytics & Usage</h3>
          </div>
          <ToggleRow 
            label="Local analytics generation" 
            desc="Generate usage insights for dashboard"
            checked={localToggles.localAnalytics}
            onChange={() => handleToggle('localAnalytics')}
          />
          <ToggleRow 
            label="Usage statistics" 
            desc="Track app performance and feature usage"
            checked={localToggles.usageStats}
            onChange={() => handleToggle('usageStats')}
          />
          <ToggleRow 
            label="Error reporting" 
            desc="Send anonymous crash reports"
            checked={settings.privacy.crashReports}
            onChange={() => saveSettings({ privacy: { ...settings.privacy, crashReports: !settings.privacy.crashReports } })}
          />
          <div className="info-box amber">
            <FiAlertCircle />
            <span>No personal files are uploaded without explicit user permission.</span>
          </div>
        </div>

        {/* 5. Activity Logs & History */}
        <div className="settings-card">
          <div className="card-header">
            <div className="card-icon"><FiActivity /></div>
            <h3>Activity & Logs</h3>
          </div>
          <ToggleRow 
            label="Save activity logs" 
            desc="Keep a record of all file operations"
            checked={localToggles.saveActivityLogs}
            onChange={() => handleToggle('saveActivityLogs')}
          />
          <ToggleRow 
            label="Save recovery history" 
            desc="Track file moves and renames for undo"
            checked={localToggles.saveRecoveryHistory}
            onChange={() => handleToggle('saveRecoveryHistory')}
          />
          <div className="retention-control">
            <span>Log retention duration</span>
            <select className="retention-select" defaultValue="90 days">
              <option value="7 days">7 days</option>
              <option value="30 days">30 days</option>
              <option value="90 days">90 days</option>
              <option value="Unlimited">Unlimited</option>
            </select>
          </div>
          <div className="button-group">
            <button className="btn btn-secondary"><FiDownload /> Export Data</button>
            <button className="btn btn-danger"><FiTrash2 /> Clear Logs</button>
          </div>
        </div>

        {/* 6. Spotlight Search Privacy */}
        <div className="settings-card">
          <div className="card-header">
            <div className="card-icon"><FiZap /></div>
            <h3>Spotlight Privacy</h3>
          </div>
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-value">12.4k</span>
              <span className="stat-label">Files Indexed</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">48</span>
              <span className="stat-label">Apps Indexed</span>
            </div>
          </div>
          <ToggleRow 
            label="Local-only search" 
            desc="Never query web fallback for search"
            checked={localToggles.localOnlySearch}
            onChange={() => handleToggle('localOnlySearch')}
          />
          <ToggleRow 
            label="Disable predictive search" 
            desc="Turn off predictive index lookup"
            checked={localToggles.disablePredictive}
            onChange={() => handleToggle('disablePredictive')}
          />
          <div className="info-box amber">
            <FiAlertCircle />
            <span>Protected OS folders are excluded for safety and privacy.</span>
          </div>
        </div>

        {/* 7. Recovery & Backup Privacy */}
        <div className="settings-card">
          <div className="card-header">
            <div className="card-icon"><FiRotateCcw /></div>
            <h3>Recovery & Backup</h3>
          </div>
          <ToggleRow 
            label="Save undo history" 
            desc="Allow undoing recent organizations"
            checked={localToggles.saveUndoHistory}
            onChange={() => handleToggle('saveUndoHistory')}
          />
          <ToggleRow 
            label="Create recovery snapshots" 
            desc="Snapshot folders before massive changes"
            checked={localToggles.recoverySnapshots}
            onChange={() => handleToggle('recoverySnapshots')}
          />
          <div className="retention-control">
            <span>Recovery retention</span>
            <select className="retention-select" defaultValue="30 days">
              <option value="7 days">7 days</option>
              <option value="30 days">30 days</option>
              <option value="90 days">90 days</option>
            </select>
          </div>
          <div className="button-group">
            <button className="btn btn-danger"><FiTrash2 /> Reset Recovery</button>
          </div>
        </div>

        {/* 8. Security Preferences */}
        <div className="settings-card">
          <div className="card-header">
            <div className="card-icon"><FiLock /></div>
            <h3>Security Preferences</h3>
          </div>
          <ToggleRow 
            label="Auto logout" 
            desc="Logout after 30 minutes of inactivity"
            checked={localToggles.autoLogout}
            onChange={() => handleToggle('autoLogout')}
          />
          <ToggleRow 
            label="Secure local storage" 
            desc="Encrypt settings and index files"
            checked={localToggles.secureStorage}
            onChange={() => handleToggle('secureStorage')}
          />
          <ToggleRow 
            label="Privacy Mode" 
            desc="Blur sensitive file names in UI"
            checked={localToggles.privacyMode}
            onChange={() => handleToggle('privacyMode')}
          />
          <div className="preview-item">
            <span className="preview-item-label"><HiOutlineFingerPrint /> Session Status</span>
            <span style={{ color: 'var(--brand-success)' }}>Secure</span>
          </div>
        </div>

        {/* 9. Data Storage Overview */}
        <div className="settings-card">
          <div className="card-header">
            <div className="card-icon"><FiHardDrive /></div>
            <h3>Data Storage</h3>
          </div>
          <div className="preview-list">
            <div className="preview-item">
              <span className="preview-item-label">Search Index</span>
              <span>124 MB</span>
            </div>
            <div className="preview-item">
              <span className="preview-item-label">Analytics Cache</span>
              <span>42 MB</span>
            </div>
            <div className="preview-item">
              <span className="preview-item-label">Activity Logs</span>
              <span>12 MB</span>
            </div>
          </div>
          <div className="button-group">
            <button className="btn btn-secondary">Optimize</button>
            <button className="btn btn-secondary">Rebuild Index</button>
            <button className="btn btn-danger">Clear Cache</button>
          </div>
        </div>

        {/* 10. Privacy Recommendations Panel */}
        <div className="settings-card">
          <div className="card-header">
            <div className="card-icon" style={{ background: 'var(--brand-accent-muted)', color: 'var(--brand-accent)' }}><FiZap /></div>
            <h3>Recommendations</h3>
          </div>
          <div className="preview-list">
            <div className="rec-card">
              <div className="rec-icon" style={{ background: 'var(--brand-primary-light)', color: 'var(--brand-primary)' }}><FiEye /></div>
              <div className="rec-content">
                <div className="rec-title">Disable search history</div>
                <div className="rec-action">Apply Fix</div>
              </div>
            </div>
            <div className="rec-card">
              <div className="rec-icon" style={{ background: 'var(--brand-success-muted)', color: 'var(--brand-success)' }}><FiShield /></div>
              <div className="rec-content">
                <div className="rec-title">Folders safely excluded</div>
                <div className="rec-action" style={{ color: 'var(--text-tertiary)', cursor: 'default' }}>Verified</div>
              </div>
            </div>
            <div className="rec-card">
              <div className="rec-icon" style={{ background: 'var(--brand-danger-muted)', color: 'var(--brand-danger)' }}><FiTrash2 /></div>
              <div className="rec-content">
                <div className="rec-title">Clear old activity logs</div>
                <div className="rec-action">Run Cleanup</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
