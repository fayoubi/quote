import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, Phone } from 'lucide-react';
import Card from './ui/Card';
import FormField from './ui/FormField';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone: string; // international format preferred
  role: string;
  topic: string;
  details: string;
  agree: boolean;
}

const topics = [
  'Sales enquiry',
  'Partnership',
  'Support',
  'Media / PR',
  'Other'
];

const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<ContactFormData>({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: '',
    role: '',
    topic: '',
    details: '',
    agree: false,
  });

  const isValid = useMemo(() => {
    return (
      form.firstName.trim() &&
      form.lastName.trim() &&
      /.+@.+\..+/.test(form.email) &&
      form.company.trim() &&
      form.topic.trim() &&
      form.agree
    );
  }, [form]);

  const update = (k: keyof ContactFormData, v: string | boolean) => {
    setForm(prev => ({ ...prev, [k]: v }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const to = 'contact@yadmanx.com';
    const subject = encodeURIComponent(`Contact enquiry (${form.topic}) - ${form.firstName} ${form.lastName}`);
    const lines = [
      `Name: ${form.firstName} ${form.lastName}`,
      `Email: ${form.email}`,
      `Company: ${form.company}`,
      `Role: ${form.role || '—'}`,
      `Phone: ${form.phone || '—'}`,
      `Topic: ${form.topic}`,
      '',
      'Details:',
      form.details || '—',
    ];
    const body = encodeURIComponent(lines.join('\n'));
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  };

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
              Get in Touch
            </p>
            <p className="text-lg text-primary-200 mb-8 max-w-3xl mx-auto">
              Have questions about our platform? Want to schedule a demo? We'd love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/')}
                className="bg-accent-500 hover:bg-accent-600 text-white px-8 py-3 rounded-lg font-semibold flex items-center justify-center"
              >
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/about')}
                className="border-2 border-white text-white hover:bg-white hover:text-primary-900 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">Contact YadmanX</h2>
            <p className="text-gray-600">We are based in Europe. Please include your country code in the phone number (e.g. +33, +49, +34). Fields marked with * are required.</p>
          </div>

          <Card className="p-6">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="First name" required>
                <Input value={form.firstName} onChange={(e)=>update('firstName', e.target.value)} required />
              </FormField>
              <FormField label="Last name" required>
                <Input value={form.lastName} onChange={(e)=>update('lastName', e.target.value)} required />
              </FormField>

              <FormField label="Email" required>
                <Input type="email" value={form.email} onChange={(e)=>update('email', e.target.value)} required />
              </FormField>
              <FormField label="Company" required>
                <Input value={form.company} onChange={(e)=>update('company', e.target.value)} required />
              </FormField>

              <FormField label="Phone (incl. country code)">
                <Input inputMode="tel" placeholder="e.g. +44 20 7946 0958" value={form.phone} onChange={(e)=>update('phone', e.target.value)} />
              </FormField>
              <FormField label="Your role/function">
                <Input value={form.role} onChange={(e)=>update('role', e.target.value)} />
              </FormField>

              <div className="md:col-span-2">
                <FormField label="Interested in connecting with" required>
                  <Select value={form.topic} onChange={(e)=>update('topic', e.target.value)} required>
                    <option value="">Please select</option>
                    {topics.map(t => <option key={t} value={t}>{t}</option>)}
                  </Select>
                </FormField>
              </div>

              <div className="md:col-span-2">
                <FormField label="Additional details" hint="Tell us about your needs">
                  <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent h-32" value={form.details} onChange={(e)=>update('details', e.target.value)} />
                </FormField>
              </div>

              <div className="md:col-span-2 flex items-start space-x-3">
                <input type="checkbox" id="agree" checked={form.agree} onChange={(e)=>update('agree', e.target.checked)} className="mt-1 w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
                <label htmlFor="agree" className="text-sm text-gray-700">I agree to YadmanX's privacy policy.</label>
              </div>

              <div className="md:col-span-2">
                <Button type="submit" disabled={!isValid} className="w-full">Submit</Button>
              </div>
            </form>
          </Card>
        </div>
      </div>

      {/* Footer Section */}
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

export default ContactPage;


