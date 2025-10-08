import React from 'react';
import SlimHeader from '../../common/SlimHeader';
import PageFooter from '../../common/PageFooter';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Slim Header */}
      <SlimHeader />

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[450px]">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
              {subtitle && (
                <p className="text-sm text-gray-600">{subtitle}</p>
              )}
            </div>
            {children}
          </div>
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>YadmanX Agent Portal</p>
          </div>
        </div>
      </div>

      {/* CTA Footer */}
      <PageFooter />
    </div>
  );
};

export default AuthLayout;
