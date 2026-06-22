import { SettingsProps } from '../types';
import './general.css';

export default function GeneralSettings({ settings, saveSettings, loading }: SettingsProps) {
  const handleClearCache = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch('/api/settings/clear-cache', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  return (
    <div className="tab-section general-settings">
      <header className="settings-header">
        <div className="header-icon">⚙️</div>
        <div className="header-content">
          <h2>General Settings</h2>
          <p>Manage application appearance, behavior, startup preferences, and localization.</p>
        </div>
      </header>

      <div className="settings-grid">
        <section className="settings-section">
          <h3 className="section-title">Appearance</h3>
          <div className="settings-card">
            <div className="theme-options">
              <div
                className={`theme-card ${settings.theme === 'light' ? 'active' : ''}`}
                onClick={() => saveSettings({ theme: 'light' })}
              >
                <div className="theme-preview light"></div>
                <span>Light</span>
              </div>
              <div
                className={`theme-card ${settings.theme === 'dark' ? 'active' : ''}`}
                onClick={() => saveSettings({ theme: 'dark' })}
              >
                <div className="theme-preview dark"></div>
                <span>Dark</span>
              </div>
              <div
                className={`theme-card ${settings.theme === 'system' ? 'active' : ''}`}
                onClick={() => saveSettings({ theme: 'system' })}
              >
                <div className="theme-preview system"></div>
                <span>System</span>
              </div>
            </div>
            <div className="setting-item">
              <div className="item-info">
                <label>Theme Mode</label>
                <p>Choose your preferred application theme</p>
              </div>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h3 className="section-title">Language & Region</h3>
          <div className="settings-card">
            <div className="setting-item">
              <div className="item-info">
                <label>App Language</label>
                <p>Select your primary interface language</p>
              </div>
              <select
                className="select-control"
                style={{ width: 'auto' }}
                value={settings.language}
                onChange={(e) => saveSettings({ language: e.target.value })}
                disabled={loading}
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
            <div className="setting-item">
              <div className="item-info">
                <label>Date Format</label>
                <p>Choose how dates are displayed</p>
              </div>
              <select
                className="select-control"
                style={{ width: 'auto' }}
                value={settings.dateFormat}
                onChange={(e) => saveSettings({ dateFormat: e.target.value })}
                disabled={loading}
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h3 className="section-title">Startup & Launch</h3>
          <div className="settings-card">
            <div className="setting-item">
              <div className="item-info">
                <label>Launch on startup</label>
                <p>Automatically start the app when you log in</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.launchOnStartup}
                  onChange={(e) => saveSettings({ launchOnStartup: e.target.checked })}
                  disabled={loading}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="item-info">
                <label>Start minimized</label>
                <p>Keep the app in tray on startup</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.startMinimized}
                  onChange={(e) => saveSettings({ startMinimized: e.target.checked })}
                  disabled={loading}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h3 className="section-title">System Behavior</h3>
          <div className="settings-card">
            <div className="setting-item">
              <div className="item-info">
                <label>Desktop Notifications</label>
                <p>Show alerts for file operations</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.desktopNotifications}
                  onChange={(e) => saveSettings({ desktopNotifications: e.target.checked })}
                  disabled={loading}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="item-info">
                <label>Minimize to tray</label>
                <p>Close button will hide app to tray</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.minimizeToTray}
                  onChange={(e) => saveSettings({ minimizeToTray: e.target.checked })}
                  disabled={loading}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h3 className="section-title">Performance</h3>
          <div className="settings-card">
            <div className="setting-item">
              <div className="item-info">
                <label>Performance Mode</label>
                <p>Balance between speed and resource usage</p>
              </div>
              <select
                className="select-control"
                style={{ width: 'auto' }}
                value={settings.performanceMode}
                onChange={(e) => saveSettings({ performanceMode: e.target.value as 'balanced' | 'high' | 'battery' })}
                disabled={loading}
              >
                <option value="balanced">Balanced</option>
                <option value="high">High Performance</option>
                <option value="battery">Battery Saver</option>
              </select>
            </div>
            <div className="info-banner">
              <span className="info-banner-icon">ℹ️</span>
              <p className="info-banner-text">
                High performance mode increases indexing speed but uses more CPU.
              </p>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h3 className="section-title">Accessibility</h3>
          <div className="settings-card">
            <div className="setting-item">
              <div className="item-info">
                <label>Font Size</label>
                <p>Adjust interface text scaling</p>
              </div>
              <select
                className="select-control"
                style={{ width: 'auto' }}
                value={settings.fontSize}
                onChange={(e) => saveSettings({ fontSize: e.target.value as 'small' | 'default' | 'large' })}
                disabled={loading}
              >
                <option value="small">Small</option>
                <option value="default">Default</option>
                <option value="large">Large</option>
              </select>
            </div>
            <div className="setting-item">
              <div className="item-info">
                <label>Reduced Motion</label>
                <p>Minimize animations and transitions</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.reducedMotion}
                  onChange={(e) => saveSettings({ reducedMotion: e.target.checked })}
                  disabled={loading}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h3 className="section-title">Privacy & Local Data</h3>
          <div className="settings-card">
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-value">--</span>
                <span className="stat-label">Cache</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">--</span>
                <span className="stat-label">Index</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">--</span>
                <span className="stat-label">Config</span>
              </div>
            </div>
            <div className="action-group">
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handleClearCache}>Clear Cache</button>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h3 className="section-title">About</h3>
          <div className="settings-card">
            <div className="setting-item">
              <div className="item-info">
                <label>Smart File Manager</label>
                <p>Version 1.0.0 (Stable)</p>
              </div>
            </div>
            <div className="item-info">
              <p>Platform: Electron + Next.js</p>
              <p>Environment: Production</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}