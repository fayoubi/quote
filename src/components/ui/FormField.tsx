import React from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ label, required, hint, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-600">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
  </div>
);

export default FormField;
