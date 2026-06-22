'use client';

import React, { useState, useEffect } from 'react';
import './setting.css';

const LOGIN_URL = 'http://localhost:3000/login';

type AccountSection = 'profile' | 'password';

export default function AccountSettings() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [activeSection, setActiveSection] = useState<AccountSection>('profile');
  
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    fullName: '',
  });
  
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  
  // Separate loading states
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Password UX states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setAuthenticated(false);
        setCheckedAuth(true);
        setInitialLoading(false);
        return;
      }

      setAuthenticated(true);
      try {
        setInitialLoading(true);
        const response = await fetch('/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 401) {
          setAuthenticated(false);
          return;
        }
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          setProfile({
            username: data.data.username || '',
            email: data.data.email || '',
            fullName: data.data.fullName || '',
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setInitialLoading(false);
        setCheckedAuth(true);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setProfileLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
        try {
          const stored = localStorage.getItem('user');
          if (stored) {
            const u = JSON.parse(stored) as Record<string, unknown>;
            localStorage.setItem(
              'user',
              JSON.stringify({
                ...u,
                username: profile.username,
                email: profile.email,
                fullName: profile.fullName,
              })
            );
          }
        } catch {
          /* ignore */
        }
      } else {
        setMessage({ text: data.message || 'Failed to update profile', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Failed to update profile', type: 'error' });
    } finally {
      setProfileLoading(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setPasswordLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/users/password', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwords),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setMessage({ text: 'Password updated successfully!', type: 'success' });
        setPasswords({ currentPassword: '', newPassword: '' });
      } else {
        setMessage({ text: data.message || 'Failed to update password', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Failed to update password', type: 'error' });
    } finally {
      setPasswordLoading(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { label: '', class: '', score: 0 };
    if (password.length < 6) return { label: 'Weak', class: 'weak', score: 1 };
    if (password.length < 10) return { label: 'Medium', class: 'medium', score: 2 };
    return { label: 'Strong', class: 'strong', score: 3 };
  };

  const strength = getPasswordStrength(passwords.newPassword);

  if (!checkedAuth || initialLoading) {
    return (
      <div className="account-settings">
        <div className="account-settings-header">
          <div className="skeleton" style={{ width: '200px', height: '32px' }}></div>
        </div>
        <div className="account-summary-card skeleton" style={{ height: '120px' }}></div>
        <div className="settings-content-grid">
          <div className="settings-main-column">
            <div className="settings-card skeleton" style={{ height: '400px' }}></div>
          </div>
          <div className="settings-sidebar">
            <div className="sidebar-widget skeleton" style={{ height: '200px' }}></div>
            <div className="sidebar-widget skeleton" style={{ height: '250px' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="account-settings modern-login-gate">
        <div className="login-gate-card">
          <div className="login-gate-icon">🔐</div>
          <h2>Access Restricted</h2>
          <p>Please log in to your account to view and manage your profile settings, security preferences, and account information.</p>
          <a href={LOGIN_URL} className="btn-primary" style={{ justifyContent: 'center' }}>
            Sign In to Continue
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="account-settings">
      {/* Toast Messages */}
      {message.text && (
        <div className="toast-container">
          <div className={`toast ${message.type}`}>
            <span className="toast-icon">{message.type === 'success' ? '✅' : '❌'}</span>
            <div className="toast-content">
              <span className="toast-title">{message.type === 'success' ? 'Success' : 'Error'}</span>
              <p className="toast-message">{message.text}</p>
            </div>
            <button className="password-toggle" onClick={() => setMessage({ text: '', type: '' })}>✕</button>
          </div>
        </div>
      )}

      <header className="account-settings-header">
        <h2>Account Settings</h2>
      </header>

      {/* Account Dashboard Summary Card */}
      <div className="account-summary-card">
        <div className="account-avatar-wrapper">
          <div className="account-avatar">
            {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : profile.username.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="account-status-badge"></div>
        </div>
        <div className="account-info-main">
          <h3>{profile.fullName || profile.username}</h3>
          <p className="account-email">{profile.email}</p>
          <div className="account-badges">
            <span className="badge active">Active Account</span>
            <span className="badge verified">Verified</span>
          </div>
        </div>
        <div className="account-id-box">
          <span className="account-id-label">USER ID</span>
          <span className="account-id-value">USR-{profile.username.toUpperCase() || 'GUEST'}</span>
        </div>
      </div>

      {/* Tabs */}
      <nav className="account-tabs" role="tablist">
        <button
          className={`tab-btn ${activeSection === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveSection('profile')}
          role="tab"
          aria-selected={activeSection === 'profile'}
        >
          General Profile
        </button>
        <button
          className={`tab-btn ${activeSection === 'password' ? 'active' : ''}`}
          onClick={() => setActiveSection('password')}
          role="tab"
          aria-selected={activeSection === 'password'}
        >
          Security & Privacy
        </button>
      </nav>

      <div className="settings-content-grid">
        <main className="settings-main-column">
          {activeSection === 'profile' ? (
            <div className="settings-card">
              <div className="card-header">
                <h3>Profile Information</h3>
                <p className="card-description">Update your personal details and how others see you on the platform.</p>
              </div>
              <form onSubmit={handleProfileUpdate}>
                <div className="settings-form-group">
                  <div className="input-wrapper">
                    <label htmlFor="fullName">Full Name</label>
                    <div className="input-container">
                      <input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={profile.fullName}
                        onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                        disabled={profileLoading}
                        required
                        minLength={2}
                      />
                    </div>
                  </div>
                  <div className="input-wrapper">
                    <label htmlFor="username">Username</label>
                    <div className="input-container">
                      <input
                        id="username"
                        type="text"
                        placeholder="johndoe"
                        value={profile.username}
                        onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                        disabled={profileLoading}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="settings-form-group full-width">
                  <div className="input-wrapper">
                    <label htmlFor="email">Email Address</label>
                    <div className="input-container">
                      <input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        disabled={profileLoading}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="settings-actions">
                  <button type="submit" className="btn-primary" disabled={profileLoading}>
                    {profileLoading ? 'Updating...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="settings-card">
              <div className="card-header">
                <h3>Password & Security</h3>
                <p className="card-description">Change your password and manage your account security settings.</p>
              </div>
              <form onSubmit={handlePasswordUpdate}>
                <div className="settings-form-group full-width">
                  <div className="input-wrapper">
                    <label htmlFor="currentPassword">Current Password</label>
                    <div className="input-container">
                      <input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={passwords.currentPassword}
                        onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                        disabled={passwordLoading}
                        required
                      />
                      <button 
                        type="button" 
                        className="password-toggle"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>
                  <div className="input-wrapper">
                    <label htmlFor="newPassword">New Password</label>
                    <div className="input-container">
                      <input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={passwords.newPassword}
                        onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                        disabled={passwordLoading}
                        required
                        minLength={6}
                      />
                      <button 
                        type="button" 
                        className="password-toggle"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                    {passwords.newPassword && (
                      <div className="password-strength">
                        <div className="strength-meter">
                          <div className={`strength-bar ${strength.class}`}></div>
                        </div>
                        <span className={`strength-label ${strength.class}`}>
                          Password Strength: {strength.label}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="info-box">
                  <div className="info-icon">⚠️</div>
                  <div className="info-content">
                    <p>Make sure your new password is at least 10 characters long and contains a mix of letters, numbers, and symbols for better security.</p>
                  </div>
                </div>

                <div className="settings-actions">
                  <button type="submit" className="btn-primary" disabled={passwordLoading}>
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>

        <aside className="settings-sidebar">
          {/* Security Score Widget */}
          <div className="sidebar-widget">
            <h4 className="widget-title">Security Status</h4>
            <div className="security-score-circle">
              <span className="score-value">85%</span>
              <span className="score-label">Secure</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textAlign: 'center', margin: '0' }}>
              Your account security is high. Enable 2FA to reach 100%.
            </p>
          </div>

          {/* Account Activity Widget */}
          <div className="sidebar-widget">
            <h4 className="widget-title">Recent Activity</h4>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon"></div>
                <div className="activity-content">
                  Profile updated
                  <span className="activity-time">2 hours ago</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon" style={{ background: 'var(--brand-success)' }}></div>
                <div className="activity-content">
                  New login from Chrome
                  <span className="activity-time">Yesterday at 4:30 PM</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon" style={{ background: 'var(--brand-accent)' }}></div>
                <div className="activity-content">
                  Password changed
                  <span className="activity-time">5 days ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Completion Widget */}
          <div className="sidebar-widget">
            <h4 className="widget-title">Profile Completion</h4>
            <div className="password-strength" style={{ marginTop: '0' }}>
              <div className="strength-meter" style={{ height: '8px' }}>
                <div className="strength-bar strong" style={{ width: '90%' }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <span className="strength-label">90% Complete</span>
                <span className="strength-label" style={{ color: 'var(--brand-primary)', cursor: 'pointer' }}>Finish</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
