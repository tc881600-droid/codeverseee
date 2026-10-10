import React from 'react';
import { Button as BaseButton } from './ui';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function AnimatedButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  ...props
}: AnimatedButtonProps) {
  const baseClasses = 'btn-primary relative overflow-hidden font-semibold transition-all duration-300';

  const variantClasses = {
    primary: 'bg-gradient-to-r from-jade to-emerald-600 text-white hover:shadow-lg hover:shadow-jade/50',
    secondary: 'bg-gradient-to-r from-sky to-blue-600 text-white hover:shadow-lg hover:shadow-sky/50',
    outline: 'border-2 border-jade text-jade hover:bg-jade hover:text-white',
    ghost: 'text-fog hover:bg-white/10',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-xl',
  };

  return (
    <BaseButton
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </span>
      ) : (
        <span className="flex items-center gap-2 relative z-10">
          {icon}
          {children}
        </span>
      )}
    </BaseButton>
  );
}
