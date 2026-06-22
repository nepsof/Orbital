'use client';

import './otp.css';

export type OtpModalProps = {
  open: boolean;
  onClose: () => void;
  userEmail: string;
  otpCode: string[];
  onOtpChange: (index: number, value: string) => void;
  onOtpKeyDown: (index: number, e: React.KeyboardEvent) => void;
  onVerify: () => void;
  onResend: () => void;
  isLoading: boolean;
  message: string;
  messageType: string;
};

export default function Otp({
  open,
  onClose,
  userEmail,
  otpCode,
  onOtpChange,
  onOtpKeyDown,
  onVerify,
  onResend,
  isLoading,
  message,
  messageType,
}: OtpModalProps) {
  if (!open) return null;

  return (
    <div className="otp-root">
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content otp-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Verify Your Email</h2>
            <button type="button" className="modal-close" onClick={onClose}>
              &times;
            </button>
          </div>
          <div className="modal-body">
            <p className="otp-instruction">Enter the 6-digit code sent to {userEmail}</p>
            <div className="otp-inputs">
              {otpCode.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => onOtpChange(index, e.target.value)}
                  onKeyDown={(e) => onOtpKeyDown(index, e)}
                  className="otp-input"
                />
              ))}
            </div>
            {message && messageType ? (
              <div className={`message ${messageType}`}>{message}</div>
            ) : null}
            <div className="otp-actions">
              <button
                type="button"
                className="btn"
                onClick={onVerify}
                disabled={isLoading || otpCode.join('').length !== 6}
              >
                {isLoading ? 'Verifying...' : 'Verify'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onResend}
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Resend OTP'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
