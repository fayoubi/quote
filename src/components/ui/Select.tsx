import React from 'react';
import clsx from 'clsx';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={clsx('w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white', className)}
      {...props}
    >
      {children}
    </select>
  );
});
Select.displayName = 'Select';

export default Select;
