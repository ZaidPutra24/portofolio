'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import FileUpload from '@/components/admin/FileUpload';
import { useAdminForm } from '@/hooks/useAdminForm';

export default function AdminProfilePage() {
  const {
    formData,
    setFormData,
    setInitial,
    isDirty,
    saving,
    setSaving,
    message,
    setMessage,
  } = useAdminForm({
    full_name: '',
    headline: '',
    bio: '',
    education: '',
    career_focus: '',
    research_interests: '',
    avatar_url: '',
    cv_url: '',
  });

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<{ full_name?: string; headline?: string }>({});
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      try {
        const res = await fetch(`${apiUrl}/api/v1/profile`);
        if (res.ok) {
          const data = await res.json();
          const profileData = {
            full_name: data.full_name || '',
            headline: data.headline || '',
            bio: data.bio || '',
            education: data.education || '',
            career_focus: data.career_focus || '',
            research_interests: data.research_interests || '',
            avatar_url: data.avatar_url || '',
            cv_url: data.cv_url || '',
          };
          setInitial(profileData);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [setInitial]);

  const validateField = (name: string, value: string) => {
    const errs = { ...errors };
    if (name === 'full_name') {
      if (!value.trim()) {
        errs.full_name = 'Full Name is required.';
      } else if (value.trim().length < 2) {
        errs.full_name = 'Full Name must be at least 2 characters.';
      } else {
        delete errs.full_name;
      }
    }
    if (name === 'headline') {
      if (value && value.length > 150) {
        errs.headline = 'Headline cannot exceed 150 characters.';
      } else {
        delete errs.headline;
      }
    }
    setErrors(errs);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  const isFormValid = formData.full_name.trim().length >= 2 && (!formData.headline || formData.headline.length <= 150) && Object.keys(errors).length === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!isDirty) {
      setMessage({ type: 'error', text: 'No changes to save.' });
      return;
    }

    if (!isFormValid) {
      setMessage({ type: 'error', text: 'Please fix validation errors before saving.' });
      return;
    }

    setShowConfirm(true);
  };

  const executeSave = async () => {
    if (saving) return; // Prevent double click / duplicate request
    setShowConfirm(false);
    setSaving(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const token = localStorage.getItem('admin_token');

    try {
      const res = await fetch(`${apiUrl}/api/v1/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Failed to update profile');
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setInitial(formData); // current state becomes new original state
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setMessage({ type: 'error', text: errorMessage });
      // Keep user changes intact so user can fix and retry
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20 text-slate-500 font-mono text-xs">
          <span className="material-symbols-outlined animate-spin mr-2">sync</span> Loading profile...
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
                Do you want to save these changes to your profile? This will smoothly update your public portfolio information.
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
                  Yes, Save Profile
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-end pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Profile & Personal Information</h1>
            <p className="text-xs font-mono text-slate-500">Manage public bio, headline, avatar, and CV</p>
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl text-sm flex items-center gap-3 border transition-all duration-300 ease-out shadow-md ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 animate-fadeIn'
                : 'bg-red-50 border-red-300 text-red-900 animate-fadeIn'
            }`}
          >
            <span className="material-symbols-outlined text-xl">
              {message.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className={`w-full bg-slate-50 border rounded px-3 py-2 text-slate-900 text-sm focus:ring-1 outline-none ${
                    errors.full_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600'
                  }`}
                />
                {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Professional Headline
                </label>
                <input
                  type="text"
                  name="headline"
                  value={formData.headline}
                  onChange={handleChange}
                  placeholder="e.g., Full-Stack Engineer & AI Researcher"
                  className={`w-full bg-slate-50 border rounded px-3 py-2 text-slate-900 text-sm focus:ring-1 outline-none ${
                    errors.headline ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600'
                  }`}
                />
                {errors.headline && <p className="text-xs text-red-500 mt-1">{errors.headline}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Biography
              </label>
              <textarea
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none resize-y"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Education
                </label>
                <input
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Career Focus
                </label>
                <input
                  type="text"
                  name="career_focus"
                  value={formData.career_focus}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Research Interests
                </label>
                <input
                  type="text"
                  name="research_interests"
                  value={formData.research_interests}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
              <FileUpload
                label="Profile Avatar Image"
                type="project"
                value={formData.avatar_url}
                onChange={(url) => setFormData({ ...formData, avatar_url: url })}
              />

              <FileUpload
                label="Curriculum Vitae (PDF)"
                type="cv"
                value={formData.cv_url}
                onChange={(url) => setFormData({ ...formData, cv_url: url })}
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="text-xs font-mono">
                {!isDirty ? (
                  <span className="text-slate-400">No changes to save</span>
                ) : (
                  <span className="text-amber-600 font-semibold">Unsaved changes</span>
                )}
              </div>
              <button
                type="submit"
                disabled={!isDirty || !isFormValid || saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">sync</span> Saving...
                  </>
                ) : !isDirty ? (
                  <>
                    <span className="material-symbols-outlined text-sm">check</span> No Changes to Save
                  </>
                ) : !isFormValid ? (
                  <>
                    <span className="material-symbols-outlined text-sm">block</span> Fix Errors to Save
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">save</span> Save Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
