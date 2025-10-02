import React, { useState, useRef, useEffect } from 'react';
import { useAgentAuth } from '../../../context/AgentAuthContext';
import AuthLayout from './AuthLayout';

interface OTPVerificationProps {
  phoneNumber: string;
  displayedOTP: string;
  onSuccess: () => void;
  onBack: () => void;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({
  phoneNumber,
  displayedOTP,
  onSuccess,
  onBack,
}) => {
  const { verifyOTP, error, clearError } = useAgentAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const MAX_ATTEMPTS = 3;

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    clearError();

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (index === 5 && value && newOtp.every(digit => digit !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();

    // Only process if it's 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (code: string) => {
    if (attempts >= MAX_ATTEMPTS) {
      return;
    }

    setIsVerifying(true);
    clearError();

    try {
      await verifyOTP(phoneNumber, code);
      onSuccess();
    } catch (err) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        // Max attempts reached
        setTimeout(() => {
          onBack();
        }, 2000);
      } else {
        // Clear OTP inputs for retry
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length === 6) {
      handleVerify(code);
    }
  };

  const handleResend = () => {
    // For MVP, just show the same OTP again
    setOtp(['', '', '', '', '', '']);
    setAttempts(0);
    clearError();
    inputRefs.current[0]?.focus();
  };

  const attemptsRemaining = MAX_ATTEMPTS - attempts;

  return (
    <AuthLayout
      title="Verify Your Identity"
      subtitle={`Enter the verification code sent to ${phoneNumber}`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Display OTP for MVP */}
        <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded-md">
          <p className="text-sm text-blue-800 text-center">
            Your verification code is: <span className="font-bold text-lg">{displayedOTP}</span>
          </p>
          <p className="text-xs text-blue-600 text-center mt-1">
            In production, this will be sent to your phone/email.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
            {attemptsRemaining > 0 && attempts > 0 && (
              <p className="mt-1 font-semibold">
                {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining
              </p>
            )}
          </div>
        )}

        {attempts >= MAX_ATTEMPTS && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            Maximum attempts reached. Redirecting back...
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
            Enter 6-digit code
          </label>
          <div className="flex justify-center gap-2" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                disabled={isVerifying || attempts >= MAX_ATTEMPTS}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isVerifying || otp.some(digit => !digit) || attempts >= MAX_ATTEMPTS}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          style={{ height: '44px' }}
        >
          {isVerifying ? 'Verifying...' : 'Verify Code'}
        </button>

        <div className="flex justify-between items-center text-sm">
          <button
            type="button"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800"
            disabled={isVerifying}
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleResend}
            className="text-blue-600 hover:text-blue-700 font-medium"
            disabled={isVerifying || attempts >= MAX_ATTEMPTS}
          >
            Resend Code
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default OTPVerification;
