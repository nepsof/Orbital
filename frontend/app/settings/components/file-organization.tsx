import React from 'react';
import { SettingsProps } from '../types';
import { 
  FiCheckCircle, 
  FiAlertCircle, 
  FiImage, 
  FiVideo, 
  FiFileText, 
  FiArchive, 
  FiMusic, 
  FiCpu, 
  FiMonitor, 
  FiFolder,
  FiPlus,
  FiTrash2,
  FiEdit3,
  FiClock,
  FiShield,
  FiSearch,
  FiZap,
  FiArrowRight,
  FiInfo
} from 'react-icons/fi';
import './file-organization.css';

const ToggleRow = ({ label, description, checked, onChange, disabled, loading }: { 
  label: string, 
  description: string, 
  checked: boolean, 
  onChange: (val: boolean) => void,
  disabled?: boolean,
  loading?: boolean
}) => (
  <div className="toggle-row">
    <div className="toggle-info">
      <div className="toggle-label">{label}</div>
      <div className="toggle-description">{description}</div>
    </div>
    <button 
      className={`toggle-switch ${checked ? 'active' : ''}`}
      onClick={() => onChange(!checked)}
      disabled={disabled || loading}
    >
      <div className="toggle-slider" />
    </button>
  </div>
);

export default function FileOrganizationSettings({ settings, saveSettings }: SettingsProps) {
  return (
    <div className="file-organization-container">
      {/* 1. File Organization Overview Header */}
      <header className="organization-header surface-raised">
        <div className="header-content">
          <div className="header-info">
            <h1>File Organization</h1>
            <p>Control how files are categorized, organized, optimized, and managed across monitored folders.</p>
          </div>
          
            <div className="global-toggle">
              <span className="toggle-text">Global Enable</span>
              <button 
                className={`toggle-switch ${settings.fileOrganization.autoOrganize ? 'active' : ''}`}
                onClick={() => saveSettings({ 
                  fileOrganization: { ...settings.fileOrganization, autoOrganize: !settings.fileOrganization.autoOrganize }
                })}
              >
                <div className="toggle-slider" />
              </button>
            </div>
          
        </div>
      </header>

      <div className="organization-content">
        {/* 2. Automation Control Section */}
        <section className="settings-section surface-raised">
          <div className="section-header">
            <FiZap className="section-icon" />
            <h2>Automation Control</h2>
          </div>
          <div className="toggle-list">
            <ToggleRow 
              label="Auto Organize Files"
              description="Automatically move new files to their designated category folders."
              checked={settings.fileOrganization.autoOrganize}
              onChange={(val) => saveSettings({ fileOrganization: { ...settings.fileOrganization, autoOrganize: val } })}
            />
            <ToggleRow 
              label="Auto Create Category Folders"
              description="Create missing category folders automatically when organizing."
              checked={true}
              onChange={() => {}}
            />
            <ToggleRow 
              label="Auto Detect Duplicates"
              description="Scan for identical files during the organization process."
              checked={settings.fileOrganization.duplicateDetection}
              onChange={(val) => saveSettings({ fileOrganization: { ...settings.fileOrganization, duplicateDetection: val } })}
            />
            <ToggleRow 
              label="Auto Compression Suggestions"
              description="Suggest compression for large or rarely accessed files."
              checked={settings.fileOrganization.compressionEnabled}
              onChange={(val) => saveSettings({ fileOrganization: { ...settings.fileOrganization, compressionEnabled: val } })}
            />
            <ToggleRow 
              label="Smart Cleanup Recommendations"
              description="AI-driven suggestions for cleaning up unused or temporary files."
              checked={true}
              onChange={() => {}}
            />
            <ToggleRow 
              label="Ask Before Moving Files"
              description="Require manual confirmation for each organization action."
              checked={false}
              onChange={() => {}}
            />
            <ToggleRow 
              label="Safe Mode"
              description="Only provide suggestions without making any changes."
              checked={true}
              onChange={() => {}}
            />
          </div>
        </section>

        {/* 3. Smart Rules Engine Section */}
        <section className="settings-section surface-raised">
          <div className="section-header">
            <FiZap className="section-icon" />
            <h2>Smart Rules Engine</h2>
          </div>
          <div className="rules-list">
            {[
              { id: 'large-files', title: 'Large File Identification', desc: 'IF file size > 1GB → Mark as large file', priority: 'High', enabled: true },
              { id: 'screenshots-move', title: 'Screenshot Automation', desc: 'IF screenshot → Move to Screenshots folder', priority: 'Medium', enabled: true },
              { id: 'duplicate-cleanup', title: 'Duplicate Suggestion', desc: 'IF duplicate detected → Suggest cleanup', priority: 'High', enabled: true },
              { id: 'old-temp', title: 'Temp File Cleanup', desc: 'IF temp file > 30 days → Move to Trash', priority: 'Low', enabled: false },
            ].map(rule => (
              <div key={rule.id} className={`rule-item-card ${!rule.enabled ? 'disabled' : ''}`}>
                <div className="rule-item-content">
                  <div className="rule-item-header">
                    <span className={`priority-tag ${rule.priority.toLowerCase()}`}>{rule.priority} Priority</span>
                    <button className={`mini-toggle ${rule.enabled ? 'active' : ''}`}>
                      <div className="mini-slider" />
                    </button>
                  </div>
                  <h4>{rule.title}</h4>
                  <p>{rule.desc}</p>
                </div>
                <div className="rule-item-actions">
                  <button className="icon-btn"><FiEdit3 /></button>
                  <button className="icon-btn danger"><FiTrash2 /></button>
                </div>
              </div>
            ))}
          </div>
          <button className="add-rule-btn-inline">
            <FiPlus /> Create New Smart Rule
          </button>
        </section>

        {/* 4. File Category Organization Rules */}
        <section className="settings-section surface-raised full-width">
          <div className="section-header">
            <FiFolder className="section-icon" />
            <h2>File Category Organization Rules</h2>
          </div>
          <div className="category-grid">
            {[
              { id: 'images', name: 'Images', icon: <FiImage />, ext: '.jpg, .png, .gif, .webp', dest: '/Organized/Images', count: '1,240 files', status: 'Active' },
              { id: 'videos', name: 'Videos', icon: <FiVideo />, ext: '.mp4, .mov, .mkv', dest: '/Organized/Videos', count: '85 files', status: 'Active' },
              { id: 'documents', name: 'Documents', icon: <FiFileText />, ext: '.docx, .txt, .odt', dest: '/Organized/Docs', count: '450 files', status: 'Active' },
              { id: 'pdfs', name: 'PDFs', icon: <FiFileText />, ext: '.pdf', dest: '/Organized/PDFs', count: '320 files', status: 'Active' },
              { id: 'archives', name: 'Archives', icon: <FiArchive />, ext: '.zip, .rar, .7z', dest: '/Organized/Archives', count: '112 files', status: 'Inactive' },
              { id: 'programs', name: 'Programs', icon: <FiCpu />, ext: '.exe, .msi, .app', dest: '/Organized/Apps', count: '45 files', status: 'Active' },
              { id: 'audio', name: 'Audio', icon: <FiMusic />, ext: '.mp3, .wav, .flac', dest: '/Organized/Audio', count: '890 files', status: 'Active' },
              { id: 'screenshots', name: 'Screenshots', icon: <FiMonitor />, ext: '.png, .jpg', dest: '/Organized/Screenshots', count: '215 files', status: 'Active' },
              { id: 'others', name: 'Others', icon: <FiAlertCircle />, ext: 'misc', dest: '/Organized/Others', count: '67 files', status: 'Active' },
            ].map(cat => (
              <div key={cat.id} className={`category-card ${cat.status === 'Inactive' ? 'disabled' : ''}`}>
                <div className="category-card-header">
                  <div className="category-icon-wrapper">{cat.icon}</div>
                  <div className="category-status-badge">{cat.status}</div>
                </div>
                <div className="category-card-body">
                  <h3>{cat.name}</h3>
                  <div className="category-extensions">{cat.ext}</div>
                  <div className="category-destination">
                    <FiArrowRight className="dest-icon" />
                    <span>{cat.dest}</span>
                  </div>
                </div>
                <div className="category-card-footer">
                  <span className="file-count">{cat.count}</span>
                  <div className="category-actions">
                    <button className="icon-btn" title="Edit Rule"><FiEdit3 /></button>
                    <button className="icon-btn danger" title="Disable Rule"><FiTrash2 /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="section-footer">
            <button className="add-rule-btn">
              <FiPlus /> Add New Category Rule
            </button>
          </div>
        </section>

        

        {/* 5. File Naming & Structure Preferences */}
        <section className="settings-section surface-raised">
          <div className="section-header">
            <FiEdit3 className="section-icon" />
            <h2>Naming & Structure</h2>
          </div>
          <div className="settings-grid">
            <div className="setting-item">
              <label>Filename Preference</label>
              <select defaultValue="original">
                <option value="original">Keep original filenames</option>
                <option value="smart">Smart rename suggestions</option>
                <option value="clean">Clean filenames (no special chars)</option>
              </select>
            </div>
            <div className="setting-item">
              <label>Folder Grouping</label>
              <select defaultValue="date">
                <option value="none">No sub-folders</option>
                <option value="date">Date-based (YYYY/MM)</option>
                <option value="type">File type based</option>
                <option value="category">Category-first organization</option>
              </select>
            </div>
            <div className="setting-item">
              <label>Nesting Depth</label>
              <select defaultValue="shallow">
                <option value="flat">Flat structure (no nesting)</option>
                <option value="shallow">Shallow nesting (max 2 levels)</option>
                <option value="deep">Deep nesting (flexible)</option>
              </select>
            </div>
          </div>
          <div className="toggle-list small">
            <ToggleRow 
              label="Append date to duplicates"
              description="Add timestamp to filename if a duplicate is found."
              checked={true}
              onChange={() => {}}
            />
            <ToggleRow 
              label="Lowercase filenames"
              description="Convert all organized filenames to lowercase."
              checked={false}
              onChange={() => {}}
            />
          </div>
        </section>

        {/* 6. Duplicate Detection Preferences */}
        <section className="settings-section surface-raised">
          <div className="section-header">
            <FiSearch className="section-icon" />
            <h2>Duplicate Detection</h2>
          </div>
          <div className="toggle-list small">
            <ToggleRow 
              label="Filename Comparison"
              description="Identify duplicates based on matching filenames."
              checked={true}
              onChange={() => {}}
            />
            <ToggleRow 
              label="Hash Comparison (Slow)"
              description="Identify duplicates based on binary file content."
              checked={settings.fileOrganization.duplicateDetection}
              onChange={(val) => saveSettings({ fileOrganization: { ...settings.fileOrganization, duplicateDetection: val } })}
            />
            <ToggleRow 
              label="Size Comparison"
              description="Identify duplicates based on exact file size."
              checked={true}
              onChange={() => {}}
            />
            <ToggleRow 
              label="Similar Image Detection"
              description="AI-powered detection of visually similar images."
              checked={false}
              onChange={() => {}}
            />
          </div>
          <div className="settings-grid">
            <div className="setting-item">
              <label>Detection Sensitivity</label>
              <input type="range" min="0" max="100" defaultValue="75" className="range-slider" />
              <div className="range-labels">
                <span>Low</span>
                <span>Balanced</span>
                <span>Strict</span>
              </div>
            </div>
            <div className="setting-item">
              <label>Default Action</label>
              <select defaultValue="suggest">
                <option value="suggest">Suggest only</option>
                <option value="move">Move to Duplicates folder</option>
                <option value="trash">Move to Trash</option>
                <option value="ask">Ask before action</option>
              </select>
            </div>
          </div>
        </section>

        {/* 7. Compression & Optimization Settings */}
        <section className="settings-section surface-raised">
          <div className="section-header">
            <FiArchive className="section-icon" />
            <h2>Compression & Optimization</h2>
          </div>
          <div className="optimization-preview">
            <div className="preview-stat">
              <span className="stat-value">~24.5 GB</span>
              <span className="stat-label">Est. Storage Savings</span>
            </div>
            <div className="preview-chart">
              <div className="chart-bar" style={{ width: '65%' } as React.CSSProperties}></div>
            </div>
          </div>
          <div className="toggle-list small">
            <ToggleRow 
              label="Image Compression Suggestions"
              description="Suggest optimizing large images for web use."
              checked={true}
              onChange={() => {}}
            />
            <ToggleRow 
              label="Archive Recommendations"
              description="Suggest zipping folders not accessed in 6 months."
              checked={true}
              onChange={() => {}}
            />
            <ToggleRow 
              label="PDF Optimization"
              description="Suggest reducing PDF file size while keeping quality."
              checked={false}
              onChange={() => {}}
            />
            <ToggleRow 
              label="Large Video Alerts"
              description="Notify when videos exceed 5GB for possible compression."
              checked={true}
              onChange={() => {}}
            />
          </div>
          <div className="settings-grid">
            <div className="setting-item">
              <label>Compression Threshold</label>
              <select defaultValue="500mb">
                <option value="100mb">Files &gt; 100 MB</option>
                <option value="500mb">Files &gt; 500 MB</option>
                <option value="1gb">Files &gt; 1 GB</option>
                <option value="5gb">Files &gt; 5 GB</option>
              </select>
            </div>
          </div>
        </section>

        {/* 8. Organization Safety Settings */}
        <section className="settings-section surface-raised">
          <div className="section-header">
            <FiShield className="section-icon" />
            <h2>Organization Safety</h2>
          </div>
          <div className="safety-warning surface-raised">
            <FiInfo className="warning-icon" />
            <p>The system only organizes files inside user-approved monitored folders. System and protected folders are excluded by default.</p>
          </div>
          <div className="toggle-list small">
            <ToggleRow 
              label="Protect System Files"
              description="Never move or rename hidden or system-level files."
              checked={true}
              onChange={() => {}}
            />
            <ToggleRow 
              label="Undo History Retention"
              description="Keep organization history for 30 days to allow recovery."
              checked={true}
              onChange={() => {}}
            />
            <ToggleRow 
              label="Confirm Risky Actions"
              description="Ask before moving files larger than 5GB or deleting duplicates."
              checked={true}
              onChange={() => {}}
            />
          </div>
          <div className="settings-grid">
            <div className="setting-item">
              <label>Max Files Per Process</label>
              <input type="number" defaultValue={500} min={10} max={5000} />
            </div>
            <div className="setting-item">
              <label>Undo Retention Period</label>
              <select defaultValue="30">
                <option value="7">7 Days</option>
                <option value="14">14 Days</option>
                <option value="30">30 Days</option>
                <option value="90">90 Days</option>
              </select>
            </div>
          </div>
        </section>

        {/* 9. Ignored Files & Exclusions Section */}
        <section className="settings-section surface-raised">
          <div className="section-header">
            <FiAlertCircle className="section-icon" />
            <h2>Ignored Files & Exclusions</h2>
          </div>
          <div className="exclusions-container">
            <div className="exclusion-group">
              <label>Global Patterns</label>
              <div className="chip-cloud">
                {['node_modules', '.git', '*.tmp', '.DS_Store', 'Thumbs.db', 'temp_*'].map(pattern => (
                  <div key={pattern} className="pattern-chip">
                    <span>{pattern}</span>
                    <button className="remove-chip"><FiPlus style={{ transform: 'rotate(45deg)' }} /></button>
                  </div>
                ))}
                <button className="add-chip-btn"><FiPlus /> Add Pattern</button>
              </div>
            </div>
            <div className="exclusion-group">
              <label>Excluded Folders</label>
              <div className="folder-exclusion-list">
                {[
                  { path: '/Users/work/projects/archive', type: 'System' },
                  { path: '/Users/personal/private', type: 'Manual' },
                ].map((folder, idx) => (
                  <div key={idx} className="folder-exclusion-item">
                    <FiFolder className="folder-icon" />
                    <div className="folder-info">
                      <span className="folder-path">{folder.path}</span>
                      <span className="folder-type">{folder.type} Exclusion</span>
                    </div>
                    <button className="icon-btn danger"><FiTrash2 /></button>
                  </div>
                ))}
              </div>
              <button className="add-rule-btn-inline">
                <FiPlus /> Exclude New Folder
              </button>
            </div>
          </div>
        </section>

        {/* 10. Recovery & Undo Preferences */}
        <section className="settings-section surface-raised">
          <div className="section-header">
            <FiClock className="section-icon" />
            <h2>Recovery & Undo</h2>
          </div>
          <div className="toggle-list small">
            <ToggleRow 
              label="Auto Backup Before Move"
              description="Create a temporary backup before any organization action."
              checked={true}
              onChange={() => {}}
            />
            <ToggleRow 
              label="Restore Point Creation"
              description="Automatically create a system restore point every 24 hours."
              checked={false}
              onChange={() => {}}
            />
          </div>
          <div className="settings-grid">
            <div className="setting-item">
              <label>Undo History Size</label>
              <select defaultValue="100">
                <option value="50">Last 50 actions</option>
                <option value="100">Last 100 actions</option>
                <option value="500">Last 500 actions</option>
                <option value="unlimited">Unlimited</option>
              </select>
            </div>
          </div>
          <div className="action-buttons">
            <button className="primary-btn">
              Open Recovery Center
            </button>
            <button className="secondary-btn danger">
              Clear Undo History
            </button>
          </div>
        </section>

        {/* 11. Organization Preview Panel */}
        <section className="settings-section surface-raised full-width">
          <div className="section-header">
            <FiMonitor className="section-icon" />
            <h2>Organization Preview</h2>
          </div>
          <div className="preview-container">
            {/* 2. CURRENT STAGE */}
            <div className="preview-card">
              <div className="preview-label">Current State</div>
              <div className="preview-file-item">
                <FiImage className="file-icon" />
                <span>Downloads/vacation_photo_01.png</span>
              </div>
              <div className="preview-file-item">
                <FiFileText className="file-icon" />
                <span>Desktop/report_final_v2.pdf</span>
              </div>
              <div className="preview-file-item">
                <FiArchive className="file-icon" />
                <span>Downloads/backup_2023.zip</span>
              </div>
            </div>

            {/* Arrow */}
            <div className="preview-arrow">
              <FiArrowRight />
            </div>

            {/* 3. SUGGESTED STAGE */}
            <div className="preview-card suggested">
              <div className="preview-label">Suggested Organization</div>

              <div className="preview-file-item">
                <FiImage className="file-icon success" />
                <span>Images/2024/05/vacation_photo_01.png</span>
              </div>
              <div className="preview-file-item">
                <FiFileText className="file-icon success" />
                <span>Documents/PDFs/report_final_v2.pdf</span>
              </div>
              <div className="preview-file-item">
                <FiArchive className="file-icon success" />
                <span>Archives/backup_2023.zip</span>
              </div>
            </div>

          </div>

          {/* Insights remain same */}
          <div className="preview-insights">
            <div className="insight-item">
              <FiCheckCircle className="insight-icon success" />
              <div className="insight-text">
                <strong>Smart Categorization</strong>
                <span>3 files will be moved to optimized locations.</span>
              </div>
            </div>

            <div className="insight-item">
              <FiAlertCircle className="insight-icon warning" />
              <div className="insight-text">
                <strong>Duplicate Warning</strong>
                <span>&quot;report_final_v2.pdf&quot; exists in 2 other locations.</span>
              </div>
            </div>

            <div className="insight-item">
              <FiZap className="insight-icon primary" />
              <div className="insight-text">
                <strong>Optimization Suggestion</strong>
                <span>Compressing &quot;backup_2023.zip&quot; could save 450MB.</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
