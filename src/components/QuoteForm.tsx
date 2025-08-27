import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, ChevronDown } from 'lucide-react';

interface QuoteFormData {
  gender: 'male' | 'female';
  birthdate: string;
  heightCm: string;
  weightKg: string;
  city: string;
  usesNicotine: boolean;
}

const QuoteForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<QuoteFormData>({
    gender: 'male',
    birthdate: '',
    heightCm: '',
    weightKg: '',
    city: '',
    usesNicotine: false,
  });

  // Top 10 Moroccan cities by population
  const moroccanCities = [
    { name: 'Casablanca', population: '3,359,818' },
    { name: 'Rabat', population: '577,827' },
    { name: 'Fez', population: '1,112,072' },
    { name: 'Marrakech', population: '928,850' },
    { name: 'Agadir', population: '421,844' },
    { name: 'Tangier', population: '947,952' },
    { name: 'Meknes', population: '632,079' },
    { name: 'Oujda', population: '494,252' },
    { name: 'Kenitra', population: '431,282' },
    { name: 'Tetouan', population: '380,787' }
  ];

  const handleInputChange = (field: keyof QuoteFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Form submitted with metric units:', {
      gender: formData.gender,
      birthdate: formData.birthdate,
      heightCm: formData.heightCm,
      weightKg: formData.weightKg,
      city: formData.city,
      usesNicotine: formData.usesNicotine
    });
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

            {/* Height in Centimeters */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Height (cm)
              </label>
              <div className="relative">
                <select
                  value={formData.heightCm}
                  onChange={(e) => handleInputChange('heightCm', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-white/50 appearance-none"
                  required
                >
                  <option value="">Select height</option>
                  <option value="120">120 cm (3'11")</option>
                  <option value="125">125 cm (4'1")</option>
                  <option value="130">130 cm (4'3")</option>
                  <option value="135">135 cm (4'5")</option>
                  <option value="140">140 cm (4'7")</option>
                  <option value="145">145 cm (4'9")</option>
                  <option value="150">150 cm (4'11")</option>
                  <option value="155">155 cm (5'1")</option>
                  <option value="160">160 cm (5'3")</option>
                  <option value="165">165 cm (5'5")</option>
                  <option value="170">170 cm (5'7")</option>
                  <option value="175">175 cm (5'9")</option>
                  <option value="180">180 cm (5'11")</option>
                  <option value="185">185 cm (6'1")</option>
                  <option value="190">190 cm (6'3")</option>
                  <option value="195">195 cm (6'5")</option>
                  <option value="200">200 cm (6'7")</option>
                  <option value="205">205 cm (6'9")</option>
                  <option value="210">210 cm (6'11")</option>
                  <option value="215">215 cm (7'1")</option>
                  <option value="220">220 cm (7'3")</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Weight in Kilograms */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                value={formData.weightKg}
                onChange={(e) => handleInputChange('weightKg', e.target.value)}
                placeholder="Enter weight in kilograms"
                className="w-full px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-white/50"
                required
              />
            </div>

            {/* Moroccan Cities */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                City
              </label>
              <div className="relative">
                <select
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-white/50 appearance-none"
                  required
                >
                  <option value="">Select your city</option>
                  {moroccanCities.map((city, index) => (
                    <option key={city.name} value={city.name}>
                      {index + 1}. {city.name} ({city.population} inhabitants)
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
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
