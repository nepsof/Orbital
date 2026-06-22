'use client';

import { IoMdUnlock, IoMdLock } from 'react-icons/io';
import './login-form.css';

export type LoginFormProps = {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  message: string;
  messageType: string;
  showLoginPassword: boolean;
  onToggleLoginPassword: () => void;
  onContinueAsGuest?: () => void;
};

export default function Login({
  onSubmit,
  isLoading,
  message,
  messageType,
  showLoginPassword,
  onToggleLoginPassword,
  onContinueAsGuest,
}: LoginFormProps) {
  return (
    <form onSubmit={onSubmit}>
      <h1>Login</h1>
      <div className="input-box">
        <input type="text" name="username" placeholder="Username or email" required />
        <i className="bx bxs-user" />
      </div>
      <div className="input-box">
        <input
          type={showLoginPassword ? 'text' : 'password'}
          name="password"
          placeholder="Password"
          required
        />
        <span
          className="password-toggle"
          onClick={onToggleLoginPassword}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onToggleLoginPassword();
          }}
        >
          {showLoginPassword ? <IoMdUnlock /> : <IoMdLock />}
        </span>
      </div>
      <div className="forgot-remember-container">
        <div className="remember-me">
          <label>
            <input type="checkbox" /> Remember me
          </label>
        </div>
        <div className="forgot-link">
          <a href="#">Forgot Password?</a>
        </div>
      </div>
      {message && messageType ? (
        <div className={`message ${messageType}`}>{message}</div>
      ) : null}
      <button type="submit" className="btn" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
      {onContinueAsGuest && (
        <>
          <div className="divider">
            <span>or</span>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onContinueAsGuest}
            disabled={isLoading}
          >
            Continue as Guest
          </button>
        </>
      )}
    </form>
  );
}
