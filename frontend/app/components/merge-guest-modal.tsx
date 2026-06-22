'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import './merge-guest-modal.css';

interface MergeGuestModalProps {
  open: boolean;
  onMerge: () => Promise<void>;
  onKeepSeparate: () => void;
  isLoading?: boolean;
}

/**
 * MergeGuestModal Component
 * Shown when a guest user logs into an existing account
 * Allows user to choose between merging or keeping guest data separate
 */
export default function MergeGuestModal({
  open,
  onMerge,
  onKeepSeparate,
  isLoading = false,
}: MergeGuestModalProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'merge' | 'separate' | null>(null);

  if (!open) return null;

  const handleMerge = async () => {
    try {
      await onMerge();
    } catch (error) {
      console.error('Error merging guest data:', error);
    }
  };

  const handleKeepSeparate = () => {
    onKeepSeparate();
  };

  const content = (
    <div className="merge-modal-root">
      <div className="modal-overlay" onClick={() => !isLoading ? setShowConfirm(false) : null}>
        <div className="modal-content merge-guest-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Guest Workspace Detected</h2>
            <p className="modal-subtitle">You have unsaved work in a guest session</p>
          </div>

          <div className="modal-body">
            {!showConfirm ? (
              <>
                <p className="modal-description">
                  Would you like to merge your guest workspace into this account, or keep it separate?
                </p>

                <div className="merge-options">
                  <div
                    className={`merge-option ${selectedOption === 'merge' ? 'selected' : ''}`}
                    onClick={() => setSelectedOption('merge')}
                  >
                    <div className="option-header">
                      <div className="option-icon merge-icon">↻</div>
                      <h3>Merge into this account</h3>
                    </div>
                    <p className="option-description">
                      Transfer monitored folders, automation rules, ignore rules, analytics, search history, and recovery data from your guest session
                    </p>
                    <ul className="option-details">
                      <li>✓ Migrate all guest data</li>
                      <li>✓ Keep everything organized</li>
                      <li>✓ Single unified workspace</li>
                    </ul>
                  </div>

                  <div
                    className={`merge-option ${selectedOption === 'separate' ? 'selected' : ''}`}
                    onClick={() => setSelectedOption('separate')}
                  >
                    <div className="option-header">
                      <div className="option-icon separate-icon">✕</div>
                      <h3>Keep separate</h3>
                    </div>
                    <p className="option-description">
                      Keep your guest workspace data on this device. You can access it later as a guest.
                    </p>
                    <ul className="option-details">
                      <li>✓ Guest data preserved locally</li>
                      <li>✓ Start fresh with new account</li>
                      <li>✓ Switch between sessions</li>
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <div className="confirm-container">
                {selectedOption === 'merge' && (
                  <>
                    <p className="confirm-title">Merge guest workspace?</p>
                    <p className="confirm-message">
                      Your guest data will be permanently merged into this account and cannot be reversed.
                    </p>
                  </>
                )}
                {selectedOption === 'separate' && (
                  <>
                    <p className="confirm-title">Keep data separate?</p>
                    <p className="confirm-message">
                      Your guest workspace will remain stored locally and you can access it by continuing as a guest later.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="modal-footer">
            {!showConfirm ? (
              <>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowConfirm(false)}
                  disabled={!selectedOption || isLoading}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowConfirm(true)}
                  disabled={!selectedOption || isLoading}
                >
                  {isLoading ? 'Processing...' : 'Continue'}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowConfirm(false)}
                  disabled={isLoading}
                >
                  Back
                </button>
                <button
                  type="button"
                  className={`btn btn-primary ${selectedOption === 'merge' ? 'btn-danger' : ''}`}
                  onClick={() => {
                    if (selectedOption === 'merge') {
                      handleMerge();
                    } else {
                      handleKeepSeparate();
                    }
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : selectedOption === 'merge' ? 'Merge Now' : 'Keep Separate'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Use createPortal to render at document root level
  if (typeof window === 'undefined') return null;

  return createPortal(content, document.body);
}
