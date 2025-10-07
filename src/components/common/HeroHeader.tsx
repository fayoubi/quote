import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface HeroHeaderProps {
  title?: string;
  subtitle?: string;
  description?: string;
  showButtons?: boolean;
}

const HeroHeader: React.FC<HeroHeaderProps> = ({
  title = "YadmanX",
  subtitle = "Your Insurance Solution",
  description = "Get instant quotes and start your application in minutes.",
  showButtons = true
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-primary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {title}
          </h1>
          <p className="text-xl md:text-2xl text-primary-100 mb-4">
            {subtitle}
          </p>
          <p className="text-lg text-primary-200 mb-8 max-w-3xl mx-auto">
            {description}
          </p>
          {showButtons && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/')}
                className="bg-accent-500 hover:bg-accent-600 text-white px-8 py-3 rounded-lg font-semibold flex items-center justify-center"
              >
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="border-2 border-white text-white hover:bg-white hover:text-primary-900 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Request Demo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroHeader;
