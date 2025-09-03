import React, { useMemo, useState } from 'react';

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

    const to = 'contact@twinztech.com';
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
      <h1 className="text-3xl font-semibold text-gray-900 mb-6">Contact TwinzTech</h1>
      <p className="text-gray-600 mb-8">We are based in Europe. Please include your country code in the phone number (e.g. +33, +49, +34). Fields marked with * are required.</p>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl shadow">
        <div>
          <label className="block text-sm text-gray-700 mb-2">First name *</label>
          <input className="input-field" value={form.firstName} onChange={(e)=>update('firstName', e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-2">Last name *</label>
          <input className="input-field" value={form.lastName} onChange={(e)=>update('lastName', e.target.value)} required />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-2">Email *</label>
          <input type="email" className="input-field" value={form.email} onChange={(e)=>update('email', e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-2">Company *</label>
          <input className="input-field" value={form.company} onChange={(e)=>update('company', e.target.value)} required />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-2">Phone (incl. country code)</label>
          <input className="input-field" inputMode="tel" placeholder="e.g. +44 20 7946 0958" value={form.phone} onChange={(e)=>update('phone', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-2">Your role/function</label>
          <input className="input-field" value={form.role} onChange={(e)=>update('role', e.target.value)} />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm text-gray-700 mb-2">Interested in connecting with *</label>
          <div className="relative">
            <select className="input-field appearance-none" value={form.topic} onChange={(e)=>update('topic', e.target.value)} required>
              <option value="">Please select</option>
              {topics.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm text-gray-700 mb-2">Additional details</label>
          <textarea className="input-field h-32" value={form.details} onChange={(e)=>update('details', e.target.value)} placeholder="Tell us about your needs" />
        </div>

        <div className="md:col-span-2 flex items-start space-x-3">
          <input type="checkbox" id="agree" checked={form.agree} onChange={(e)=>update('agree', e.target.checked)} className="mt-1 w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
          <label htmlFor="agree" className="text-sm text-gray-700">I agree to TwinzTech’s privacy policy.</label>
        </div>

        <div className="md:col-span-2">
          <button type="submit" disabled={!isValid} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default ContactPage;
