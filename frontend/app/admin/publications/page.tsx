'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminForm, confirmDelete } from '@/hooks/useAdminForm';

interface Publication {
  id: number;
  title: string;
  authors: string;
  publisher_venue: string;
  year: number;
  abstract?: string;
  doi?: string;
  publication_url?: string;
  pdf_url?: string;
}

const initialPubForm = {
  title: '',
  authors: '',
  publisher_venue: '',
  year: new Date().getFullYear(),
  abstract: '',
  doi: '',
  publication_url: '',
  pdf_url: '',
};

export default function AdminPublicationsPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPubId, setEditingPubId] = useState<number | null>(null);
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
  } = useAdminForm(initialPubForm);

  const fetchPublications = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    try {
      const res = await fetch(`${apiUrl}/api/v1/academic/publications`);
      if (res.ok) {
        const data = await res.json();
        setPublications(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublications();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const startEdit = (pub: Publication) => {
    if (isDirty) {
      if (!window.confirm('You have unsaved changes in the current form. Switch to editing this publication?')) {
        return;
      }
    }
    setEditingPubId(pub.id);
    const pubData = {
      title: pub.title || '',
      authors: pub.authors || '',
      publisher_venue: pub.publisher_venue || '',
      year: pub.year || new Date().getFullYear(),
      abstract: pub.abstract || '',
      doi: pub.doi || '',
      publication_url: pub.publication_url || '',
      pdf_url: pub.pdf_url || '',
    };
    setInitial(pubData);
    setMessage(null);
  };

  const cancelEdit = () => {
    if (isDirty) {
      if (!window.confirm('Discard unsaved changes?')) return;
    }
    setEditingPubId(null);
    setInitial(initialPubForm);
    setMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (editingPubId !== null && !isDirty) {
      setMessage({ type: 'error', text: 'No changes to save.' });
      return;
    }

    if (!formData.title.trim() || !formData.authors.trim()) {
      setMessage({ type: 'error', text: 'Please fill in required fields (Title, Authors).' });
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
      const url = editingPubId !== null
        ? `${apiUrl}/api/v1/academic/publications/${editingPubId}`
        : `${apiUrl}/api/v1/academic/publications`;
      const method = editingPubId !== null ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, year: Number(formData.year) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to save publication');

      setMessage({ type: 'success', text: editingPubId !== null ? 'Publication updated successfully!' : 'Publication added successfully!' });
      setInitial(formData);
      if (editingPubId === null) {
        setInitial(initialPubForm);
      }
      fetchPublications();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error saving publication';
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
      const res = await fetch(`${apiUrl}/api/v1/academic/publications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete publication');
      setMessage({ type: 'success', text: 'Publication deleted successfully!' });
      if (editingPubId === id) {
        cancelEdit();
      }
      fetchPublications();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting publication';
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20 text-slate-500">
          <span className="material-symbols-outlined animate-spin mr-2">sync</span> Loading publications...
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
                Do you want to save these changes to your publication? This will smoothly update your research publications archive.
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
                  Yes, Save Publication
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header Actions */}
        <div className="flex justify-between items-end pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Manage Publications</h1>
            <p className="text-xs text-slate-500">Add and manage research papers, articles, and journal publications</p>
          </div>
          {editingPubId !== null && (
            <button
              type="button"
              onClick={cancelEdit}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">add</span> Add New Publication Instead
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
                    {editingPubId !== null ? 'edit' : 'book'}
                  </span>
                  {editingPubId !== null ? 'Edit Publication' : 'Add New Publication'}
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
                    placeholder="e.g. Quantum Entanglement in Neural Networks"
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Authors</label>
                  <input
                    type="text"
                    name="authors"
                    value={formData.authors}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Zaid Helsinki et al."
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Publisher / Venue</label>
                  <input
                    type="text"
                    name="publisher_venue"
                    value={formData.publisher_venue}
                    onChange={handleChange}
                    required
                    placeholder="e.g. IEEE Transactions"
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Abstract (Optional)</label>
                  <textarea
                    name="abstract"
                    rows={4}
                    value={formData.abstract}
                    onChange={handleChange}
                    placeholder="Short summary of the research paper..."
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors resize-y"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">DOI (Optional)</label>
                    <input
                      type="text"
                      name="doi"
                      value={formData.doi}
                      onChange={handleChange}
                      placeholder="e.g. 10.1109/TNNLS..."
                      className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">PDF URL (Optional)</label>
                    <input
                      type="text"
                      name="pdf_url"
                      value={formData.pdf_url}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Year</label>
                    <input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Publication URL</label>
                    <input
                      type="text"
                      name="publication_url"
                      value={formData.publication_url}
                      onChange={handleChange}
                      placeholder="https://doi.org/..."
                      className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={saving || (editingPubId !== null && !isDirty)}
                  className="w-full py-2.5 bg-blue-600 text-white rounded font-medium text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                >
                  {saving ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-sm">sync</span> Saving...
                    </>
                  ) : editingPubId !== null && !isDirty ? (
                    <>
                      <span className="material-symbols-outlined text-sm">check</span> No Changes to Save
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">save</span>
                      {editingPubId !== null ? 'Save Changes' : 'Save & Add Publication'}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Existing Publications List (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200 flex items-center justify-between">
                <span>Publications List</span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{publications.length}</span>
              </h2>
              <div className="space-y-4">
                {publications.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    <span className="material-symbols-outlined text-3xl mb-1 opacity-40">book</span>
                    <p>No publications found.</p>
                  </div>
                ) : (
                  publications.map((pub) => {
                    const isBeingEdited = editingPubId === pub.id;
                    return (
                      <div
                        key={pub.id}
                        className={`border rounded-lg p-4 transition-colors flex items-start justify-between gap-3 ${
                          isBeingEdited ? 'bg-blue-50/60 border-blue-300' : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <h3 className="font-semibold text-slate-900 text-sm">{pub.title}</h3>
                          <p className="text-xs text-slate-500 mt-1">{pub.authors} • {pub.publisher_venue} ({pub.year})</p>
                          {pub.publication_url && (
                            <a
                              href={pub.publication_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 mt-1.5"
                            >
                              <span className="material-symbols-outlined text-xs">link</span> View Link
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => startEdit(pub)}
                            className={`p-1.5 rounded transition-colors ${
                              isBeingEdited ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50'
                            }`}
                            title="Edit publication"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(pub.id, pub.title)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete publication"
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
