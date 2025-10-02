import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAgentAuth } from '../../../context/AgentAuthContext';
import AuthLayout from './AuthLayout';
import OTPVerification from './OTPVerification';

const COUNTRY_CODES = [
  { code: '+212', country: 'Morocco', flag: '🇲🇦', digits: 9 },
  { code: '+33', country: 'France', flag: '🇫🇷', digits: 9 },
];

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login, error, clearError } = useAgentAuth();

  const [countryCode, setCountryCode] = useState('+212');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [inputError, setInputError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otpData, setOtpData] = useState<{ otp: string; phone: string } | null>(null);

  const validateInput = (): boolean => {
    const cleanPhone = phoneNumber.replace(/\s/g, '');
    const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode);
    const phoneRegex = new RegExp(`^\\d{${selectedCountry?.digits || 9}}$`);

    if (!phoneNumber.trim()) {
      setInputError('Phone number is required');
      return false;
    }

    if (!phoneRegex.test(cleanPhone)) {
      setInputError(`Phone number must be exactly ${selectedCountry?.digits || 9} digits`);
      return false;
    }

    return true;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
    setInputError('');
    clearError();
  };

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCountryCode(e.target.value);
    setInputError('');
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateInput()) {
      return;
    }

    setIsSubmitting(true);
    clearError();

    try {
      // Clean phone number (remove spaces, keep only digits)
      const cleanPhone = phoneNumber.replace(/\s/g, '');

      const response = await login(countryCode, cleanPhone);

      setOtpData({
        otp: response.otp,
        phone: cleanPhone,
      });
      setShowOTP(true);
    } catch (err) {
      // Error is handled by context
      console.error('Login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOTPSuccess = () => {
    navigate('/agent/dashboard');
  };

  if (showOTP && otpData) {
    return (
      <OTPVerification
        phoneNumber={otpData.phone}
        displayedOTP={otpData.otp}
        onSuccess={handleOTPSuccess}
        onBack={() => setShowOTP(false)}
      />
    );
  }

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Log in to access your agent dashboard"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <div className="flex gap-2">
            <select
              id="countryCode"
              name="countryCode"
              value={countryCode}
              onChange={handleCountryCodeChange}
              className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              style={{ width: '140px' }}
            >
              {COUNTRY_CODES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.code}
                </option>
              ))}
            </select>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={phoneNumber}
              onChange={handlePhoneChange}
              className={`flex-1 px-4 py-3 border ${
                inputError ? 'border-red-300' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder={countryCode === '+212' ? '612345678' : '612345678'}
              maxLength={9}
            />
          </div>
          {inputError && (
            <p className="mt-1 text-sm text-red-600">{inputError}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Enter {COUNTRY_CODES.find(c => c.code === countryCode)?.digits || 9} digits (no spaces)
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          style={{ height: '44px' }}
        >
          {isSubmitting ? 'Processing...' : 'Continue'}
        </button>

        <div className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/agent/register" className="text-blue-600 hover:text-blue-700 font-medium">
            Register
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginForm;
