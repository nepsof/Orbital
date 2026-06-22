'use client';

import { useState, useEffect } from 'react';
import Login from './components/login';
import Signup from './components/signup';
import Otp from './components/otp';
import MergeGuestModal from '../components/merge-guest-modal';
import {
  createGuestSession,
  getGuestSession,
  migrateGuestData,
  hasGuestSession,
  setAuthenticatedSession,
  clearGuestSession,
} from '../services/guestService';
import './login.css';

export default function LoginPage() {
  const [isActive, setIsActive] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsContent, setTermsContent] = useState('');
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [pendingGuestLogin, setPendingGuestLogin] = useState(false);

  // Handle initial route guard - redirect authenticated users from login page
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const sessionType = localStorage.getItem('sessionType');

      // If authenticated user (not guest), redirect to home
      if (token && sessionType !== 'guest') {
        window.location.href = '/';
      }
    };

    checkAuth();
  }, []);

  const handleRegisterClick = () => {
    setIsActive(true);
  };

  const handleLoginClick = () => {
    setIsActive(false);
  };

  const handleTermsClick = async () => {
    try {
      const response = await fetch('/terms-and-conditions.md');
      const text = await response.text();
      setTermsContent(text);
      setShowTermsModal(true);
    } catch (err) {
      console.error('Error loading terms and conditions:', err);
    }
  };

  const closeModal = () => {
    setShowTermsModal(false);
  };

  const handleContinueAsGuest = () => {
    const session = createGuestSession();
    setMessage('Guest session created! Redirecting...');
    setMessageType('success');
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
  };

  const handleMergeGuestData = async () => {
    try {
      // Migrate guest data
      const migratedData = migrateGuestData('');
      // Clear guest session
      clearGuestSession();
      // Set authenticated session
      setAuthenticatedSession();

      setShowMergeModal(false);
      setMessage('Guest data merged successfully! Redirecting...');
      setMessageType('success');
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (error) {
      console.error('Error merging guest data:', error);
      setMessage('Error merging guest data');
      setMessageType('error');
    }
  };

  const handleKeepSeparate = () => {
    // Keep guest data, just set authenticated session
    setAuthenticatedSession();
    setShowMergeModal(false);
    setMessage('Login successful! Redirecting...');
    setMessageType('success');
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
  };

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setEmailError('');

    const formData = new FormData(e.currentTarget);
    const fullName = (formData.get('fullName') as string) || '';
    const email = (formData.get('email') as string) || '';
    const password = (formData.get('password') as string) || '';
    const confirmPassword = (formData.get('confirmPassword') as string) || '';

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      setMessageType('error');
      setIsLoading(false);
      return;
    }

    const firstName = fullName.trim().split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    let username = `${firstName}_1`;
    let attempt = 1;

    try {
      let response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, fullName: fullName.trim() }),
      });

      let data = await response.json();

      while (!data.success && data.message?.includes('username') && attempt < 100) {
        attempt++;
        username = `${firstName}_${attempt}`;
        response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, email, password, fullName: fullName.trim() }),
        });
        data = await response.json();
      }

      if (data.success) {
        setUserEmail(email || '');
        setShowOTPModal(true);
        setMessage(`OTP sent to ${email}. For development, OTP is: ${data.devOTP || 'Check console'}`);
        setMessageType('success');
      } else {
        if (data.message?.toLowerCase().includes('email')) {
          setEmailError('Email is already in use');
        } else {
          setMessage(data.message);
          setMessageType('error');
        }
      }
    } catch {
      setMessage('Network error. Please try again.');
      setMessageType('error');
    }

    setIsLoading(false);
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Check if there's a guest session
        const guestSession = getGuestSession();
        if (guestSession && hasGuestSession()) {
          // Show merge modal instead of redirecting immediately
          setPendingGuestLogin(true);
          setShowMergeModal(true);
          setMessage('');
          setMessageType('');
          setIsLoading(false);
          return;
        }

        // No guest session, proceed normally
        setAuthenticatedSession();
        setMessage('Login successful! Redirecting...');
        setMessageType('success');
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        setMessage(data.message);
        setMessageType('error');
      }
    } catch {
      setMessage('Network error. Please try again.');
      setMessageType('error');
    }

    setIsLoading(false);
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otpCode];
      newOtp[index] = value;
      setOtpCode(newOtp);

      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) (nextInput as HTMLInputElement).focus();
      }
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) (prevInput as HTMLInputElement).focus();
    }
  };

  const handleOTPSubmit = async () => {
    const otp = otpCode.join('');
    if (otp.length !== 6) {
      setMessage('Please enter all 6 digits');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail, otp }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Check if there's a guest session and migrate data
        const guestSession = getGuestSession();
        if (guestSession && hasGuestSession()) {
          // Migrate guest data to newly created account
          const migratedData = migrateGuestData(data.user.userId);
          // You might want to call an API here to store the migrated data on the server
          // For now, we're just clearing it locally
        }

        setAuthenticatedSession();
        setMessage('Registration successful! Redirecting...');
        setMessageType('success');
        setShowOTPModal(false);
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        setMessage(data.message);
        setMessageType('error');
      }
    } catch {
      setMessage('Network error. Please try again.');
      setMessageType('error');
    }

    setIsLoading(false);
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`New OTP sent to ${userEmail}. For development, OTP is: ${data.devOTP || 'Check console'}`);
        setMessageType('success');
        setOtpCode(['', '', '', '', '', '']);
      } else {
        setMessage(data.message);
        setMessageType('error');
      }
    } catch {
      setMessage('Network error. Please try again.');
      setMessageType('error');
    }

    setIsLoading(false);
  };

  return (
    <div className="login-page">
      <div className={`container ${isActive ? 'active' : ''}`}>
        <div className="form-box login">
          <Login
            onSubmit={handleLoginSubmit}
            isLoading={isLoading}
            message={message}
            messageType={messageType}
            showLoginPassword={showLoginPassword}
            onToggleLoginPassword={() => setShowLoginPassword(!showLoginPassword)}
            onContinueAsGuest={handleContinueAsGuest}
          />
        </div>

        <div className="form-box register">
          <Signup
            onSubmit={handleRegisterSubmit}
            isLoading={isLoading}
            message={message}
            messageType={messageType}
            emailError={emailError}
            showRegisterPassword={showRegisterPassword}
            showConfirmPassword={showConfirmPassword}
            onToggleRegisterPassword={() => setShowRegisterPassword(!showRegisterPassword)}
            onToggleConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
            showTermsModal={showTermsModal}
            termsContent={termsContent}
            onTermsClick={handleTermsClick}
            onCloseTerms={closeModal}
          />
        </div>

        <div className="toggle-box">
          <div className="toggle-panel toggle-left">
            <h1>Hello, Welcome!</h1>
            <p>Don&apos;t have an account?</p>
            <button type="button" className="btn register-btn" onClick={handleRegisterClick}>
              Register
            </button>
          </div>

          <div className="toggle-panel toggle-right">
            <h1>Welcome Back!</h1>
            <p>Already have an account?</p>
            <button type="button" className="btn login-btn" onClick={handleLoginClick}>
              Login
            </button>
          </div>
        </div>

        <Otp
          open={showOTPModal}
          onClose={() => setShowOTPModal(false)}
          userEmail={userEmail}
          otpCode={otpCode}
          onOtpChange={handleOTPChange}
          onOtpKeyDown={handleOTPKeyDown}
          onVerify={handleOTPSubmit}
          onResend={handleResendOTP}
          isLoading={isLoading}
          message={message}
          messageType={messageType}
        />

        <MergeGuestModal
          open={showMergeModal}
          onMerge={handleMergeGuestData}
          onKeepSeparate={handleKeepSeparate}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
