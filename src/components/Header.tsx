import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAgentAuth } from '../context/AgentAuthContext';

const Header: React.FC = () => {
  const { isAuthenticated, agent } = useAgentAuth();
  const navigate = useNavigate();

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate('/agent/dashboard');
    } else {
      navigate('/agent/login');
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <a href="#" onClick={handleLogoClick} className="flex items-center space-x-2 cursor-pointer">
            <Shield className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">YadmanX</span>
          </a>
          <nav className="hidden md:flex items-center space-x-6">
            {isAuthenticated && agent && (
              <span className="text-gray-700 font-medium">
                {agent.firstName} {agent.lastName}
              </span>
            )}
            <Link to="/about" className="text-gray-600 hover:text-primary-600 transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-primary-600 transition-colors">
              Contact
            </Link>
            {isAuthenticated && (
              <Link to="/agent/dashboard" className="text-gray-600 hover:text-primary-600 transition-colors">
                Dashboard
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
