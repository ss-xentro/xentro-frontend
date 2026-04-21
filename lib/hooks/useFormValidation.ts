import { useState, useCallback } from 'react';

type ValidationRule<T> = {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    validate?: (value: T) => string | undefined;
};

type FieldRules<T extends Record<string, unknown>> = {
    [K in keyof T]?: ValidationRule<T[K]>;
};

type FieldErrors<T extends Record<string, unknown>> = Partial<Record<keyof T, string>>;

export function useFormValidation<T extends Record<string, unknown>>(rules: FieldRules<T>) {
    const [errors, setErrors] = useState<FieldErrors<T>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

    const validate = useCallback(
        (data: T): boolean => {
            const newErrors: FieldErrors<T> = {};
            for (const key in rules) {
                const rule = rules[key];
                const value = data[key];
                if (!rule) continue;

                if (rule.required && (value === undefined || value === null || value === '')) {
                    newErrors[key] = 'This field is required';
                    continue;
                }
                if (typeof value === 'string') {
                    if (rule.minLength !== undefined && value.length < rule.minLength) {
                        newErrors[key] = `Must be at least ${rule.minLength} characters`;
                        continue;
                    }
                    if (rule.maxLength !== undefined && value.length > rule.maxLength) {
                        newErrors[key] = `Must be at most ${rule.maxLength} characters`;
                        continue;
                    }
                    if (rule.pattern && !rule.pattern.test(value)) {
                        newErrors[key] = 'Invalid format';
                        continue;
                    }
                }
                if (rule.validate) {
                    const msg = rule.validate(value as T[typeof key]);
                    if (msg) {
                        newErrors[key] = msg;
                        continue;
                    }
                }
            }
            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        },
        [rules],
    );

    const touchField = useCallback((field: keyof T) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
    }, []);

    const getFieldError = useCallback(
        (field: keyof T): string | undefined => {
            return touched[field] ? errors[field] : undefined;
        },
        [errors, touched],
    );

    const resetValidation = useCallback(() => {
        setErrors({});
        setTouched({});
    }, []);

    return { validate, errors, touched, touchField, getFieldError, resetValidation };
}
