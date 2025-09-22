import React from 'react';
import clsx from 'clsx';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label: React.FC<LabelProps> = ({ className, ...props }) => (
  <label className={clsx('block text-sm font-medium text-gray-700 mb-2', className)} {...props} />
);

export default Label;
