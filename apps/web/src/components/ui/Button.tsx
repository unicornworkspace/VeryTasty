import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'dark' | 'icon' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const variantClasses = {
  primary:
    'bg-accent text-text-inverse hover:bg-accent-hover active:bg-accent-pressed transition-colors duration-150',
  secondary:
    'bg-transparent border border-border-strong text-text-primary hover:bg-bg-light transition-colors duration-150',
  dark:
    'bg-bg-dark text-text-inverse hover:bg-opacity-90 active:bg-opacity-80 transition-colors duration-150',
  icon:
    'bg-accent text-text-inverse hover:scale-105 active:scale-95 transition-transform duration-150',
  ghost:
    'bg-transparent text-accent hover:underline transition-colors duration-150',
};

const sizeClasses = {
  sm: 'h-9 px-3 text-small min-h-[36px]',
  md: 'h-11 px-4 body min-h-[44px]',
  lg: 'h-12 px-6 h3 min-h-[48px]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'rounded-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
