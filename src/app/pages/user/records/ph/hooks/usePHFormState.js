import { useState, useCallback } from 'react';

export function usePHFormState(initialValues = {}) {
  const [values, setValues] = useState(initialValues);

  const setValue = useCallback((key, value) => {
    setValues(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetValues = useCallback((newValues = {}) => {
    setValues(newValues);
  }, []);

  const getFormData = useCallback(() => {
    const fd = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        fd.set(key, String(value));
      }
    });
    return fd;
  }, [values]);

  return { values, setValue, setValues, resetValues, getFormData };
}
