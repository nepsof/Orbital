import React from 'react';
import { SettingsProps } from '../types';
import { 
  FiCpu, 
  FiZap, 
  FiSearch, 
  FiFolder, 
  FiDatabase, 
  FiActivity, 
  FiBattery, 
  FiSettings, 
  FiInfo, 
  FiAlertTriangle,
  FiRefreshCw,
  FiTrash2,
  FiBox
} from 'react-icons/fi';
import './performance.css';

export default function PerformanceSettings({ settings, saveSettings, loading }: SettingsProps) {
  // Dummy Data for metrics
  const resourceMetrics = [
    { label: 'CPU Usage', value: '12%', icon: <FiCpu />, trend: 'down', color: 'primary' },
    { label: 'Memory Usage', value: '842 MB', icon: <FiActivity />, trend: 'stable', color: 'purple' },
    { label: 'Indexed Files', value: '45,201', icon: <FiSearch />, trend: 'up', color: 'secondary' },
    { label: 'Background Tasks', value: '3 Active', icon: <FiZap />, trend: 'stable', color: 'accent' },
    { label: 'Monitoring Load', value: 'Low', icon: <FiFolder />, trend: 'down', color: 'success' },
    { label: 'Cache Usage', value: '1.2 GB', icon: <FiDatabase />, trend: 'up', color: 'pink' },
  ];

  const recommendations = [
    { 
      id: 1, 
      title: 'Background indexing can improve search speed', 
      severity: 'info', 
      icon: <FiInfo />,
      action: 'Enable'
    },
    { 
      id: 2, 
      title: 'Cache cleanup may recover 1.2 GB storage', 
      severity: 'success', 
      icon: <FiTrash2 />,
      action: 'Clean Now'
    },
    { 
      id: 3, 
      title: 'Battery saver mode recommended for current power', 
      severity: 'warning', 
      icon: <FiBattery />,
      action: 'Optimize'
    }
  ];

  const handleModeChange = (mode: 'balanced' | 'high' | 'battery') => {
    saveSettings({ performanceMode: mode });
  };

  return (
    <div className="performance-container">
      {/* 1. Performance Overview Header */}
      <header className="performance-header">
        <div className="header-info">
          <h1>Performance & System Optimization</h1>
          <p>Manage indexing behavior, monitoring performance, background activity, and system optimization preferences.</p>
        </div>
        
        <div className="header-controls">
          
          <div className="segmented-selector">
            <button 
              className={settings.performanceMode === 'balanced' ? 'active' : ''} 
              onClick={() => handleModeChange('balanced')}
              disabled={loading}
            >
              Balanced
            </button>
            <button 
              className={settings.performanceMode === 'high' ? 'active' : ''} 
              onClick={() => handleModeChange('high')}
              disabled={loading}
            >
              High Performance
            </button>
            <button 
              className={settings.performanceMode === 'battery' ? 'active' : ''} 
              onClick={() => handleModeChange('battery')}
              disabled={loading}
            >
              Battery Saver
            </button>
          </div>
        </div>
      </header>

      <div className="performance-grid">
        {/* 2. System Resource Overview Cards */}
        <section className="metrics-section">
          <div className="section-grid">
            {resourceMetrics.map((metric, idx) => (
              <div key={idx} className={`metric-card glass-card color-${metric.color}`}>
                <div className="metric-icon">{metric.icon}</div>
                <div className="metric-content">
                  <span className="metric-label">{metric.label}</span>
                  <div className="metric-value-row">
                    <span className="metric-value">{metric.value}</span>
                    <span className={`trend-indicator trend-${metric.trend}`}>
                      {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}
                    </span>
                  </div>
                </div>
                <div className="metric-progress-bg">
                  <div className="metric-progress-fill" style={{ width: metric.value.includes('%') ? metric.value : '45%' }}></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Left Column: Settings Groups */}
        <div className="settings-main-column">
          {/* 3. Search Indexing Performance */}
          <section className="settings-card glass-card">
            <div className="card-header">
              <FiSearch className="section-icon" />
              <h3>Search Indexing Performance</h3>
            </div>
            <div className="card-content">
              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-title">Enable Search Indexing</span>
                  <p>Keep your file database up to date for instant searching.</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={settings.performance.enableCaching} onChange={() => {}} />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-title">Background Indexing</span>
                  <p>Process file changes while the app is in the background.</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="setting-row horizontal">
                <div className="input-group">
                  <label>Indexing Speed</label>
                  <select className="custom-select" defaultValue="Balanced">
                    <option value="Low">Low</option>
                    <option value="Balanced">Balanced</option>
                    <option value="Fast">Fast</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Max Results</label>
                  <select className="custom-select" defaultValue="5,000">
                    <option value="1,000">1,000</option>
                    <option value="5,000">5,000</option>
                    <option value="10,000">10,000</option>
                  </select>
                </div>
              </div>

              <div className="info-box">
                <FiInfo />
                <span>Indexing remains local and prioritizes user-selected monitored folders.</span>
              </div>
            </div>
          </section>

          {/* 4. Folder Monitoring Performance */}
          <section className="settings-card glass-card">
            <div className="card-header">
              <FiFolder className="section-icon" />
              <h3>Folder Monitoring Performance</h3>
            </div>
            <div className="card-content">
              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-title">Real-time Monitoring</span>
                  <p>Detect file changes as they happen.</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={settings.folderMonitoring.enabled} onChange={() => {}} />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="setting-row horizontal">
                <div className="input-group">
                  <label>Scan Interval</label>
                  <select className="custom-select" value={settings.folderMonitoring.scanInterval} onChange={() => {}}>
                    <option value="5s">5 seconds</option>
                    <option value="10s">10 seconds</option>
                    <option value="30s">30 seconds</option>
                    <option value="manual">Manual only</option>
                  </select>
                </div>
                <div className="resource-preview">
                  <span className="preview-label">Est. Resource Usage</span>
                  <div className="usage-indicator low">Low</div>
                </div>
              </div>
            </div>
          </section>

          {/* 5. File Organization Performance */}
          <section className="settings-card glass-card">
            <div className="card-header">
              <FiBox className="section-icon" />
              <h3>File Organization Performance</h3>
            </div>
            <div className="card-content">
              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-title">Batch File Processing</span>
                  <p>Organize multiple files in a single operation to save resources.</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="setting-row horizontal">
                <div className="input-group">
                  <label>Processing Speed</label>
                  <select className="custom-select" defaultValue="Balanced">
                    <option value="Low Resource">Low Resource</option>
                    <option value="Balanced">Balanced</option>
                    <option value="Maximum Speed">Maximum Speed</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Priority</label>
                  <select className="custom-select" defaultValue="Normal">
                    <option value="Background">Background</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Insights and Advanced */}
        <div className="settings-side-column">
          {/* 11. Live Performance Preview */}
          <section className="preview-panel glass-card">
            <div className="card-header">
              <FiActivity className="section-icon" />
              <h3>Live Status</h3>
            </div>
            <div className="preview-content">
              <div className="health-score-container">
                <div className="health-score-circle">
                  <svg viewBox="0 0 36 36" className="circular-chart">
                    <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="circle" strokeDasharray="92, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="score-text">
                    <span className="score-number">92</span>
                    <span className="score-label">Health</span>
                  </div>
                </div>
              </div>
              <div className="status-list">
                <div className="status-item">
                  <span>Indexing Activity</span>
                  <span className="status-value active">Idle</span>
                </div>
                <div className="status-item">
                  <span>Monitoring</span>
                  <span className="status-value active">Active</span>
                </div>
                <div className="status-item">
                  <span>Mode</span>
                  <span className="status-value">{settings.performanceMode}</span>
                </div>
              </div>
            </div>
          </section>

          {/* 10. Performance Insights */}
          <section className="insights-section">
            <h3>Recommendations</h3>
            <div className="insights-list">
              {recommendations.map(rec => (
                <div key={rec.id} className={`insight-card severity-${rec.severity}`}>
                  <div className="insight-icon">{rec.icon}</div>
                  <div className="insight-body">
                    <p>{rec.title}</p>
                    <button className="insight-action">{rec.action}</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 6. Cache & Temporary Data */}
          <section className="settings-card glass-card">
            <div className="card-header">
              <FiDatabase className="section-icon" />
              <h3>Cache & Storage</h3>
            </div>
            <div className="card-content">
              <div className="cache-stats">
                <div className="cache-stat">
                  <span>Search Cache</span>
                  <strong>420 MB</strong>
                </div>
                <div className="cache-stat">
                  <span>Logs Storage</span>
                  <strong>12 MB</strong>
                </div>
              </div>
              <div className="action-buttons">
                <button className="secondary-btn small">
                  <FiRefreshCw /> Rebuild Index
                </button>
                <button className="danger-btn-subtle small">
                  <FiTrash2 /> Clear Cache
                </button>
              </div>
              <div className="warning-box">
                <FiAlertTriangle />
                <span>Clearing cache may temporarily reduce search performance.</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Bottom Full Width Sections */}
      <div className="performance-footer-grid">
        {/* 7. Startup & Background */}
        <section className="settings-card glass-card">
          <div className="card-header">
            <FiZap className="section-icon" />
            <h3>Startup & Background</h3>
          </div>
          <div className="card-content grid-2-col">
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-title">Launch on Startup</span>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.launchOnStartup} onChange={() => {}} />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-title">Minimize to Tray</span>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.minimizeToTray} onChange={() => {}} />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-title">Background Optimization</span>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>
            <div className="impact-indicator">
              <span>Startup Impact:</span>
              <span className="impact-tag low">Low</span>
            </div>
          </div>
        </section>

        {/* 8. Battery & Power */}
        <section className="settings-card glass-card">
          <div className="card-header">
            <FiBattery className="section-icon" />
            <h3>Power Optimization</h3>
          </div>
          <div className="card-content">
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-title">Battery Saver Mode</span>
                <p>Reduce resource usage when on battery power.</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={settings.performanceMode === 'battery'} onChange={() => {}} />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-title">Adaptive Monitoring</span>
                <p>Reduce scan frequency based on power source.</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </section>

        {/* 9. Advanced Optimization */}
        <section className="settings-card glass-card advanced-section">
          <details>
            <summary className="card-header">
              <div className="header-summary-content">
                <FiSettings className="section-icon" />
                <h3>Advanced Optimization</h3>
                <FiInfo className="info-icon" />
              </div>
            </summary>
            <div className="card-content">
              <div className="advanced-grid">
                <div className="setting-row">
                  <div className="setting-info">
                    <span className="setting-title">Hardware Acceleration</span>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="setting-row">
                  <div className="setting-info">
                    <span className="setting-title">Smart Memory Cleanup</span>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="setting-row">
                  <div className="setting-info">
                    <span className="setting-title">Parallel Search</span>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="setting-row">
                  <div className="setting-info">
                    <span className="setting-title">Predictive Caching</span>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
              <div className="warning-note">
                <FiAlertTriangle />
                <span>Advanced settings are intended for experienced users and may affect system stability.</span>
              </div>
            </div>
          </details>
        </section>
      </div>
    </div>
  );
}
