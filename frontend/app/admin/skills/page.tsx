'use client';

import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminForm, confirmDelete } from '@/hooks/useAdminForm';
import IconResolver from '@/components/IconResolver';

interface Skill {
  id: number;
  name: string;
  level?: string;
  icon_name?: string;
  order_index: number;
  category_id: number;
}

interface SkillCategory {
  id: number;
  name: string;
  order_index: number;
  skills: Skill[];
}

const initialCategoryForm = {
  name: '',
  order_index: 0,
};

const initialSkillForm = {
  name: '',
  level: '',
  icon_name: '',
  order_index: 0,
};

export default function AdminSkillsPage() {
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const catForm = useAdminForm(initialCategoryForm);
  const skillForm = useAdminForm(initialSkillForm);

  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [editingSkillId, setEditingSkillId] = useState<number | null>(null);

  const [savingCat, setSavingCat] = useState(false);
  const [savingSkill, setSavingSkill] = useState(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>('');
  const [showCatConfirm, setShowCatConfirm] = useState(false);
  const [showSkillConfirm, setShowSkillConfirm] = useState(false);

  const fetchSkills = useCallback(async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    try {
      const res = await fetch(`${apiUrl}/api/v1/skills`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
        if (data.length > 0 && selectedCategoryId === '') {
          setSelectedCategoryId(data[0].id);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategoryId]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const startEditCategory = (cat: SkillCategory) => {
    if (catForm.isDirty) {
      if (!window.confirm('You have unsaved changes in category form. Switch to editing this category?')) return;
    }
    setEditingCatId(cat.id);
    catForm.setInitial({ name: cat.name || '', order_index: cat.order_index ?? 0 });
    setMessage(null);
  };

  const cancelEditCategory = () => {
    if (catForm.isDirty && !window.confirm('Discard unsaved category changes?')) return;
    setEditingCatId(null);
    catForm.setInitial(initialCategoryForm);
    setMessage(null);
  };

  const startEditSkill = (skill: Skill) => {
    if (skillForm.isDirty) {
      if (!window.confirm('You have unsaved changes in skill form. Switch to editing this skill?')) return;
    }
    setEditingSkillId(skill.id);
    setSelectedCategoryId(skill.category_id);
    skillForm.setInitial({ name: skill.name || '', level: skill.level || '', icon_name: skill.icon_name || '', order_index: skill.order_index ?? 0 });
    setMessage(null);
  };

  const cancelEditSkill = () => {
    if (skillForm.isDirty && !window.confirm('Discard unsaved skill changes?')) return;
    setEditingSkillId(null);
    skillForm.setInitial(initialSkillForm);
    setMessage(null);
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (editingCatId !== null && !catForm.isDirty) {
      setMessage({ type: 'error', text: 'No changes to save for category.' });
      return;
    }

    if (!catForm.formData.name.trim()) {
      setMessage({ type: 'error', text: 'Category Name is required.' });
      return;
    }

    setShowCatConfirm(true);
  };

  const executeSaveCategory = async () => {
    if (savingCat) return;
    setShowCatConfirm(false);
    setSavingCat(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem('admin_token');

    try {
      const url = editingCatId !== null
        ? `${apiUrl}/api/v1/skills/categories/${editingCatId}`
        : `${apiUrl}/api/v1/skills/categories`;
      const method = editingCatId !== null ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: catForm.formData.name, order_index: Number(catForm.formData.order_index) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to save category');

      setMessage({ type: 'success', text: editingCatId !== null ? 'Category updated successfully!' : 'Category created successfully!' });
      catForm.setInitial(catForm.formData);
      if (editingCatId === null) {
        catForm.setInitial(initialCategoryForm);
      }
      fetchSkills();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error saving category';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSavingCat(false);
    }
  };

  const handleSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (editingSkillId !== null && !skillForm.isDirty) {
      setMessage({ type: 'error', text: 'No changes to save for skill.' });
      return;
    }

    if (!skillForm.formData.name.trim() || selectedCategoryId === '') {
      setMessage({ type: 'error', text: 'Please fill in Skill Name and select Category.' });
      return;
    }

    setShowSkillConfirm(true);
  };

  const executeSaveSkill = async () => {
    if (savingSkill) return;
    setShowSkillConfirm(false);
    setSavingSkill(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem('admin_token');

    try {
      const url = editingSkillId !== null
        ? `${apiUrl}/api/v1/skills/${editingSkillId}`
        : `${apiUrl}/api/v1/skills`;
      const method = editingSkillId !== null ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: skillForm.formData.name,
          level: skillForm.formData.level || null,
          icon_name: skillForm.formData.icon_name || null,
          order_index: Number(skillForm.formData.order_index),
          category_id: Number(selectedCategoryId),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to save skill');

      setMessage({ type: 'success', text: editingSkillId !== null ? 'Skill updated successfully!' : 'Skill added successfully!' });
      skillForm.setInitial(skillForm.formData);
      if (editingSkillId === null) {
        skillForm.setInitial(initialSkillForm);
      }
      fetchSkills();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error saving skill';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSavingSkill(false);
    }
  };

  const handleDeleteCategory = async (catId: number, catName: string) => {
    if (!confirmDelete(`Category: ${catName}`)) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem('admin_token');

    try {
      const res = await fetch(`${apiUrl}/api/v1/skills/categories/${catId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete category');
      setMessage({ type: 'success', text: 'Category deleted successfully!' });
      if (editingCatId === catId) cancelEditCategory();
      fetchSkills();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting category';
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  const handleDeleteSkill = async (skillId: number, skillName: string) => {
    if (!confirmDelete(`Skill: ${skillName}`)) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem('admin_token');

    try {
      const res = await fetch(`${apiUrl}/api/v1/skills/${skillId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete skill');
      setMessage({ type: 'success', text: 'Skill deleted successfully!' });
      if (editingSkillId === skillId) cancelEditSkill();
      fetchSkills();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting skill';
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20 text-slate-500 font-mono text-xs">
          <span className="material-symbols-outlined animate-spin mr-2">sync</span> Loading skills...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {showCatConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-300 animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-slate-100 space-y-5 transform transition-all duration-300 ease-out scale-100 opacity-100 animate-scaleUp">
              <div className="flex items-center gap-3 text-amber-600">
                <span className="material-symbols-outlined text-3xl">help</span>
                <h3 className="text-xl font-bold text-slate-900">Are you sure?</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Do you want to save these changes to this skill category?
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCatConfirm(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeSaveCategory}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-md"
                >
                  Yes, Save Category
                </button>
              </div>
            </div>
          </div>
        )}

        {showSkillConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-300 animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-slate-100 space-y-5 transform transition-all duration-300 ease-out scale-100 opacity-100 animate-scaleUp">
              <div className="flex items-center gap-3 text-amber-600">
                <span className="material-symbols-outlined text-3xl">help</span>
                <h3 className="text-xl font-bold text-slate-900">Are you sure?</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Do you want to save these changes to this skill?
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSkillConfirm(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeSaveSkill}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-md"
                >
                  Yes, Save Skill
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-end pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Manage Skills & Expertise</h1>
            <p className="text-xs font-mono text-slate-500">Organize technical proficiencies into structured categories</p>
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded text-sm flex items-center gap-3 border ${
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
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600">category</span>
                  {editingCatId !== null ? 'Edit Skill Category' : 'Add Skill Category'}
                </span>
                {editingCatId !== null && (
                  <button
                    type="button"
                    onClick={cancelEditCategory}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Cancel Edit
                  </button>
                )}
              </h2>
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Category Name</label>
                  <input
                    type="text"
                    value={catForm.formData.name}
                    onChange={(e) => catForm.setFormData({ ...catForm.formData, name: e.target.value })}
                    placeholder="e.g. Backend & APIs"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Order Index</label>
                  <input
                    type="number"
                    value={catForm.formData.order_index}
                    onChange={(e) => catForm.setFormData({ ...catForm.formData, order_index: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingCat || (editingCatId !== null && !catForm.isDirty)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {savingCat ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-sm">sync</span> Saving...
                    </>
                  ) : editingCatId !== null && !catForm.isDirty ? (
                    <>
                      <span className="material-symbols-outlined text-sm">check</span> No Changes to Save
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">save</span>
                      {editingCatId !== null ? 'Save Changes' : 'Create Category'}
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="bg-white border border-slate-200 rounded p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600">code</span>
                  {editingSkillId !== null ? 'Edit Skill' : 'Add Skill'}
                </span>
                {editingSkillId !== null && (
                  <button
                    type="button"
                    onClick={cancelEditSkill}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Cancel Edit
                  </button>
                )}
              </h2>
              <form onSubmit={handleSkillSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Category</label>
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                  >
                    <option value="" disabled>Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Skill Name</label>
                  <input
                    type="text"
                    value={skillForm.formData.name}
                    onChange={(e) => skillForm.setFormData({ ...skillForm.formData, name: e.target.value })}
                    placeholder="e.g. FastAPI / Python"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Level (Optional)</label>
                  <input
                    type="text"
                    value={skillForm.formData.level}
                    onChange={(e) => skillForm.setFormData({ ...skillForm.formData, level: e.target.value })}
                    placeholder="e.g. Advanced"
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Icon Name (React Icons / Iconify)</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={skillForm.formData.icon_name}
                      onChange={(e) => skillForm.setFormData({ ...skillForm.formData, icon_name: e.target.value })}
                      placeholder="e.g. SiPython, simple-icons:canva"
                      className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                    />
                    {skillForm.formData.icon_name && (
                      <div className="w-9 h-9 border rounded bg-white flex items-center justify-center p-1 flex-shrink-0" title="Live Preview">
                        <IconResolver iconName={skillForm.formData.icon_name} className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">React Icons: SiPython, FaAws | Iconify: simple-icons:canva</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Order Index</label>
                  <input
                    type="number"
                    value={skillForm.formData.order_index}
                    onChange={(e) => skillForm.setFormData({ ...skillForm.formData, order_index: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingSkill || categories.length === 0 || (editingSkillId !== null && !skillForm.isDirty)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {savingSkill ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-sm">sync</span> Saving...
                    </>
                  ) : editingSkillId !== null && !skillForm.isDirty ? (
                    <>
                      <span className="material-symbols-outlined text-sm">check</span> No Changes to Save
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">save</span>
                      {editingSkillId !== null ? 'Save Changes' : 'Add Skill'}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            {categories.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded p-12 text-center text-slate-500">
                <span className="material-symbols-outlined text-3xl mb-2 text-slate-400">code</span>
                <p className="font-medium text-sm">No skill categories found.</p>
              </div>
            ) : (
              categories.map((cat) => {
                const isCatBeingEdited = editingCatId === cat.id;
                return (
                  <div
                    key={cat.id}
                    className={`bg-white border rounded p-6 shadow-sm space-y-4 transition-colors ${
                      isCatBeingEdited ? 'border-blue-300 bg-blue-50/30' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <div>
                        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                          {cat.name}
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            Order: {cat.order_index}
                          </span>
                        </h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => startEditCategory(cat)}
                          className={`p-1.5 rounded transition-colors ${
                            isCatBeingEdited ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50'
                          }`}
                          title="Edit category"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete category"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>

                    {cat.skills && cat.skills.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {cat.skills.map((skill) => {
                          const isSkillBeingEdited = editingSkillId === skill.id;
                          return (
                            <div
                              key={skill.id}
                              className={`flex items-center justify-between p-3 border rounded transition-colors ${
                                isSkillBeingEdited ? 'bg-blue-50/70 border-blue-300' : 'bg-slate-50 border-slate-200'
                              }`}
                            >
                              <div>
                                <p className="font-semibold text-sm text-slate-900">{skill.name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  {skill.level && <span className="text-xs font-mono text-blue-600 bg-blue-50/50 px-1.5 py-0.5 rounded">{skill.level}</span>}
                                  {skill.icon_name && (
                                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                                      <IconResolver iconName={skill.icon_name} className="w-3.5 h-3.5" />
                                      {skill.icon_name}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => startEditSkill(skill)}
                                  className={`p-1 rounded transition-colors ${
                                    isSkillBeingEdited ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50'
                                  }`}
                                  title="Edit skill"
                                >
                                  <span className="material-symbols-outlined text-sm">edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSkill(skill.id, skill.name)}
                                  className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                                  title="Delete skill"
                                >
                                  <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic py-2">No skills in this category yet.</p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
