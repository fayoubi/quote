import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">TwinzTech</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-600 hover:text-primary-600 transition-colors">
              Get Quote
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-primary-600 transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-primary-600 transition-colors">
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
