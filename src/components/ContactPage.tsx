import React, { useMemo, useState } from 'react';
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
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-semibold text-gray-900 mb-6">Contact YadmanX</h1>
      <p className="text-gray-600 mb-8">We are based in Europe. Please include your country code in the phone number (e.g. +33, +49, +34). Fields marked with * are required.</p>

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
  );
};

export default ContactPage;


