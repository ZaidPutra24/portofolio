'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

interface SettingItem {
  key: string;
  value?: string;
  description?: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [initialValues, setInitialValues] = useState<Record<string, string>>({});
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      try {
        const res = await fetch(`${apiUrl}/api/v1/settings`);
        if (res.ok) {
          const data: SettingItem[] = await res.json();
          setSettings(data);
          const values: Record<string, string> = {};
          data.forEach((s) => {
            values[s.key] = s.value || '';
          });
          setInitialValues(values);
          setFormValues(values);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setFormValues({ ...formValues, [key]: value });
  };

  const handleSave = async (key: string, description?: string) => {
    if (savingKey) return; // Prevent double click
    const currentValue = formValues[key] !== undefined ? formValues[key] : '';
    const originalValue = initialValues[key] !== undefined ? initialValues[key] : '';

    if (currentValue === originalValue) {
      setMessage({ type: 'error', text: `No changes to save for setting '${key}'.` });
      return;
    }

    setSavingKey(key);
    setMessage(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const token = localStorage.getItem('admin_token');

    try {
      const res = await fetch(`${apiUrl}/api/v1/settings/${key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value: currentValue, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to update setting');

      setMessage({ type: 'success', text: `Setting '${key}' updated successfully!` });
      setInitialValues({ ...initialValues, [key]: currentValue });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating setting';
      setMessage({ type: 'error', text: errorMessage });
      // Keep user changes intact
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20 text-slate-500">
          <span className="material-symbols-outlined animate-spin mr-2">sync</span> Loading settings...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {/* Header Actions */}
        <div className="flex justify-between items-end pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">System Settings</h1>
            <p className="text-xs text-slate-500">Manage global configuration keys and system parameters</p>
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg text-sm flex items-center gap-3 border ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <span className="material-symbols-outlined">{message.type === 'success' ? 'check_circle' : 'error'}</span>
            <span>{message.text}</span>
          </div>
        )}

        <div className="space-y-6">
          {settings.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-400 text-sm shadow-sm">
              <span className="material-symbols-outlined text-3xl mb-1 opacity-40">settings</span>
              <p>No settings found.</p>
            </div>
          ) : (
            settings.map((s) => {
              const isItemDirty = (formValues[s.key] !== undefined ? formValues[s.key] : '') !== (initialValues[s.key] !== undefined ? initialValues[s.key] : '');
              const isSavingThis = savingKey === s.key;

              return (
                <div
                  key={s.key}
                  className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wider">{s.key}</h3>
                      {s.description && <p className="text-xs text-slate-500 mt-0.5">{s.description}</p>}
                    </div>
                    {isItemDirty && <span className="text-xs font-mono text-amber-600 font-semibold">Unsaved changes</span>}
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={formValues[s.key] !== undefined ? formValues[s.key] : s.value || ''}
                      onChange={(e) => handleChange(s.key, e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => handleSave(s.key, s.description)}
                      disabled={isSavingThis || !isItemDirty}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSavingThis ? (
                        <>
                          <span className="material-symbols-outlined animate-spin text-sm">sync</span> Saving...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-sm">save</span> Save
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
