import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-slate-400 tracking-wide">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 text-slate-500 shrink-0 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full bg-[#12141c]/80 border ${
              error ? 'border-rose-500 focus:ring-rose-500/20' : 'border-[#242936] focus:border-indigo-500 focus:ring-indigo-500/20'
            } rounded-lg ${
              icon ? 'pl-10' : 'px-3.5'
            } py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-4 transition-all duration-150 ${className}`}
            {...props}
          />
        </div>
        {error && (
          <span className="text-xs text-rose-500 font-medium">
            {error}
          </span>
        )}
        {!error && helperText && (
          <span className="text-xs text-slate-500">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
