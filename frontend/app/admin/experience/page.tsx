'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminForm, confirmDelete } from '@/hooks/useAdminForm';
import { adminApiFetch } from '@/lib/utils';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const LOCATION_TYPES = ['On-site', 'Hybrid', 'Remote'];
const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance', 'Self-employed', 'Volunteer'];
const MEDIA_TYPES = ['GitHub', 'Project', 'Publication', 'Certificate', 'Presentation', 'Portfolio'];

interface Skill {
  id: number;
  name: string;
}

interface SkillCategory {
  id: number;
  name: string;
  order_index: number;
  skills: Skill[];
}

interface ExperienceMedia {
  id?: number;
  title: string;
  url: string;
  media_type: string;
}

interface Experience {
  id: number;
  position_title: string;
  organization_name: string;
  location?: string;
  location_type?: string;
  employment_type?: string;
  start_month: string;
  start_year: number;
  end_month?: string;
  end_year?: number;
  is_current: boolean;
  description?: string;
  sort_order: number;
  skills: Skill[];
  media: ExperienceMedia[];
}

const initialExperienceForm = {
  position_title: '',
  organization_name: '',
  location: '',
  location_type: 'On-site',
  employment_type: 'Full-time',
  start_month: 'January',
  start_year: new Date().getFullYear(),
  end_month: '' as string,
  end_year: '' as (number | ''),
  is_current: false,
  description: '',
  sort_order: 0,
  skill_ids: [] as number[],
  media: [] as { title: string; url: string; media_type: string }[],
};

