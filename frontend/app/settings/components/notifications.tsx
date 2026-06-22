import React, { useState } from 'react';
import { SettingsProps } from '../types';
import './notifications.css';

interface ToggleRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  severity?: 'high' | 'medium' | 'low';
}

const ToggleRow: React.FC<ToggleRowProps> = ({ 
  label, 
  description, 
  checked, 
  onChange, 
  disabled, 
  severity 
}) => (
  <div className="notification-item">
    <div className="item-content">
      <label>
        {severity && <span className={`severity-indicator severity-${severity}`} />}
        {label}
      </label>
      {description && <p>{description}</p>}
    </div>
    <label className="switch">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <span className="slider" />
    </label>
  </div>
);

export default function NotificationSettings({ settings, saveSettings, loading }: SettingsProps) {
  // Global Toggle
  const [globalEnabled, setGlobalEnabled] = useState(true);

  // Section 2: Smart File Activity (Local state for dummy behavior)
  const [fileActivity, setFileActivity] = useState({
    organized: true,
    duplicates: true,
    compression: false,
    restore: true,
    largeFile: true,
    organizationComplete: true
  });

  // Section 3: Spotlight Search
  const [searchNotifications, setSearchNotifications] = useState({
    suggestions: true,
    recommendations: true,
    reminders: false,
    appLaunch: true,
    webFallback: false
  });

  // Section 4: Folder Monitoring
  const [monitoring, setMonitoring] = useState({
    newFile: true,
    paused: true,
    scanComplete: false,
    errors: true,
    folderChange: true
  });

  // Section 5: System Alerts
  const [systemAlerts, setSystemAlerts] = useState({
    permissions: true,
    protectedFolders: true,
    failedOrg: true,
    unsafeAction: true
  });

  // Section 6: Delivery Preferences
  const [delivery, setDelivery] = useState({
    inApp: true,
    desktop: settings.notifications.desktop,
    silent: false,
    sound: settings.notifications.sound,
    duration: '5',
    volume: 80
  });

  // Section 7: Smart Recommendations
  const [recommendations, setRecommendations] = useState({
    storage: true,
    duplicateCleanup: true,
    compression: false,
    unusedFiles: true,
    archive: false
  });

  // Section 8: Focus Mode
  const [focusMode, setFocusMode] = useState({
    enabled: false,
    start: '22:00',
    end: '07:00',
    suppressNonCritical: true
  });

  // Section 9: History
  const [history, setHistory] = useState({
    saveHistory: true,
    autoClear: true,
    retention: '30'
  });

  return (
    <div className="tab-section notification-settings">
      {/* 1. Notifications Overview Header */}
      <header className="notifications-header">
        <div className="header-main">
          <div className="header-icon">🔔</div>
          <div className="header-content">
            <h2>Notification Settings</h2>
            <p>Control alerts, activity updates, smart recommendations, and monitoring notifications.</p>
          </div>
        </div>
        <div className="header-action">
          <label className="switch">
            <input
              type="checkbox"
              checked={globalEnabled}
              onChange={(e) => setGlobalEnabled(e.target.checked)}
              disabled={loading}
            />
            <span className="slider" />
          </label>
        </div>
      </header>

      <div className="notifications-grid" style={{ opacity: globalEnabled ? 1 : 0.6, pointerEvents: globalEnabled ? 'all' : 'none' }}>
        
        {/* 2. Smart File Activity Notifications */}
        <section className="notifications-section">
          <h3 className="section-title">File Activity</h3>
          <div className="notifications-card">
            <ToggleRow 
              label="File organized successfully" 
              description="Get notified when files are moved to their target folders."
              checked={fileActivity.organized}
              onChange={(v) => setFileActivity({...fileActivity, organized: v})}
            />
            <ToggleRow 
              label="Duplicate files detected" 
              description="Alert when identical files are found during scanning."
              checked={fileActivity.duplicates}
              onChange={(v) => setFileActivity({...fileActivity, duplicates: v})}
              severity="medium"
            />
            <ToggleRow 
              label="Compression suggestions" 
              description="Suggestions to save space on large uncompressed files."
              checked={fileActivity.compression}
              onChange={(v) => setFileActivity({...fileActivity, compression: v})}
            />
            <ToggleRow 
              label="File restore completed" 
              description="Notification after successful recovery from archive."
              checked={fileActivity.restore}
              onChange={(v) => setFileActivity({...fileActivity, restore: v})}
            />
            <ToggleRow 
              label="Large file detected" 
              description="Alert when a file exceeds your defined size threshold."
              checked={fileActivity.largeFile}
              onChange={(v) => setFileActivity({...fileActivity, largeFile: v})}
            />
          </div>
        </section>

        {/* 3. Spotlight Search Notifications */}
        <section className="notifications-section">
          <h3 className="section-title">Spotlight Search</h3>
          <div className="notifications-card">
            <ToggleRow 
              label="Search suggestions" 
              description="Intelligent autocomplete for faster file finding."
              checked={searchNotifications.suggestions}
              onChange={(v) => setSearchNotifications({...searchNotifications, suggestions: v})}
            />
            <ToggleRow 
              label="Smart recommendations" 
              description="Personalized file suggestions based on usage."
              checked={searchNotifications.recommendations}
              onChange={(v) => setSearchNotifications({...searchNotifications, recommendations: v})}
            />
            <ToggleRow 
              label="Recent search reminders" 
              description="Quick access to your most frequent search queries."
              checked={searchNotifications.reminders}
              onChange={(v) => setSearchNotifications({...searchNotifications, reminders: v})}
            />
            <div className="info-banner" style={{ marginTop: 'var(--spacing-md)' }}>
              <span className="info-banner-icon">🔒</span>
              <p className="info-banner-text">Search recommendations remain local to your device.</p>
            </div>
          </div>
        </section>

        {/* 4. Folder Monitoring Notifications */}
        <section className="notifications-section">
          <h3 className="section-title">Folder Monitoring</h3>
          <div className="notifications-card">
            <ToggleRow 
              label="New file detected" 
              description="Alert when new items are added to monitored folders."
              checked={monitoring.newFile}
              onChange={(v) => setMonitoring({...monitoring, newFile: v})}
              severity="low"
            />
            <ToggleRow 
              label="Monitoring paused" 
              description="Notification when background monitoring stops."
              checked={monitoring.paused}
              onChange={(v) => setMonitoring({...monitoring, paused: v})}
              severity="medium"
            />
            <ToggleRow 
              label="Folder scan completed" 
              description="Summary after a full deep-scan of your directories."
              checked={monitoring.scanComplete}
              onChange={(v) => setMonitoring({...monitoring, scanComplete: v})}
            />
            <ToggleRow 
              label="Monitoring errors" 
              description="Critical alerts regarding folder access permissions."
              checked={monitoring.errors}
              onChange={(v) => setMonitoring({...monitoring, errors: v})}
              severity="high"
            />
          </div>
        </section>

        {/* 5. System Alerts & Warnings */}
        <section className="notifications-section">
          <h3 className="section-title">System & Security</h3>
          <div className="notifications-card">
            <ToggleRow 
              label="Permission warnings" 
              checked={systemAlerts.permissions}
              onChange={(v) => setSystemAlerts({...systemAlerts, permissions: v})}
              severity="high"
            />
            <ToggleRow 
              label="Protected folder alerts" 
              checked={systemAlerts.protectedFolders}
              onChange={(v) => setSystemAlerts({...systemAlerts, protectedFolders: v})}
              severity="high"
            />
            <ToggleRow 
              label="Failed organization attempts" 
              checked={systemAlerts.failedOrg}
              onChange={(v) => setSystemAlerts({...systemAlerts, failedOrg: v})}
              severity="medium"
            />
            <div className="warning-card">
              <span className="warning-icon">⚠️</span>
              <p className="warning-text">Critical system warnings cannot be fully disabled for safety.</p>
            </div>
          </div>
        </section>

        {/* 6. Notification Delivery Preferences */}
        <section className="notifications-section">
          <h3 className="section-title">Delivery Methods</h3>
          <div className="notifications-card">
            <ToggleRow 
              label="In-app notifications" 
              checked={delivery.inApp}
              onChange={(v) => setDelivery({...delivery, inApp: v})}
            />
            <ToggleRow 
              label="Desktop popups" 
              checked={delivery.desktop}
              onChange={(v) => {
                setDelivery({...delivery, desktop: v});
                saveSettings({ notifications: { ...settings.notifications, desktop: v } });
              }}
            />
            <ToggleRow 
              label="Sound alerts" 
              checked={delivery.sound}
              onChange={(v) => {
                setDelivery({...delivery, sound: v});
                saveSettings({ notifications: { ...settings.notifications, sound: v } });
              }}
            />
            
            <div className="selector-group">
              <label className="item-info"><label>Notification Duration</label></label>
              <select 
                className="duration-selector"
                value={delivery.duration}
                onChange={(e) => setDelivery({...delivery, duration: e.target.value})}
              >
                <option value="3">3 seconds</option>
                <option value="5">5 seconds</option>
                <option value="persistent">Persistent</option>
              </select>
            </div>

            <div className="slider-container">
              <label className="item-info"><label>Sound Volume</label></label>
              <input 
                type="range" 
                className="range-slider" 
                value={delivery.volume} 
                onChange={(e) => setDelivery({...delivery, volume: parseInt(e.target.value)})}
              />
            </div>
          </div>
        </section>

        {/* 7. Smart Recommendations Section */}
        <section className="notifications-section">
          <h3 className="section-title">Smart Recommendations</h3>
          <div className="notifications-card">
            <div className="ai-recommendation-card">
              <h4 style={{ fontSize: 'var(--text-sm)', marginBottom: '4px' }}>AI Assistant</h4>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Enable intelligent analysis of your file system.</p>
            </div>
            <ToggleRow 
              label="Storage optimization" 
              checked={recommendations.storage}
              onChange={(v) => setRecommendations({...recommendations, storage: v})}
            />
            <ToggleRow 
              label="Duplicate cleanup" 
              checked={recommendations.duplicateCleanup}
              onChange={(v) => setRecommendations({...recommendations, duplicateCleanup: v})}
            />
            <ToggleRow 
              label="Compression recommendations" 
              checked={recommendations.compression}
              onChange={(v) => setRecommendations({...recommendations, compression: v})}
            />
            <ToggleRow 
              label="Unused file reminders" 
              checked={recommendations.unusedFiles}
              onChange={(v) => setRecommendations({...recommendations, unusedFiles: v})}
            />
          </div>
        </section>

        {/* 8. Quiet Hours / Focus Mode */}
        <section className="notifications-section">
          <h3 className="section-title">Quiet Hours</h3>
          <div className="notifications-card">
            <ToggleRow 
              label="Enable Focus Mode" 
              description="Silence non-critical alerts during scheduled hours."
              checked={focusMode.enabled}
              onChange={(v) => setFocusMode({...focusMode, enabled: v})}
            />
            <div className="schedule-ui" style={{ opacity: focusMode.enabled ? 1 : 0.5 }}>
              <input 
                type="time" 
                className="time-input" 
                value={focusMode.start}
                onChange={(e) => setFocusMode({...focusMode, start: e.target.value})}
              />
              <span style={{ fontSize: 'var(--text-xs)' }}>to</span>
              <input 
                type="time" 
                className="time-input" 
                value={focusMode.end}
                onChange={(e) => setFocusMode({...focusMode, end: e.target.value})}
              />
            </div>
          </div>
        </section>

        {/* 9. Notification History Preferences */}
        <section className="notifications-section">
          <h3 className="section-title">Notification History</h3>
          <div className="notifications-card">
            <ToggleRow 
              label="Save notification history" 
              checked={history.saveHistory}
              onChange={(v) => setHistory({...history, saveHistory: v})}
            />
            <div className="selector-group">
              <label className="item-info"><label>Retention Period</label></label>
              <select 
                className="duration-selector"
                value={history.retention}
                onChange={(e) => setHistory({...history, retention: e.target.value})}
              >
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
              </select>
            </div>
            <div className="action-group" style={{ marginTop: 'var(--spacing-lg)' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }}>Export History</button>
              <button className="btn btn-danger" style={{ flex: 1 }}>Clear History</button>
            </div>
          </div>
        </section>

        {/* 10. Notification Preview Panel */}
        <section className="preview-panel">
          <h3 className="section-title" style={{ marginBottom: 'var(--spacing-lg)' }}>Live Preview</h3>
          <div className="preview-container">
            <div className="mock-notification">
              <div className="mock-icon">📂</div>
              <div className="mock-content">
                <h4>5 duplicate PDFs detected</h4>
                <p>Storage could be optimized by 45MB.</p>
              </div>
            </div>
            <div className="mock-notification" style={{ animationDelay: '0.2s' }}>
              <div className="mock-icon" style={{ background: 'var(--brand-success-muted)' }}>✅</div>
              <div className="mock-content">
                <h4>Organization completed successfully</h4>
                <p>124 files moved to &quot;Documents/Work/2024&quot;.</p>
              </div>
            </div>
            <div className="mock-notification" style={{ animationDelay: '0.4s' }}>
              <div className="mock-icon" style={{ background: 'var(--brand-accent-muted)' }}>🎥</div>
              <div className="mock-content">
                <h4>Large video files found</h4>
                <p>3 files larger than 1GB detected in Downloads.</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
