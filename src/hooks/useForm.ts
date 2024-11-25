import { useState, useCallback, ChangeEvent, FormEvent } from 'react';
import { ValidationRule, ValidationResult } from '@/types/utils';
import { useFormValidation } from './useFormValidation';

interface UseFormOptions<T> {
  initialValues: T;
  validationRules?: Record<keyof T, ValidationRule<T[keyof T]>>;
  onSubmit?: (values: T) => void | Promise<void>;
  resetOnSubmit?: boolean;
}

interface UseFormResult<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  setFieldValue: (field: keyof T, value: T[keyof T]) => void;
  setFieldTouched: (field: keyof T, isTouched?: boolean) => void;
  setFieldError: (field: keyof T, error: string) => void;
  resetForm: () => void;
  validateField: (field: keyof T) => ValidationResult;
  validateForm: () => boolean;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validationRules = {} as Record<keyof T, ValidationRule<T[keyof T]>>,
  onSubmit,
  resetOnSubmit = false,
}: UseFormOptions<T>): UseFormResult<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const {
    errors,
    validateField: validateFieldBase,
    validateForm: validateFormBase,
    setFieldError,
  } = useFormValidation<T>(validationRules);

  const validateField = useCallback(
    (field: keyof T) => {
      return validateFieldBase(field, values[field]);
    },
    [validateFieldBase, values]
  );

  const validateForm = useCallback(() => {
    return validateFormBase(values);
  }, [validateFormBase, values]);

  const setFieldValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setValues(prev => {
      const newValues = { ...prev, [field]: value };
      return newValues;
    });
    setIsDirty(true);
    validateField(field);
  }, [validateField]);

  const setFieldTouched = useCallback((field: keyof T, isTouched = true) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }));
  }, []);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const fieldValue = type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked
        : type === 'number'
        ? parseFloat(value)
        : value;
      
      setFieldValue(name as keyof T, fieldValue as T[keyof T]);
    },
    [setFieldValue]
  );

  const handleBlur = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name } = e.target;
      setFieldTouched(name as keyof T);
      validateField(name as keyof T);
    },
    [setFieldTouched, validateField]
  );

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsSubmitting(true);

      const isValid = validateForm();
      if (!isValid) {
        // Mark all fields as touched when form is invalid
        const allTouched = Object.keys(values).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {}
        );
        setTouched(allTouched);
        setIsSubmitting(false);
        return;
      }

      try {
        await onSubmit?.(values);
        if (resetOnSubmit) {
          setValues(initialValues);
          setTouched({});
          setIsDirty(false);
        }
      } catch (error) {
        // Handle submission error
        if (error instanceof Error) {
          setFieldError('submit' as keyof T, error.message);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [validateForm, values, onSubmit, initialValues, resetOnSubmit, setFieldError]
  );

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setTouched({});
    setIsDirty(false);
  }, [initialValues]);

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldTouched,
    setFieldError,
    resetForm,
    validateField,
    validateForm,
  };
}
