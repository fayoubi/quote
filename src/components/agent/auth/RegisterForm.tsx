import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAgentAuth } from '../../../context/AgentAuthContext';
import AuthLayout from './AuthLayout';
import OTPVerification from './OTPVerification';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  phone: string;
  licenseNumber: string;
  agencyName: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  licenseNumber?: string;
  agencyName?: string;
}

const COUNTRY_CODES = [
  { code: '+212', country: 'Morocco', flag: '🇲🇦', digits: 9 },
  { code: '+33', country: 'France', flag: '🇫🇷', digits: 9 },
];

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { register, error, clearError } = useAgentAuth();

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+212',
    phone: '',
    licenseNumber: '',
    agencyName: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otpData, setOtpData] = useState<{ otp: string; phone: string } | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Valid email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }

    // Phone validation (9 digits for Morocco and France)
    const cleanPhone = formData.phone.replace(/\s/g, '');
    const selectedCountry = COUNTRY_CODES.find(c => c.code === formData.countryCode);
    const phoneRegex = new RegExp(`^\\d{${selectedCountry?.digits || 9}}$`);

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(cleanPhone)) {
      newErrors.phone = `Phone number must be exactly ${selectedCountry?.digits || 9} digits`;
    }

    // License Number validation
    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'License number is required';
    } else if (formData.licenseNumber.trim().length > 6) {
      newErrors.licenseNumber = 'License number must be 6 characters or less';
    }

    // Agency Name validation
    if (!formData.agencyName.trim()) {
      newErrors.agencyName = 'Agency name is required';
    } else if (formData.agencyName.trim().length < 2) {
      newErrors.agencyName = 'Agency name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    clearError();

    try {
      // Clean phone number (remove spaces, keep only digits)
      const cleanPhone = formData.phone.replace(/\s/g, '');

      const response = await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        countryCode: formData.countryCode,
        phone: cleanPhone,
        licenseNumber: formData.licenseNumber.trim(),
        agencyName: formData.agencyName.trim(),
      });

      setOtpData({
        otp: response.otp,
        phone: cleanPhone,
      });
      setShowOTP(true);
    } catch (err) {
      // Error is handled by context
      console.error('Registration error:', err);
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
      title="Create Agent Account"
      subtitle="Register to start managing your client enrollments"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full px-4 py-3 border ${
                errors.firstName ? 'border-red-300' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="John"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full px-4 py-3 border ${
                errors.lastName ? 'border-red-300' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="Doe"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-3 border ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder="john.doe@agency.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <div className="flex gap-2">
            <select
              id="countryCode"
              name="countryCode"
              value={formData.countryCode}
              onChange={handleChange}
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
              value={formData.phone}
              onChange={handleChange}
              className={`flex-1 px-4 py-3 border ${
                errors.phone ? 'border-red-300' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder={formData.countryCode === '+212' ? '612345678' : '612345678'}
              maxLength={9}
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Enter {COUNTRY_CODES.find(c => c.code === formData.countryCode)?.digits || 9} digits (no spaces)
          </p>
        </div>

        <div>
          <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
            License Number
          </label>
          <input
            type="text"
            id="licenseNumber"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleChange}
            className={`w-full px-4 py-3 border ${
              errors.licenseNumber ? 'border-red-300' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder="ABC123"
            maxLength={6}
          />
          {errors.licenseNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.licenseNumber}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Maximum 6 characters
          </p>
        </div>

        <div>
          <label htmlFor="agencyName" className="block text-sm font-medium text-gray-700 mb-1">
            Agency Name
          </label>
          <input
            type="text"
            id="agencyName"
            name="agencyName"
            value={formData.agencyName}
            onChange={handleChange}
            className={`w-full px-4 py-3 border ${
              errors.agencyName ? 'border-red-300' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder="Your Insurance Agency"
          />
          {errors.agencyName && (
            <p className="mt-1 text-sm text-red-600">{errors.agencyName}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          style={{ height: '44px' }}
        >
          {isSubmitting ? 'Creating Account...' : 'Continue'}
        </button>

        <div className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/agent/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Log in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default RegisterForm;
