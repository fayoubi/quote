import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, ChevronDown } from 'lucide-react';

interface QuoteFormData {
  gender: 'male' | 'female';
  birthdate: string;
  height: string;
  weight: string;
  zipCode: string;
  usesNicotine: boolean;
}

const QuoteForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<QuoteFormData>({
    gender: 'male',
    birthdate: '',
    height: '',
    weight: '',
    zipCode: '',
    usesNicotine: false,
  });

  const handleInputChange = (field: keyof QuoteFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Form submitted:', formData);
    navigate('/quote');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Section - Marketing Content */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-serif font-bold text-primary-900 mb-4">
              Get a No Exam Term Life Insurance Quote
            </h1>
            <p className="text-lg text-gray-700 mb-6">
              Apply online in minutes. Get an instant decision. Then personalize your coverage.
            </p>
          </div>
          
          <div className="bg-gray-100 rounded-lg p-6">
            <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-gray-500">Family Image Placeholder</span>
            </div>
            <p className="text-sm text-gray-600">
              Secure, fast, and reliable term life insurance coverage for you and your family.
            </p>
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="bg-primary-900 rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Gender Selection */}
            <div>
              <div className="flex space-x-2 mb-2">
                <button
                  type="button"
                  onClick={() => handleInputChange('gender', 'male')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    formData.gender === 'male'
                      ? 'bg-white text-gray-900'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('gender', 'female')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    formData.gender === 'female'
                      ? 'bg-white text-gray-900'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  Female
                </button>
                <button
                  type="button"
                  className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Birthdate */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Birthdate
              </label>
              <input
                type="date"
                value={formData.birthdate}
                onChange={(e) => handleInputChange('birthdate', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-white/50"
                required
              />
            </div>

            {/* Height */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Height
              </label>
              <div className="relative">
                <select
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-white/50 appearance-none"
                  required
                >
                  <option value="">Select height</option>
                  <option value="4-0">4'0"</option>
                  <option value="4-1">4'1"</option>
                  <option value="4-2">4'2"</option>
                  <option value="4-3">4'3"</option>
                  <option value="4-4">4'4"</option>
                  <option value="4-5">4'5"</option>
                  <option value="4-6">4'6"</option>
                  <option value="4-7">4'7"</option>
                  <option value="4-8">4'8"</option>
                  <option value="4-9">4'9"</option>
                  <option value="4-10">4'10"</option>
                  <option value="4-11">4'11"</option>
                  <option value="5-0">5'0"</option>
                  <option value="5-1">5'1"</option>
                  <option value="5-2">5'2"</option>
                  <option value="5-3">5'3"</option>
                  <option value="5-4">5'4"</option>
                  <option value="5-5">5'5"</option>
                  <option value="5-6">5'6"</option>
                  <option value="5-7">5'7"</option>
                  <option value="5-8">5'8"</option>
                  <option value="5-9">5'9"</option>
                  <option value="5-10">5'10"</option>
                  <option value="5-11">5'11"</option>
                  <option value="6-0">6'0"</option>
                  <option value="6-1">6'1"</option>
                  <option value="6-2">6'2"</option>
                  <option value="6-3">6'3"</option>
                  <option value="6-4">6'4"</option>
                  <option value="6-5">6'5"</option>
                  <option value="6-6">6'6"</option>
                  <option value="6-7">6'7"</option>
                  <option value="6-8">6'8"</option>
                  <option value="6-9">6'9"</option>
                  <option value="6-10">6'10"</option>
                  <option value="6-11">6'11"</option>
                  <option value="7-0">7'0"</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Weight */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Weight (lbs)
              </label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                placeholder="Enter weight"
                className="w-full px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-white/50"
                required
              />
            </div>

            {/* Zip Code */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Zip Code
              </label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                placeholder="Enter zip code"
                className="w-full px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-white/50"
                required
              />
            </div>

            {/* Nicotine Checkbox */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="nicotine"
                checked={formData.usesNicotine}
                onChange={(e) => handleInputChange('usesNicotine', e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
              />
              <label htmlFor="nicotine" className="text-white text-sm">
                I currently use nicotine products
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-accent-500 hover:bg-accent-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200"
            >
              Continue for no exam quote
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuoteForm;