export default function AdminExperiencePage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingExpId, setEditingExpId] = useState<number | null>(null);
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
  } = useAdminForm(initialExperienceForm);

  const fetchData = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    try {
      const [expRes, skillRes] = await Promise.all([
        fetch(`${apiUrl}/api/v1/experiences`),
        fetch(`${apiUrl}/api/v1/skills`),
      ]);
      if (expRes.ok) {
        const data = await expRes.json();
        setExperiences(data);
      }
      if (skillRes.ok) {
        const catData = await skillRes.json();
        setSkillCategories(catData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData({ ...formData, [name]: checked });
    } else if (name === 'start_year' || name === 'end_year' || name === 'sort_order') {
      setFormData({ ...formData, [name]: value === '' ? '' : Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSkillToggle = (skillId: number) => {
    const currentIds = formData.skill_ids || [];
    const newIds = currentIds.includes(skillId)
      ? currentIds.filter((id) => id !== skillId)
      : [...currentIds, skillId];
    setFormData({ ...formData, skill_ids: newIds });
  };

  const handleAddMedia = () => {
    setFormData({
      ...formData,
      media: [...(formData.media || []), { title: '', url: '', media_type: 'Project' }]
    });
  };

  const handleRemoveMedia = (index: number) => {
    const newMedia = [...(formData.media || [])];
    newMedia.splice(index, 1);
    setFormData({ ...formData, media: newMedia });
  };

  const handleMediaChange = (index: number, field: string, value: string) => {
    const newMedia = [...(formData.media || [])];
    newMedia[index] = { ...newMedia[index], [field]: value };
    setFormData({ ...formData, media: newMedia });
  };

  const startEdit = (exp: Experience) => {
    if (isDirty) {
      if (!window.confirm('You have unsaved changes in the current form. Switch to editing this experience?')) {
        return;
      }
    }
    setEditingExpId(exp.id);
    const expData = {
      position_title: exp.position_title || '',
      organization_name: exp.organization_name || '',
      location: exp.location || '',
      location_type: exp.location_type || 'On-site',
      employment_type: exp.employment_type || 'Full-time',
      start_month: exp.start_month || 'January',
      start_year: exp.start_year || new Date().getFullYear(),
      end_month: exp.end_month || '',
      end_year: (exp.end_year ?? '') as (number | ''),
      is_current: exp.is_current || false,
      description: exp.description || '',
      sort_order: exp.sort_order || 0,
      skill_ids: exp.skills ? exp.skills.map((s) => s.id) : [],
      media: exp.media ? exp.media.map((m) => ({ title: m.title, url: m.url, media_type: m.media_type })) : [],
    };
    setInitial(expData);
    setMessage(null);
  };

  const cancelEdit = () => {
    if (isDirty) {
      if (!window.confirm('Discard unsaved changes?')) return;
    }
    setEditingExpId(null);
    setInitial(initialExperienceForm);
    setMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (editingExpId !== null && !isDirty) {
      setMessage({ type: 'error', text: 'No changes to save.' });
      return;
    }

    if (!formData.position_title.trim() || !formData.organization_name.trim()) {
      setMessage({ type: 'error', text: 'Please fill in required fields (Job Title, Organization).' });
      return;
    }

    if (!formData.start_month || !formData.start_year) {
      setMessage({ type: 'error', text: 'Start month and start year are required.' });
      return;
    }

    if (!formData.is_current && (!formData.end_month || !formData.end_year)) {
      setMessage({ type: 'error', text: 'End month and end year are required when not currently working in this position.' });
      return;
    }

    setShowConfirm(true);
  };

  const executeSave = async () => {
    if (saving) return;
    setShowConfirm(false);
    setSaving(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

    try {
      const url = editingExpId !== null
        ? `${apiUrl}/api/v1/experiences/${editingExpId}`
        : `${apiUrl}/api/v1/experiences`;
      const method = editingExpId !== null ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        end_month: formData.is_current ? null : (formData.end_month || null),
        end_year: formData.is_current ? null : (formData.end_year === '' ? null : Number(formData.end_year)),
      };

      const res = await adminApiFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to save experience');

      setMessage({ type: 'success', text: editingExpId !== null ? 'Experience updated successfully!' : 'Experience added successfully!' });
      setInitial({
        ...payload,
        end_month: payload.end_month || '',
        end_year: payload.end_year ?? '',
      });
      if (editingExpId === null) {
        setInitial(initialExperienceForm);
      }
      fetchData();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error saving experience';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, title: string, org: string) => {
    if (!confirmDelete(`${title} at ${org}`)) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

    try {
      const res = await adminApiFetch(`${apiUrl}/api/v1/experiences/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete experience');
      setMessage({ type: 'success', text: 'Experience deleted successfully!' });
      if (editingExpId === id) {
        cancelEdit();
      }
      fetchData();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting experience';
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20 text-slate-500">
          <span className="material-symbols-outlined animate-spin mr-2">sync</span> Loading experience...
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
                Do you want to save these changes to your experience? This will smoothly update your professional career history.
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
                  Yes, Save Experience
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header Actions */}
        <div className="flex justify-between items-end pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Manage Experience</h1>
            <p className="text-xs text-slate-500">Track professional career, internships, and freelance history like LinkedIn</p>
          </div>
          {editingExpId !== null && (
            <button
              type="button"
              onClick={cancelEdit}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">add</span> Add New Experience Instead
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
                    {editingExpId !== null ? 'edit' : 'work'}
                  </span>
                  {editingExpId !== null ? 'Edit Experience' : 'Add New Experience'}
                </span>
                {isDirty && <span className="text-xs font-mono text-amber-600 font-semibold">Unsaved changes</span>}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Position Title *</label>
                  <input
                    type="text"
                    name="position_title"
                    value={formData.position_title}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Organization / Company *</label>
                  <input
                    type="text"
                    name="organization_name"
                    value={formData.organization_name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Tech Corp"
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location || ''}
                      onChange={handleChange}
                      placeholder="e.g. Jakarta, Indonesia"
                      className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Location Type</label>
                    <select
                      name="location_type"
                      value={formData.location_type || 'On-site'}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                    >
                      {LOCATION_TYPES.map((lt) => (
                        <option key={lt} value={lt}>{lt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Employment Type</label>
                    <select
                      name="employment_type"
                      value={formData.employment_type || 'Full-time'}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                    >
                      {EMPLOYMENT_TYPES.map((et) => (
                        <option key={et} value={et}>{et}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    name="is_current"
                    id="exp_is_current"
                    checked={formData.is_current}
                    onChange={handleChange}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                  />
                  <label htmlFor="exp_is_current" className="text-sm font-medium text-slate-700">I currently work in this position</label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Start Month *</label>
                    <select
                      name="start_month"
                      value={formData.start_month}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                    >
                      {MONTHS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Start Year *</label>
                    <input
                      type="number"
                      name="start_year"
                      value={formData.start_year}
                      onChange={handleChange}
                      required
                      placeholder="2023"
                      className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                    />
                  </div>
                </div>

                {!formData.is_current && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">End Month *</label>
                      <select
                        name="end_month"
                        value={formData.end_month || ''}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                      >
                        {MONTHS.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">End Year *</label>
                      <input
                        type="number"
                        name="end_year"
                        value={formData.end_year ?? ''}
                        onChange={handleChange}
                        placeholder="2025"
                        className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Description / Highlights</label>
                  <textarea
                    name="description"
                    rows={4}
                    value={formData.description || ''}
                    onChange={handleChange}
                    placeholder="Describe responsibilities, contributions, technologies used, and key achievements..."
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-colors resize-y"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Skills (Select from Admin &gt; Skills)</label>
                  <div className="space-y-4 max-h-60 overflow-y-auto p-4 bg-slate-50 border border-slate-200 rounded">
                    {skillCategories.length === 0 ? (
                      <p className="text-xs text-slate-400">No skill categories found. Please add skills via Admin &gt; Skills first.</p>
                    ) : (
                      skillCategories.map((cat) => (
                        <div key={cat.id} className="space-y-1.5">
                          <h4 className="text-xs font-bold text-slate-700 uppercase">{cat.name}</h4>
                          <div className="flex flex-wrap gap-2">
                            {(!cat.skills || cat.skills.length === 0) ? (
                              <span className="text-xs text-slate-400 italic">No skills in this category</span>
                            ) : (
                              cat.skills.map((skill) => {
                                const selected = (formData.skill_ids || []).includes(skill.id);
                                return (
                                  <button
                                    type="button"
                                    key={skill.id}
                                    onClick={() => handleSkillToggle(skill.id)}
                                    className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors border flex items-center gap-1.5 ${
                                      selected
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                    }`}
                                  >
                                    <span className={`w-3 h-3 rounded-sm border flex items-center justify-center text-[10px] ${selected ? 'bg-white text-blue-600 border-white font-bold' : 'border-slate-300'}`}>
                                      {selected ? '✓' : ''}
                                    </span>
                                    {skill.name}
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Media / References</label>
                    <button
                      type="button"
                      onClick={handleAddMedia}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">add</span> Add Media Link
                    </button>
                  </div>
                  <div className="space-y-3">
                    {(formData.media || []).map((m, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2 relative">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Media Title (e.g. GitHub Repository)"
                            value={m.title}
                            onChange={(e) => handleMediaChange(idx, 'title', e.target.value)}
                            className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-600"
                          />
                          <select
                            value={m.media_type}
                            onChange={(e) => handleMediaChange(idx, 'media_type', e.target.value)}
                            className="bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-600"
                          >
                            {MEDIA_TYPES.map((mt) => (
                              <option key={mt} value={mt}>{mt}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => handleRemoveMedia(idx)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove media"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                        <input
                          type="url"
                          placeholder="URL (https://...)"
                          value={m.url}
                          onChange={(e) => handleMediaChange(idx, 'url', e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-600"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Sort Order</label>
                  <input
                    type="number"
                    name="sort_order"
                    value={formData.sort_order}
                    onChange={handleChange}
                    className="w-32 bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving || (editingExpId !== null && !isDirty)}
                  className="w-full py-2.5 bg-blue-600 text-white rounded font-medium text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                >
                  {saving ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-sm">sync</span> Saving...
                    </>
                  ) : editingExpId !== null && !isDirty ? (
                    <>
                      <span className="material-symbols-outlined text-sm">check</span> No Changes to Save
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">save</span>
                      {editingExpId !== null ? 'Save Changes' : 'Save & Add Experience'}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Existing Experience List (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200 flex items-center justify-between">
                <span>Experience List</span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{experiences.length}</span>
              </h2>
              <div className="space-y-4">
                {experiences.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    <span className="material-symbols-outlined text-3xl mb-1 opacity-40">work</span>
                    <p>No experience entries found.</p>
                  </div>
                ) : (
                  experiences.map((exp) => {
                    const isBeingEdited = editingExpId === exp.id;
                    return (
                      <div
                        key={exp.id}
                        className={`border rounded-lg p-4 transition-colors flex items-start justify-between gap-3 ${
                          isBeingEdited ? 'bg-blue-50/60 border-blue-300' : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <h3 className="font-semibold text-slate-900 text-sm">{exp.position_title}</h3>
                          <p className="text-xs text-slate-500 mt-1">{exp.organization_name} • {exp.employment_type || 'Full-time'}</p>
                          <p className="text-xs text-blue-600 mt-1">
                            {exp.start_month} {exp.start_year} - {exp.is_current ? 'Present' : `${exp.end_month || ''} ${exp.end_year || ''}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => startEdit(exp)}
                            className={`p-1.5 rounded transition-colors ${
                              isBeingEdited ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50'
                            }`}
                            title="Edit experience"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(exp.id, exp.position_title, exp.organization_name)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete experience"
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
