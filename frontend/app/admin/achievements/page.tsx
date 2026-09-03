/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import FileUpload from '@/components/admin/FileUpload';
import { useAdminForm, confirmDelete } from '@/hooks/useAdminForm';
import { getImageUrl } from '@/lib/utils';

interface Achievement {
  id: number;
  title: string;
  category: string;
  issuer: string;
  year_date: string;
  description?: string;
  credential_url?: string;
  evidence_url?: string;
}

const initialAchForm = {
  title: '',
  category: 'competition',
  issuer: '',
  year_date: '2025-01-01',
  description: '',
  credential_url: '',
  evidence_url: '',
};

export default function AdminAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAchId, setEditingAchId] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const {
    formData,
    setFormData,
    setInitial,
    isDirty,
    saving,
    setSaving,
    message,
    setMessage,
  } = useAdminForm(initialAchForm);

  const fetchAchievements = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    try {
      const res = await fetch(`${apiUrl}/api/v1/academic/achievements`);
      if (res.ok) {
        const data = await res.json();
        setAchievements(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const startEdit = (ach: Achievement) => {
    if (isDirty) {
      if (!window.confirm('You have unsaved changes in the current form. Switch to editing this achievement?')) {
        return;
      }
    }
    setEditingAchId(ach.id);
    const achData = {
      title: ach.title || '',
      category: ach.category || 'competition',
      issuer: ach.issuer || '',
      year_date: ach.year_date || '2025-01-01',
      description: ach.description || '',
      credential_url: ach.credential_url || '',
      evidence_url: ach.evidence_url || '',
    };
    setInitial(achData);
    setMessage(null);
  };

  const cancelEdit = () => {
    if (isDirty) {
      if (!window.confirm('Discard unsaved changes?')) return;
    }
    setEditingAchId(null);
    setInitial(initialAchForm);
    setMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (editingAchId !== null && !isDirty) {
      setMessage({ type: 'error', text: 'No changes to save.' });
      return;
    }

    if (!formData.title.trim() || !formData.issuer.trim()) {
      setMessage({ type: 'error', text: 'Please fill in required fields (Title, Issuer).' });
      return;
    }

    setShowConfirm(true);
  };

  const executeSave = async () => {
    if (saving) return;
    setShowConfirm(false);
    setSaving(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const token = localStorage.getItem('admin_token');

    try {
      const url = editingAchId !== null
        ? `${apiUrl}/api/v1/academic/achievements/${editingAchId}`
        : `${apiUrl}/api/v1/academic/achievements`;
      const method = editingAchId !== null ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to save achievement');

      setMessage({ type: 'success', text: editingAchId !== null ? 'Achievement updated successfully!' : 'Achievement added successfully!' });
      setInitial(formData);
      if (editingAchId === null) {
        setInitial(initialAchForm);
      }
      fetchAchievements();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error saving achievement';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirmDelete(title)) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const token = localStorage.getItem('admin_token');

    try {
      const res = await fetch(`${apiUrl}/api/v1/academic/achievements/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete achievement');
      setMessage({ type: 'success', text: 'Achievement deleted successfully!' });
      if (editingAchId === id) {
        cancelEdit();
      }
      fetchAchievements();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting achievement';
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  const isPdf = (url?: string) => url ? url.toLowerCase().endsWith('.pdf') : false;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20 text-slate-500">
          <span className="material-symbols-outlined animate-spin mr-2">sync</span> Loading achievements...
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
                Do you want to save these changes to your achievement? This will smoothly update your achievements archive.
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
                  Yes, Save Achievement
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lightbox Modal */}
        {previewImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn" onClick={() => setPreviewImage(null)}>
            <div className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-3" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="absolute top-5 right-5 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full p-2 z-10 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
              <img src={getImageUrl(previewImage)} alt="Evidence preview" className="w-full h-auto max-h-[80vh] object-contain rounded-xl" />
            </div>
          </div>
        )}

        {/* Header Actions */}
        <div className="flex justify-between items-end pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Manage Achievements</h1>
            <p className="text-xs text-slate-500">Add and manage awards, scholarships, and professional recognitions with evidence proof</p>
          </div>
          {editingAchId !== null && (
            <button
              type="button"
              onClick={cancelEdit}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">add</span> Add New Achievement Instead
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
                    {editingAchId !== null ? 'edit' : 'emoji_events'}
                  </span>
                  {editingAchId !== null ? 'Edit Achievement' : 'Add New Achievement'}
                </span>
                {isDirty && <span className="text-xs font-mono text-amber-600 font-semibold">Unsaved changes</span>}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 1st Place National Hackathon"
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Issuer</label>
                  <input
                    type="text"
                    name="issuer"
                    value={formData.issuer}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Ministry of Education"
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                    >
                      <option value="competition">Competition</option>
                      <option value="scholarship">Scholarship</option>
                      <option value="academic">Academic</option>
                      <option value="professional">Professional</option>
                      <option value="recognition">Recognition</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Date</label>
                    <input
                      type="date"
                      name="year_date"
                      value={formData.year_date}
                      onChange={handleChange}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Description / Deskripsi (Optional)</label>
                  <textarea
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Short description of the achievement / milestone..."
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors resize-y"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Credential URL / Link Verifikasi (Optional)</label>
                  <input
                    type="text"
                    name="credential_url"
                    value={formData.credential_url}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                  />
                </div>

                <div>
                  <FileUpload
                    label="Evidence / Bukti Penghargaan (JPG, JPEG, PNG, PDF)"
                    type="certificate"
                    value={formData.evidence_url}
                    onChange={(url) => setFormData({ ...formData, evidence_url: url })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving || (editingAchId !== null && !isDirty)}
                  className="w-full py-2.5 bg-blue-600 text-white rounded font-medium text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                >
                  {saving ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-sm">sync</span> Saving...
                    </>
                  ) : editingAchId !== null && !isDirty ? (
                    <>
                      <span className="material-symbols-outlined text-sm">check</span> No Changes to Save
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">save</span>
                      {editingAchId !== null ? 'Save Changes' : 'Save & Add Achievement'}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Existing Achievements List (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200 flex items-center justify-between">
                <span>Achievements List</span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{achievements.length}</span>
              </h2>
              <div className="space-y-4">
                {achievements.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    <span className="material-symbols-outlined text-3xl mb-1 opacity-40">emoji_events</span>
                    <p>No achievements found.</p>
                  </div>
                ) : (
                  achievements.map((ach) => {
                    const isBeingEdited = editingAchId === ach.id;
                    const pdf = isPdf(ach.evidence_url);
                    return (
                      <div
                        key={ach.id}
                        className={`border rounded-lg p-4 transition-colors flex items-center justify-between gap-3 ${
                          isBeingEdited ? 'bg-blue-50/60 border-blue-300' : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          {ach.evidence_url ? (
                            pdf ? (
                              <div className="w-10 h-10 rounded bg-red-50 border border-red-200 flex items-center justify-center text-red-600 font-bold text-[10px] flex-shrink-0" title="PDF Evidence">
                                PDF
                              </div>
                            ) : (
                              <img
                                src={getImageUrl(ach.evidence_url)}
                                alt={ach.title}
                                className="w-10 h-10 rounded object-cover border border-slate-200 flex-shrink-0 cursor-pointer hover:opacity-95 transition-opacity"
                                onClick={() => setPreviewImage(ach.evidence_url || null)}
                                title="Click to preview evidence"
                              />
                            )
                          ) : (
                            <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-bold text-[10px] flex-shrink-0">
                              DOC
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <h3 className="font-semibold text-slate-900 text-sm truncate">{ach.title}</h3>
                            <p className="text-xs text-slate-500 mt-0.5 truncate">{ach.issuer} • {ach.category}</p>
                            <p className="text-xs text-blue-600 mt-0.5">{ach.year_date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => startEdit(ach)}
                            className={`p-1.5 rounded transition-colors ${
                              isBeingEdited ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50'
                            }`}
                            title="Edit achievement"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(ach.id, ach.title)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete achievement"
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
