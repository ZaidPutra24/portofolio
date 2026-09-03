import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '@/context/AdminContext';

export function useAdminForm<T extends Record<string, unknown>>(initialValues: T) {
  const [initialData, setInitialData] = useState<T>(initialValues);
  const [formData, setFormData] = useState<T>(initialValues);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { setIsDirty } = useAdmin();

  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

  useEffect(() => {
    setIsDirty(isDirty);
  }, [isDirty, setIsDirty]);

  const setInitial = useCallback((data: T) => {
    setInitialData(data);
    setFormData(data);
    setIsDirty(false);
  }, [setIsDirty]);

  return {
    formData,
    setFormData,
    initialData,
    setInitial,
    isDirty,
    saving,
    setSaving,
    message,
    setMessage,
  };
}

export function confirmDelete(itemName?: string): boolean {
  const nameStr = itemName ? ` "${itemName}"` : ' this item';
  return window.confirm(`Are you sure you want to delete${nameStr}?`);
}
