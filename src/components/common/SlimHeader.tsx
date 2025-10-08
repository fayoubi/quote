import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';

const SlimHeader: React.FC = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/agent/login';

  return (
    <header className="bg-primary-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-white" />
            <span className="text-xl font-bold text-white">YadmanX</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-white/90 hover:text-white transition-colors font-medium"
            >
              Get Quote
            </Link>
            <Link
              to="/about"
              className="text-white/90 hover:text-white transition-colors font-medium"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-white/90 hover:text-white transition-colors font-medium"
            >
              Contact
            </Link>
            <Link
              to="/agent/login"
              className="bg-white text-primary-900 hover:bg-primary-50 px-6 py-2 rounded-lg font-semibold transition-colors shadow-sm"
            >
              Agent Login
            </Link>
          </nav>

          {/* Mobile menu button - could be added later */}
          <div className="md:hidden">
            <Link
              to="/agent/login"
              className="bg-white text-primary-900 hover:bg-primary-50 px-4 py-2 rounded-lg font-semibold text-sm"
            >
              Agent Login
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SlimHeader;
