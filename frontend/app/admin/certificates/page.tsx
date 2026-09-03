/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import FileUpload from '@/components/admin/FileUpload';
import { useAdminForm, confirmDelete } from '@/hooks/useAdminForm';
import { getImageUrl } from '@/lib/utils';

interface Certificate {
  id: number;
  name: string;
  issuer: string;
  issue_date: string;
  credential_id?: string;
  credential_url?: string;
  image_url?: string;
}

const initialCertForm = {
  name: '',
  issuer: '',
  issue_date: '2025-01-01',
  credential_id: '',
  credential_url: '',
  image_url: '',
};

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCertId, setEditingCertId] = useState<number | null>(null);
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
  } = useAdminForm(initialCertForm);

  const fetchCertificates = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    try {
      const res = await fetch(`${apiUrl}/api/v1/academic/certificates`);
      if (res.ok) {
        const data = await res.json();
        setCertificates(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const startEdit = (cert: Certificate) => {
    if (isDirty) {
      if (!window.confirm('You have unsaved changes in the current form. Switch to editing this certificate?')) {
        return;
      }
    }
    setEditingCertId(cert.id);
    const certData = {
      name: cert.name || '',
      issuer: cert.issuer || '',
      issue_date: cert.issue_date || '2025-01-01',
      credential_id: cert.credential_id || '',
      credential_url: cert.credential_url || '',
      image_url: cert.image_url || '',
    };
    setInitial(certData);
    setMessage(null);
  };

  const cancelEdit = () => {
    if (isDirty) {
      if (!window.confirm('Discard unsaved changes?')) return;
    }
    setEditingCertId(null);
    setInitial(initialCertForm);
    setMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (editingCertId !== null && !isDirty) {
      setMessage({ type: 'error', text: 'No changes to save.' });
      return;
    }

    if (!formData.name.trim() || !formData.issuer.trim()) {
      setMessage({ type: 'error', text: 'Please fill in required fields (Name, Issuer).' });
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
      const url = editingCertId !== null
        ? `${apiUrl}/api/v1/academic/certificates/${editingCertId}`
        : `${apiUrl}/api/v1/academic/certificates`;
      const method = editingCertId !== null ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to save certificate');

      setMessage({ type: 'success', text: editingCertId !== null ? 'Certificate updated successfully!' : 'Certificate added successfully!' });
      setInitial(formData);
      if (editingCertId === null) {
        setInitial(initialCertForm);
      }
      fetchCertificates();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error saving certificate';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirmDelete(name)) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem('admin_token');

    try {
      const res = await fetch(`${apiUrl}/api/v1/academic/certificates/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete certificate');
      setMessage({ type: 'success', text: 'Certificate deleted successfully!' });
      if (editingCertId === id) {
        cancelEdit();
      }
      fetchCertificates();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting certificate';
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  const isPdf = (url?: string) => url ? url.toLowerCase().endsWith('.pdf') : false;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20 text-slate-500">
          <span className="material-symbols-outlined animate-spin mr-2">sync</span> Loading certificates...
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
                Do you want to save these changes to your certificate? This will smoothly update your professional credentials.
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
                  Yes, Save Certificate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header Actions */}
        <div className="flex justify-between items-end pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Manage Certificates</h1>
            <p className="text-xs text-slate-500">Add and manage professional certifications and credentials (Images &amp; PDFs)</p>
          </div>
          {editingCertId !== null && (
            <button
              type="button"
              onClick={cancelEdit}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">add</span> Add New Certificate Instead
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
                    {editingCertId !== null ? 'edit' : 'verified'}
                  </span>
                  {editingCertId !== null ? 'Edit Certificate' : 'Add New Certificate'}
                </span>
                {isDirty && <span className="text-xs font-mono text-amber-600 font-semibold">Unsaved changes</span>}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Certificate Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. AWS Solutions Architect"
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Issuer *</label>
                  <input
                    type="text"
                    name="issuer"
                    value={formData.issuer}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Amazon Web Services"
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Issue Date *</label>
                    <input
                      type="date"
                      name="issue_date"
                      value={formData.issue_date}
                      onChange={handleChange}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Credential ID</label>
                    <input
                      type="text"
                      name="credential_id"
                      value={formData.credential_id}
                      onChange={handleChange}
                      placeholder="e.g. AWS-SA-12345"
                      className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Credential URL (Optional)</label>
                  <input
                    type="text"
                    name="credential_url"
                    value={formData.credential_url}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                  />
                </div>
                <div className="pt-2">
                  <FileUpload
                    label="Certificate File (PNG, JPG, WebP, PDF)"
                    type="certificate"
                    value={formData.image_url}
                    onChange={(url) => setFormData({ ...formData, image_url: url })}
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving || (editingCertId !== null && !isDirty)}
                  className="w-full py-2.5 bg-blue-600 text-white rounded font-medium text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                >
                  {saving ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-sm">sync</span> Saving...
                    </>
                  ) : editingCertId !== null && !isDirty ? (
                    <>
                      <span className="material-symbols-outlined text-sm">check</span> No Changes to Save
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">save</span>
                      {editingCertId !== null ? 'Save Changes' : 'Save & Add Certificate'}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Existing Certificates List (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200 flex items-center justify-between">
                <span>Certificates List</span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{certificates.length}</span>
              </h2>
              <div className="space-y-4">
                {certificates.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    <span className="material-symbols-outlined text-3xl mb-1 opacity-40">verified</span>
                    <p>No certificates found.</p>
                  </div>
                ) : (
                  certificates.map((cert) => {
                    const isBeingEdited = editingCertId === cert.id;
                    const pdf = isPdf(cert.image_url);
                    return (
                      <div
                        key={cert.id}
                        className={`border rounded-lg p-4 transition-colors flex items-center justify-between gap-3 ${
                          isBeingEdited ? 'bg-blue-50/60 border-blue-300' : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          {cert.image_url ? (
                            pdf ? (
                              <div className="w-10 h-10 rounded bg-red-50 border border-red-200 flex items-center justify-center text-red-600 font-bold text-[10px] flex-shrink-0">
                                PDF
                              </div>
                            ) : (
                              <img src={getImageUrl(cert.image_url)} alt={cert.name} className="w-10 h-10 rounded object-cover border border-slate-200 flex-shrink-0" />
                            )
                          ) : (
                            <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-bold text-[10px] flex-shrink-0">
                              DOC
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <h3 className="font-semibold text-slate-900 text-sm truncate">{cert.name}</h3>
                            <p className="text-xs text-slate-500 mt-0.5 truncate">{cert.issuer}</p>
                            <p className="text-xs text-blue-600 mt-0.5">Issued: {cert.issue_date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => startEdit(cert)}
                            className={`p-1.5 rounded transition-colors ${
                              isBeingEdited ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50'
                            }`}
                            title="Edit certificate"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(cert.id, cert.name)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete certificate"
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
