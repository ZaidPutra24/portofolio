'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import FileUpload from '@/components/admin/FileUpload';
import { useAdminForm, confirmDelete } from '@/hooks/useAdminForm';

interface Project {
  id: number;
  title: string;
  slug: string;
  summary: string;
  description?: string;
  background?: string;
  problem?: string;
  solution?: string;
  implementation?: string;
  results?: string;
  year: number;
  status: string;
  is_featured: boolean;
  github_url?: string;
  demo_url?: string;
  thumbnail_url?: string;
}

const initialProjectForm = {
  title: '',
  slug: '',
  summary: '',
  description: '',
  background: '',
  problem: '',
  solution: '',
  implementation: '',
  results: '',
  year: new Date().getFullYear(),
  status: 'published',
  is_featured: false,
  github_url: '',
  demo_url: '',
  thumbnail_url: '',
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
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
  } = useAdminForm(initialProjectForm);

  const fetchProjects = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    try {
      const res = await fetch(`${apiUrl}/api/v1/projects`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setFormData({ ...formData, title, slug });
  };

  const startEdit = (proj: Project) => {
    if (isDirty) {
      if (!window.confirm('You have unsaved changes in the current form. Switch to editing this project?')) {
        return;
      }
    }
    setEditingProjectId(proj.id);
    const projData = {
      title: proj.title || '',
      slug: proj.slug || '',
      summary: proj.summary || '',
      description: proj.description || '',
      background: proj.background || '',
      problem: proj.problem || '',
      solution: proj.solution || '',
      implementation: proj.implementation || '',
      results: proj.results || '',
      year: proj.year || new Date().getFullYear(),
      status: proj.status || 'published',
      is_featured: proj.is_featured || false,
      github_url: proj.github_url || '',
      demo_url: proj.demo_url || '',
      thumbnail_url: proj.thumbnail_url || '',
    };
    setInitial(projData);
    setMessage(null);
  };

  const cancelEdit = () => {
    if (isDirty) {
      if (!window.confirm('Discard unsaved changes?')) return;
    }
    setEditingProjectId(null);
    setInitial(initialProjectForm);
    setMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (editingProjectId !== null && !isDirty) {
      setMessage({ type: 'error', text: 'No changes to save.' });
      return;
    }

    if (!formData.title.trim() || !formData.summary.trim()) {
      setMessage({ type: 'error', text: 'Please fill in required fields (Title, Summary).' });
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
      const url = editingProjectId !== null
        ? `${apiUrl}/api/v1/projects/${editingProjectId}`
        : `${apiUrl}/api/v1/projects`;
      const method = editingProjectId !== null ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          year: Number(formData.year),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to save project');

      setMessage({ type: 'success', text: editingProjectId !== null ? 'Project updated successfully!' : 'Project created successfully!' });
      setInitial(formData);
      fetchProjects();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error saving project';
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
      const res = await fetch(`${apiUrl}/api/v1/projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete project');
      setMessage({ type: 'success', text: 'Project deleted successfully!' });
      if (editingProjectId === id) {
        cancelEdit();
      }
      fetchProjects();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting project';
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20 text-slate-500">
          <span className="material-symbols-outlined animate-spin mr-2">sync</span> Loading projects...
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
                Do you want to save these changes to your project? This will smoothly update your portfolio projects archive.
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
                  Yes, Save Project
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header Actions */}
        <div className="flex justify-between items-end pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Manage Projects</h1>
            <p className="text-xs text-slate-500">Create, edit, and organize portfolio case studies</p>
          </div>
          {editingProjectId !== null && (
            <button
              type="button"
              onClick={cancelEdit}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">add</span> Add New Project Instead
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
                    {editingProjectId !== null ? 'edit' : 'add_box'}
                  </span>
                  {editingProjectId !== null ? 'Edit Project' : 'Add New Project'}
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
                    onChange={handleTitleChange}
                    required
                    placeholder="e.g. Quantum Computing Platform"
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Slug</label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                    />
                  </div>
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
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Summary</label>
                  <textarea
                    name="summary"
                    rows={3}
                    value={formData.summary}
                    onChange={handleChange}
                    required
                    placeholder="Short description of the project..."
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors resize-y"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Description (Optional)</label>
                  <textarea
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Full project description / case study..."
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors resize-y"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Background & Context / Latar Belakang (Optional)</label>
                  <textarea
                    name="background"
                    rows={3}
                    value={formData.background}
                    onChange={handleChange}
                    placeholder="Background details or why this project was initiated..."
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors resize-y"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Problem Statement / Permasalahan (Optional)</label>
                  <textarea
                    name="problem"
                    rows={3}
                    value={formData.problem}
                    onChange={handleChange}
                    placeholder="What specific problems were faced/solved..."
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors resize-y"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Proposed Solution / Solusi (Optional)</label>
                  <textarea
                    name="solution"
                    rows={3}
                    value={formData.solution}
                    onChange={handleChange}
                    placeholder="What was the proposed solution..."
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors resize-y"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Implementation & Architecture / Implementasi (Optional)</label>
                  <textarea
                    name="implementation"
                    rows={3}
                    value={formData.implementation}
                    onChange={handleChange}
                    placeholder="Engineering implementation, tech stack details, system architecture..."
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors resize-y"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Results & Key Metrics / Hasil (Optional)</label>
                  <textarea
                    name="results"
                    rows={3}
                    value={formData.results}
                    onChange={handleChange}
                    placeholder="The outcome, metrics achieved, lessons learned..."
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors resize-y"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">GitHub URL</label>
                    <input
                      type="text"
                      name="github_url"
                      value={formData.github_url}
                      onChange={handleChange}
                      placeholder="https://github.com/..."
                      className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Demo URL</label>
                    <input
                      type="text"
                      name="demo_url"
                      value={formData.demo_url}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <FileUpload
                    label="Thumbnail Image"
                    type="project"
                    value={formData.thumbnail_url}
                    onChange={(url) => setFormData({ ...formData, thumbnail_url: url })}
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving || (editingProjectId !== null && !isDirty)}
                  className="w-full py-2.5 bg-blue-600 text-white rounded font-medium text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                >
                  {saving ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-sm">sync</span> Saving...
                    </>
                  ) : editingProjectId !== null && !isDirty ? (
                    <>
                      <span className="material-symbols-outlined text-sm">check</span> No Changes to Save
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">save</span>
                      {editingProjectId !== null ? 'Save Changes' : 'Save & Create Project'}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Publishing & Existing Projects (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">Publishing</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <label className="flex items-center gap-3 cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleChange}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                  />
                  <span className="text-sm text-slate-700 font-medium">Feature on Homepage</span>
                </label>
              </div>
            </div>

            {/* Existing Projects Quick List */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">Existing Projects</h2>
              {projects.length === 0 ? (
                <p className="text-xs text-slate-500">No projects found.</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {projects.map((proj) => {
                    const isBeingEdited = editingProjectId === proj.id;
                    return (
                      <div
                        key={proj.id}
                        className={`flex items-center justify-between p-3 border rounded-md transition-colors ${
                          isBeingEdited ? 'bg-blue-50/60 border-blue-300' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="overflow-hidden pr-2">
                          <p className="text-sm font-bold text-slate-900 truncate">{proj.title}</p>
                          <p className="text-xs text-slate-500">{proj.year} • {proj.status}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => startEdit(proj)}
                            className={`p-1.5 rounded transition-colors ${
                              isBeingEdited ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50'
                            }`}
                            title="Edit project"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(proj.id, proj.title)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete project"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
