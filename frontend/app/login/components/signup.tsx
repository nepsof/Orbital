'use client';

import { IoMdUnlock, IoMdLock } from 'react-icons/io';
import './signup.css';

export type SignupFormProps = {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  message: string;
  messageType: string;
  emailError: string;
  showRegisterPassword: boolean;
  showConfirmPassword: boolean;
  onToggleRegisterPassword: () => void;
  onToggleConfirmPassword: () => void;
  showTermsModal: boolean;
  termsContent: string;
  onTermsClick: () => void;
  onCloseTerms: () => void;
};

export default function Signup({
  onSubmit,
  isLoading,
  message,
  messageType,
  emailError,
  showRegisterPassword,
  showConfirmPassword,
  onToggleRegisterPassword,
  onToggleConfirmPassword,
  showTermsModal,
  termsContent,
  onTermsClick,
  onCloseTerms,
}: SignupFormProps) {
  return (
    <>
      <form onSubmit={onSubmit}>
        <h1>Registration</h1>
        <div className="input-box">
          <input type="text" name="fullName" placeholder="Full Name" required />
          <i className="bx bxs-user" />
        </div>
        <div className="input-box">
          <input type="email" name="email" placeholder="Email" required />
          <i className="bx bxs-envelope" />
          {emailError ? <div className="signup-field-error">{emailError}</div> : null}
        </div>
        <div className="input-box">
          <input
            type={showRegisterPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            required
          />
          <span
            className="password-toggle"
            onClick={onToggleRegisterPassword}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onToggleRegisterPassword();
            }}
          >
            {showRegisterPassword ? <IoMdUnlock /> : <IoMdLock />}
          </span>
        </div>
        <div className="input-box">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            placeholder="Confirm Password"
            required
          />
          <span
            className="password-toggle"
            onClick={onToggleConfirmPassword}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onToggleConfirmPassword();
            }}
          >
            {showConfirmPassword ? <IoMdUnlock /> : <IoMdLock />}
          </span>
        </div>
        <div className="terms-checkbox">
          <label>
            <input type="checkbox" required /> I agree to the{' '}
            <span className="signup-terms-link" onClick={onTermsClick}>
              terms and conditions
            </span>
          </label>
        </div>
        {message && messageType ? (
          <div className={`message ${messageType}`}>{message}</div>
        ) : null}
        <button type="submit" className="btn" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>

      {showTermsModal ? (
        <div className="modal-overlay" onClick={onCloseTerms}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Terms and Conditions</h2>
              <button type="button" className="modal-close" onClick={onCloseTerms}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="signup-terms-content">
                {termsContent.split('\n').map((line, index) => {
                  if (line.startsWith('# ')) {
                    return <h1 key={index}>{line.substring(2)}</h1>;
                  }
                  if (line.startsWith('## ')) {
                    return <h2 key={index}>{line.substring(3)}</h2>;
                  }
                  if (line.startsWith('---')) {
                    return <hr key={index} className="signup-terms-divider" />;
                  }
                  if (line.startsWith('* ')) {
                    return <li key={index}>{line.substring(2)}</li>;
                  }
                  if (line.trim() === '') {
                    return <br key={index} />;
                  }
                  return <p key={index}>{line}</p>;
                })}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn" onClick={onCloseTerms}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
