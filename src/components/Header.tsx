import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-primary-900 shadow-sm border-b border-primary-800">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-white" />
            <span className="text-lg font-bold text-white">YadmanX</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-white/80 hover:text-white transition-colors text-sm">
              Get Quote
            </Link>
            <Link to="/about" className="text-white/80 hover:text-white transition-colors text-sm">
              About
            </Link>
            <Link to="/contact" className="text-white/80 hover:text-white transition-colors text-sm">
              Contact
            </Link>
            <Link to="/agent/login" className="bg-white text-primary-900 hover:bg-primary-100 px-4 py-1.5 rounded-lg font-semibold transition-colors text-sm">
              Agent Login
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
