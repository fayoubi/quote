import React from 'react';
import clsx from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card: React.FC<CardProps> = ({ className, ...props }) => (
  <div className={clsx('bg-white rounded-xl shadow-sm border border-gray-200', className)} {...props} />
);

export default Card;
