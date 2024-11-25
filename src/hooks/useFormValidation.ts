import { useState, useCallback } from 'react';
import { ValidationRule, ValidationResult } from '@/types/utils';

interface ValidationRules<T> {
  [key: string]: ValidationRule<T[keyof T]>;
}

interface UseFormValidationResult<T> {
  errors: Partial<Record<keyof T, string>>;
  validateField: (field: keyof T, value: T[keyof T]) => ValidationResult;
  validateForm: (data: T) => boolean;
  clearErrors: () => void;
  setFieldError: (field: keyof T, message: string) => void;
}

export function useFormValidation<T extends Record<string, any>>(
  rules: ValidationRules<T>
): UseFormValidationResult<T> {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const validateField = useCallback(
    (field: keyof T, value: T[keyof T]): ValidationResult => {
      const rule = rules[field as string];
      if (!rule) {
        return { valid: true };
      }

      const result = rule.validate(value);
      if (!result.valid && result.message) {
        setErrors((prev) => ({ ...prev, [field]: result.message }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }

      return result;
    },
    [rules]
  );

  const validateForm = useCallback(
    (data: T): boolean => {
      const newErrors: Partial<Record<keyof T, string>> = {};
      let isValid = true;

      Object.keys(rules).forEach((field) => {
        const result = validateField(field as keyof T, data[field as keyof T]);
        if (!result.valid && result.message) {
          newErrors[field as keyof T] = result.message;
          isValid = false;
        }
      });

      setErrors(newErrors);
      return isValid;
    },
    [rules, validateField]
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setFieldError = useCallback((field: keyof T, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  return {
    errors,
    validateField,
    validateForm,
    clearErrors,
    setFieldError,
  };
}

// Common validation rules
export const commonValidationRules = {
  required: (message = 'This field is required'): ValidationRule<any> => ({
    validate: (value: any) => ({
      valid: value !== undefined && value !== null && value !== '',
      message,
    }),
    message,
  }),

  email: (message = 'Invalid email address'): ValidationRule<string> => ({
    validate: (value: string) => ({
      valid: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value),
      message,
    }),
    message,
  }),

  minLength: (length: number, message?: string): ValidationRule<string> => ({
    validate: (value: string) => ({
      valid: value.length >= length,
      message: message || `Minimum length is ${length} characters`,
    }),
    message: message || `Minimum length is ${length} characters`,
  }),

  maxLength: (length: number, message?: string): ValidationRule<string> => ({
    validate: (value: string) => ({
      valid: value.length <= length,
      message: message || `Maximum length is ${length} characters`,
    }),
    message: message || `Maximum length is ${length} characters`,
  }),

  pattern: (regex: RegExp, message: string): ValidationRule<string> => ({
    validate: (value: string) => ({
      valid: regex.test(value),
      message,
    }),
    message,
  }),

  numeric: (message = 'Must be a number'): ValidationRule<string> => ({
    validate: (value: string) => ({
      valid: /^\d+$/.test(value),
      message,
    }),
    message,
  }),

  custom: <T>(
    validateFn: (value: T) => boolean,
    message: string
  ): ValidationRule<T> => ({
    validate: (value: T) => ({
      valid: validateFn(value),
      message,
    }),
    message,
  }),
};
