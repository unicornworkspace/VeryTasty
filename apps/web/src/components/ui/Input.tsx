import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-small font-medium text-text-primary mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-surface border border-border rounded-sm px-4 py-3 text-body text-text-primary placeholder-text-secondary transition-all duration-150',
            'focus:outline-none focus:border-accent focus:ring-2 focus:ring-opacity-20 focus:ring-accent',
            error && 'border-error focus:border-error focus:ring-error',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-small text-error">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-small font-medium text-text-primary mb-2"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full bg-surface border border-border rounded-sm px-4 py-3 text-body text-text-primary placeholder-text-secondary transition-all duration-150 resize-y',
            'focus:outline-none focus:border-accent focus:ring-2 focus:ring-opacity-20 focus:ring-accent',
            error && 'border-error focus:border-error focus:ring-error',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-small text-error">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
