import { useState, useCallback } from 'react';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  phone?: boolean;
  min?: number;
  max?: number;
  custom?: (value: any) => string | null;
}

interface FormField {
  value: any;
  error: string | null;
  touched: boolean;
  rules?: ValidationRule;
}

interface UseFormOptions<T> {
  initialValues: T;
  validationRules?: Partial<Record<keyof T, ValidationRule>>;
  onSubmit?: (values: T) => Promise<void> | void;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validationRules = {},
  onSubmit
}: UseFormOptions<T>) {
  const [fields, setFields] = useState<Record<keyof T, FormField>>(() => {
    const initial: Record<keyof T, FormField> = {} as any;
    
    Object.keys(initialValues).forEach(key => {
      initial[key as keyof T] = {
        value: initialValues[key as keyof T],
        error: null,
        touched: false,
        rules: validationRules[key as keyof T]
      };
    });
    
    return initial;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Validation functions
  const validateField = useCallback((name: keyof T, value: any, rules?: ValidationRule): string | null => {
    if (!rules) return null;

    // Required validation
    if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return `${String(name)} is required`;
    }

    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && !value.trim())) {
      return null;
    }

    // String validations
    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        return `${String(name)} must be at least ${rules.minLength} characters`;
      }
      
      if (rules.maxLength && value.length > rules.maxLength) {
        return `${String(name)} must be no more than ${rules.maxLength} characters`;
      }
      
      if (rules.pattern && !rules.pattern.test(value)) {
        return `${String(name)} format is invalid`;
      }
      
      if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Please enter a valid email address';
      }
      
      if (rules.phone && !/^\+?[\d\s-()]+$/.test(value)) {
        return 'Please enter a valid phone number';
      }
    }

    // Number validations
    if (typeof value === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        return `${String(name)} must be at least ${rules.min}`;
      }
      
      if (rules.max !== undefined && value > rules.max) {
        return `${String(name)} must be no more than ${rules.max}`;
      }
    }

    // Custom validation
    if (rules.custom) {
      return rules.custom(value);
    }

    return null;
  }, []);

  const validateForm = useCallback((): boolean => {
    let isValid = true;
    const newFields = { ...fields };

    Object.keys(fields).forEach(key => {
      const field = fields[key as keyof T];
      const error = validateField(key as keyof T, field.value, field.rules);
      
      newFields[key as keyof T] = {
        ...field,
        error,
        touched: true
      };
      
      if (error) {
        isValid = false;
      }
    });

    setFields(newFields);
    return isValid;
  }, [fields, validateField]);

  // Field operations
  const setValue = useCallback((name: keyof T, value: any) => {
    setFields(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        value,
        error: prev[name].touched ? validateField(name, value, prev[name].rules) : null
      }
    }));
  }, [validateField]);

  const setError = useCallback((name: keyof T, error: string | null) => {
    setFields(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        error
      }
    }));
  }, []);

  const touchField = useCallback((name: keyof T) => {
    setFields(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        touched: true,
        error: validateField(name, prev[name].value, prev[name].rules)
      }
    }));
  }, [validateField]);

  const resetForm = useCallback(() => {
    const resetFields: Record<keyof T, FormField> = {} as any;
    
    Object.keys(initialValues).forEach(key => {
      resetFields[key as keyof T] = {
        value: initialValues[key as keyof T],
        error: null,
        touched: false,
        rules: validationRules[key as keyof T]
      };
    });
    
    setFields(resetFields);
    setIsSubmitting(false);
    setSubmitError(null);
  }, [initialValues, validationRules]);

  const setValues = useCallback((values: Partial<T>) => {
    setFields(prev => {
      const newFields = { ...prev };
      
      Object.keys(values).forEach(key => {
        if (key in newFields) {
          newFields[key as keyof T] = {
            ...newFields[key as keyof T],
            value: values[key as keyof T]
          };
        }
      });
      
      return newFields;
    });
  }, []);

  // Get current values
  const getValues = useCallback((): T => {
    const values = {} as T;
    
    Object.keys(fields).forEach(key => {
      values[key as keyof T] = fields[key as keyof T].value;
    });
    
    return values;
  }, [fields]);

  // Get field props for easy binding
  const getFieldProps = useCallback((name: keyof T) => {
    const field = fields[name];
    
    return {
      value: field.value,
      onChange: (value: any) => setValue(name, value),
      onBlur: () => touchField(name),
      error: field.error,
      name: String(name)
    };
  }, [fields, setValue, touchField]);

  // Handle form submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!validateForm()) {
      return;
    }

    if (!onSubmit) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      await onSubmit(getValues());
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, onSubmit, getValues]);

  // Check if form is valid
  const isValid = Object.values(fields).every(field => !field.error);
  const isDirty = Object.values(fields).some(field => field.touched);

  return {
    fields,
    values: getValues(),
    errors: Object.keys(fields).reduce((acc, key) => {
      acc[key as keyof T] = fields[key as keyof T].error;
      return acc;
    }, {} as Record<keyof T, string | null>),
    isValid,
    isDirty,
    isSubmitting,
    submitError,
    setValue,
    setError,
    setValues,
    touchField,
    resetForm,
    getFieldProps,
    handleSubmit,
    validateForm
  };
} 