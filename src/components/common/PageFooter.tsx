import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, Phone } from 'lucide-react';

const PageFooter: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="py-16 bg-primary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Insurance Operations?
          </h2>
          <p className="text-xl text-primary-200 max-w-3xl mx-auto">
            Join forward-thinking insurance professionals who are already modernizing
            their businesses with YadmanX.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="text-center">
            <h3 className="text-2xl font-semibold mb-4">Get Started Today</h3>
            <p className="text-primary-200 mb-6">
              Experience our platform with a live demo and see how YadmanX
              can transform your insurance operations.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-accent-500 hover:bg-accent-600 text-white px-8 py-3 rounded-lg font-semibold inline-flex items-center"
            >
              Start Your Quote <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </div>

          <div className="text-center">
            <h3 className="text-2xl font-semibold mb-4">Contact Our Team</h3>
            <p className="text-primary-200 mb-6">
              Speak with our insurance technology experts to learn more about
              how YadmanX can benefit your specific business needs.
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <Mail className="w-5 h-5 mr-3" />
                <span>contact@yadmanx.com</span>
              </div>
              <div className="flex items-center justify-center">
                <Phone className="w-5 h-5 mr-3" />
                <span>1-800-YADMANX</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageFooter;
