'use client';

import React, { useState } from 'react';
import Navbar from '../components/navbar';
import './settings.css';
import { useTheme } from '../components/ThemeProvider';
import { defaultSettings } from './types';

import GeneralSettings from './components/general';
import NotificationSettings from './components/notifications';
import FileOrganizationSettings from './components/file-organization';
import PrivacySettings from './components/privacy';
import BackupSettings from './components/backup';
import PerformanceSettings from './components/performance';
import AccountSettings from './components/setting';

export default function SettingsPage() {
  const { settings, loading, updateSettings } = useTheme();
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('general');

  const saveSettings = async (newSettings: Parameters<typeof updateSettings>[0]) => {
    try {
      await updateSettings(newSettings);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Failed to save settings');
    }
  };

  const resetSettings = async () => {
    try {
      for (const [key, value] of Object.entries(defaultSettings)) {
        if (typeof value === 'object' && value !== null) {
          await updateSettings({ [key]: value });
        } else {
          await updateSettings({ [key]: value });
        }
      }
      setMessage('Settings reset to defaults!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error resetting settings:', error);
      setMessage('Failed to reset settings');
    }
  };

  const exportSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('Please login to export settings');
        return;
      }

      const response = await fetch('/api/settings/export', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'settings-export.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setMessage('Settings exported successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.message || 'Failed to export settings');
      }
    } catch (error) {
      console.error('Error exporting settings:', error);
      setMessage('Failed to export settings');
    }
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const importedSettings = JSON.parse(content);
        await updateSettings(importedSettings);
        setMessage('Settings imported successfully!');
      } catch {
        setMessage('Invalid settings file format');
      }
    };
    reader.readAsText(file);
  };

  const tabs = [
    'general',
    'notifications',
    'file-organization',
    'privacy',
    'backup',
    'performance',
    'account'
  ];

  return (
    <Navbar currentPage="Settings">
      <div className="settings-container">
        <div className="settings-tabs">
          <div className="tab-navigation">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.replace('-', ' ').charAt(0).toUpperCase() + tab.replace('-', ' ').slice(1)}
              </button>
            ))}
          </div>

          <div className="tab-content">
            {activeTab === 'general' && (
              <GeneralSettings settings={settings} saveSettings={saveSettings} loading={loading} />
            )}

            {activeTab === 'notifications' && (
              <NotificationSettings settings={settings} saveSettings={saveSettings} loading={loading} />
            )}

            {activeTab === 'file-organization' && (
              <FileOrganizationSettings settings={settings} saveSettings={saveSettings} loading={loading} />
            )}

            {activeTab === 'privacy' && (
              <PrivacySettings settings={settings} saveSettings={saveSettings} loading={loading} />
            )}

            {activeTab === 'backup' && (
              <BackupSettings settings={settings} saveSettings={saveSettings} loading={loading} />
            )}

            {activeTab === 'performance' && (
              <PerformanceSettings settings={settings} saveSettings={saveSettings} loading={loading} />
            )}

            {activeTab === 'account' && (
              <AccountSettings />
            )}
          </div>
        </div>

        {activeTab !== 'account' && (
          <div className="settings-actions">
            <button
              className="action-button export-button"
              onClick={exportSettings}
              disabled={loading}
            >
              Export Settings
            </button>

            <label className="import-button">
              <input
                type="file"
                accept=".json"
                onChange={importSettings}
                disabled={loading}
              />
              <span>Import Settings</span>
            </label>

            <button
              className="action-button reset-button"
              onClick={resetSettings}
              disabled={loading}
            >
              Reset to Defaults
            </button>
          </div>
        )}

        {loading && (
          <div className="settings-loading">
            <div className="spinner"></div>
            <p>Loading settings...</p>
          </div>
        )}

        {message && (
          <div className={`settings-message ${message.includes('Failed') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
      </div>
    </Navbar>
  );
}