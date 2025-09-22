import React from 'react';
import clsx from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const base = 'inline-flex items-center justify-center font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
  secondary: 'bg-white text-primary-700 border border-primary-600 hover:bg-primary-50 focus:ring-primary-500',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-300',
  outline: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-300'
};
const sizeStyles: Record<ButtonSize, string> = {
  sm: 'text-sm px-3 py-2',
  md: 'text-sm px-4 py-2.5',
  lg: 'text-base px-5 py-3'
};

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', fullWidth, className, ...props }) => {
  return (
    <button
      className={clsx(base, variantStyles[variant], sizeStyles[size], fullWidth && 'w-full', className)}
      {...props}
    />
  );
};

export default Button;
