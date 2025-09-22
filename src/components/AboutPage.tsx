import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle,
  Users,
  Shield,
  Zap,
  BarChart3,
  Globe,
  Award,
  Mail,
  Phone
} from 'lucide-react';

const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  const platformFeatures = [
    {
      icon: Zap,
      title: "Digital Enrollment",
      description: "Streamlined application and quote generation in minutes, not days",
      status: "Available"
    },
    {
      icon: Shield,
      title: "Smart Underwriting",
      description: "Modern risk assessment tools with automated decision engines",
      status: "Coming Soon"
    },
    {
      icon: BarChart3,
      title: "Policy Management",
      description: "End-to-end policy lifecycle management and administration",
      status: "Coming Soon"
    },
    {
      icon: Globe,
      title: "Business Analytics",
      description: "Intelligence and reporting tools to grow your business",
      status: "Coming Soon"
    }
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Speed",
      description: "Reduce quote-to-policy time from weeks to minutes"
    },
    {
      icon: Shield,
      title: "Efficiency",
      description: "Automated workflows eliminate manual processes"
    },
    {
      icon: Globe,
      title: "Modern Technology",
      description: "API-first platform built for today's digital world"
    },
    {
      icon: Award,
      title: "Comprehensive",
      description: "End-to-end solution eliminating multiple vendors"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              YadmanX
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-4">
              Revolutionizing Insurance Operations
            </p>
            <p className="text-lg text-primary-200 mb-8 max-w-3xl mx-auto">
              A comprehensive digital platform that empowers insurance agents and brokers
              to deliver exceptional customer experiences while streamlining business operations.
            </p>
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
          </div>
        </div>
      </div>

      {/* Platform Overview */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              End-to-End Insurance Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built specifically for insurance professionals who want to modernize their operations
              and deliver superior customer experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {platformFeatures.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-xl mb-4">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {feature.description}
                </p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  feature.status === 'Available'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {feature.status === 'Available' && <CheckCircle className="w-4 h-4 mr-1" />}
                  {feature.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose YadmanX */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose YadmanX?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Move beyond legacy systems and embrace the future of insurance technology.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-100 text-accent-600 rounded-xl mb-4">
                  <benefit.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-xl text-gray-600 mb-6">
                To transform the insurance industry by providing agents and brokers with
                modern, efficient, and comprehensive digital tools that enhance customer
                experiences and drive business growth.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-gray-600">
                    Eliminate inefficiencies in traditional insurance processes
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-gray-600">
                    Empower agents with data-driven insights and automation
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-gray-600">
                    Deliver exceptional customer experiences at every touchpoint
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-100 rounded-xl p-8">
              <blockquote className="text-xl italic text-gray-700 mb-4">
                "The insurance industry is ready for transformation. YadmanX provides
                the technology foundation that agents and brokers need to compete
                and thrive in the digital age."
              </blockquote>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  YX
                </div>
                <div>
                  <p className="font-semibold text-gray-900">YadmanX Team</p>
                  <p className="text-gray-600">Under TwinzTech Management</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About TwinzTech */}
      <div className="py-16 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Backed by TwinzTech
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              YadmanX operates under TwinzTech management, bringing together industry
              expertise and cutting-edge technology to deliver innovative insurtech solutions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Users className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Team</h3>
              <p className="text-gray-600">
                Industry veterans with deep insurance and technology expertise
              </p>
            </div>
            <div className="text-center">
              <Shield className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Proven Track Record</h3>
              <p className="text-gray-600">
                Successful history of building and scaling technology platforms
              </p>
            </div>
            <div className="text-center">
              <Globe className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Innovation Focus</h3>
              <p className="text-gray-600">
                Commitment to advancing the future of insurance technology
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact & Get Started */}
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
    </div>
  );
};

export default AboutPage;