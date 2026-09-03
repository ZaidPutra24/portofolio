'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminForm, confirmDelete } from '@/hooks/useAdminForm';

interface SocialLink {
  id: number;
  platform_name: string;
  url: string;
  icon_name?: string;
  order_index: number;
  is_active: boolean;
}

const initialSocialForm = {
  platform_name: '',
  url: '',
  icon_name: '',
  order_index: 0,
  is_active: true,
};

export default function AdminSocialPage() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLinkId, setEditingLinkId] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    formData,
    setFormData,
    setInitial,
    isDirty,
    saving,
    setSaving,
    message,
    setMessage,
  } = useAdminForm(initialSocialForm);

  const fetchLinks = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    try {
      const res = await fetch(`${apiUrl}/api/v1/social`);
      if (res.ok) {
        const data = await res.json();
        setLinks(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData({ ...formData, [name]: checked });
    } else if (name === 'order_index') {
      setFormData({ ...formData, [name]: value === '' ? 0 : Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const startEdit = (lnk: SocialLink) => {
    if (isDirty) {
      if (!window.confirm('You have unsaved changes in the current form. Switch to editing this social link?')) {
        return;
      }
    }
    setEditingLinkId(lnk.id);
    const lnkData = {
      platform_name: lnk.platform_name || '',
      url: lnk.url || '',
      icon_name: lnk.icon_name || '',
      order_index: lnk.order_index ?? 0,
      is_active: lnk.is_active ?? true,
    };
    setInitial(lnkData);
    setMessage(null);
  };

  const cancelEdit = () => {
    if (isDirty) {
      if (!window.confirm('Discard unsaved changes?')) return;
    }
    setEditingLinkId(null);
    setInitial(initialSocialForm);
    setMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (editingLinkId !== null && !isDirty) {
      setMessage({ type: 'error', text: 'No changes to save.' });
      return;
    }

    if (!formData.platform_name.trim() || !formData.url.trim()) {
      setMessage({ type: 'error', text: 'Please fill in required fields (Platform Name, URL).' });
      return;
    }

    setShowConfirm(true);
  };

  const executeSave = async () => {
    if (saving) return;
    setShowConfirm(false);
    setSaving(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem('admin_token');

    try {
      const url = editingLinkId !== null
        ? `${apiUrl}/api/v1/social/${editingLinkId}`
        : `${apiUrl}/api/v1/social`;
      const method = editingLinkId !== null ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, order_index: Number(formData.order_index) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to save social link');

      setMessage({ type: 'success', text: editingLinkId !== null ? 'Social link updated successfully!' : 'Social link added successfully!' });
      setInitial(formData);
      if (editingLinkId === null) {
        setInitial(initialSocialForm);
      }
      fetchLinks();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error saving social link';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, platform: string) => {
    if (!confirmDelete(platform)) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem('admin_token');

    try {
      const res = await fetch(`${apiUrl}/api/v1/social/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete social link');
      setMessage({ type: 'success', text: 'Social link deleted successfully!' });
      if (editingLinkId === id) {
        cancelEdit();
      }
      fetchLinks();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting social link';
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20 text-slate-500">
          <span className="material-symbols-outlined animate-spin mr-2">sync</span> Loading social links...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-300 animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-slate-100 space-y-5 transform transition-all duration-300 ease-out scale-100 opacity-100 animate-scaleUp">
              <div className="flex items-center gap-3 text-amber-600">
                <span className="material-symbols-outlined text-3xl">help</span>
                <h3 className="text-xl font-bold text-slate-900">Are you sure?</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Do you want to save these changes to your social links? This will smoothly update your contact and profile links.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all duration-200 active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeSave}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                >
                  Yes, Save Social Link
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header Actions */}
        <div className="flex justify-between items-end pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Manage Social Links</h1>
            <p className="text-xs text-slate-500">Add and manage your social media and professional profile links</p>
          </div>
          {editingLinkId !== null && (
            <button
              type="button"
              onClick={cancelEdit}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">add</span> Add New Link Instead
            </button>
          )}
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form (Create or Edit) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600">
                    {editingLinkId !== null ? 'edit' : 'share'}
                  </span>
                  {editingLinkId !== null ? 'Edit Social Link' : 'Add New Social Link'}
                </span>
                {isDirty && <span className="text-xs font-mono text-amber-600 font-semibold">Unsaved changes</span>}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Platform Name *</label>
                  <input
                    type="text"
                    name="platform_name"
                    value={formData.platform_name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. GitHub, LinkedIn"
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Profile URL *</label>
                  <input
                    type="text"
                    name="url"
                    value={formData.url}
                    onChange={handleChange}
                    required
                    placeholder="https://..."
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Order Index</label>
                  <input
                    type="number"
                    name="order_index"
                    value={formData.order_index}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                  />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    name="is_active"
                    id="lnk_is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                  />
                  <label htmlFor="lnk_is_active" className="text-sm font-medium text-slate-700">Active (Visible in Frontend Contact)</label>
                </div>
                <button
                  type="submit"
                  disabled={saving || (editingLinkId !== null && !isDirty)}
                  className="w-full py-2.5 bg-blue-600 text-white rounded font-medium text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                >
                  {saving ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-sm">sync</span> Saving...
                    </>
                  ) : editingLinkId !== null && !isDirty ? (
                    <>
                      <span className="material-symbols-outlined text-sm">check</span> No Changes to Save
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">save</span>
                      {editingLinkId !== null ? 'Save Changes' : 'Save & Add Social Link'}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Existing Social Links List */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200 flex items-center justify-between">
                <span>Social Links List</span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{links.length}</span>
              </h2>
              <div className="space-y-3">
                {links.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    <span className="material-symbols-outlined text-3xl mb-1 opacity-40">share</span>
                    <p>No social links found.</p>
                  </div>
                ) : (
                  links.map((lnk) => {
                    const isBeingEdited = editingLinkId === lnk.id;
                    return (
                      <div
                        key={lnk.id}
                        className={`border rounded-lg p-3 transition-colors flex items-center justify-between gap-3 ${
                          isBeingEdited ? 'bg-blue-50/60 border-blue-300' : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-semibold text-slate-900 text-sm truncate">{lnk.platform_name}</h3>
                            {!lnk.is_active && (
                              <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded flex-shrink-0">Hidden</span>
                            )}
                          </div>
                          <a
                            href={lnk.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 truncate max-w-full"
                            title={lnk.url}
                          >
                            <span className="material-symbols-outlined text-xs flex-shrink-0">link</span>
                            <span className="truncate">{lnk.url}</span>
                          </a>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => startEdit(lnk)}
                            className={`p-1.5 rounded transition-colors ${
                              isBeingEdited ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50'
                            }`}
                            title="Edit social link"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(lnk.id, lnk.platform_name)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete social link"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
