import React from 'react';
import { Input as ShadcnInput, InputProps as ShadcnInputProps } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface InputProps extends ShadcnInputProps {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, error, ...props }, ref) => {
    const inputId = React.useId();
    const uniqueId = id || inputId;

    return (
      <div className="space-y-2">
        {label && <Label htmlFor={uniqueId}>{label}</Label>}
        <ShadcnInput 
          id={uniqueId} 
          ref={ref} 
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${uniqueId}-error` : undefined}
          {...props} 
        />
        {error && (
          <p id={`${uniqueId}-error`} className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;