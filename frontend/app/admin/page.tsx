'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { adminApiFetch } from '@/lib/utils';

interface SkillCategory {
  skills?: unknown[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    projects: 0,
    publications: 0,
    certificates: 0,
    skills: 0,
    experiences: 0,
    messages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('admin_token');

      try {
        const [projRes, pubRes, certRes, skillRes, expRes, msgRes] = await Promise.all([
          fetch(`${apiUrl}/api/v1/projects`).catch(() => ({ ok: false })),
          fetch(`${apiUrl}/api/v1/academic/publications`).catch(() => ({ ok: false })),
          fetch(`${apiUrl}/api/v1/academic/certificates`).catch(() => ({ ok: false })),
          fetch(`${apiUrl}/api/v1/skills`).catch(() => ({ ok: false })),
          fetch(`${apiUrl}/api/v1/experiences`).catch(() => ({ ok: false })),
          adminApiFetch(`${apiUrl}/api/v1/contact/messages`).catch(() => ({ ok: false })),
        ]);

        let projectCount = 0;
        if (projRes.ok && 'json' in projRes) {
          const data = await projRes.json();
          projectCount = Array.isArray(data) ? data.length : 0;
        }

        let pubCount = 0;
        if (pubRes.ok && 'json' in pubRes) {
          const data = await pubRes.json();
          pubCount = Array.isArray(data) ? data.length : 0;
        }

        let certCount = 0;
        if (certRes.ok && 'json' in certRes) {
          const data = await certRes.json();
          certCount = Array.isArray(data) ? data.length : 0;
        }

        let skillCount = 0;
        if (skillRes.ok && 'json' in skillRes) {
          const data = await skillRes.json();
          if (Array.isArray(data)) {
            skillCount = data.reduce((acc: number, cat: SkillCategory) => acc + (cat.skills ? cat.skills.length : 0), 0);
          }
        }

        let expCount = 0;
        if (expRes.ok && 'json' in expRes) {
          const data = await expRes.json();
          expCount = Array.isArray(data) ? data.length : 0;
        }

        let msgCount = 0;
        if (msgRes.ok && 'json' in msgRes) {
          const data = await msgRes.json();
          msgCount = Array.isArray(data) ? data.length : 0;
        }

        setStats({
          projects: projectCount,
          publications: pubCount,
          certificates: certCount,
          skills: skillCount,
          experiences: expCount,
          messages: msgCount,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Projects', value: stats.projects, icon: 'folder_open', href: '/admin/projects' },
    { title: 'Publications', value: stats.publications, icon: 'book', href: '/admin/publications' },
    { title: 'Certificates', value: stats.certificates, icon: 'verified', href: '/admin/certificates' },
    { title: 'Skills Managed', value: stats.skills, icon: 'code', href: '/admin/skills' },
    { title: 'Experiences', value: stats.experiences, icon: 'work_outline', href: '/admin/experience' },
    { title: 'Contact Messages', value: stats.messages, icon: 'mail', href: '/admin/messages' },
  ];

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="flex justify-between items-end pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Dashboard Overview</h1>
            <p className="text-xs font-mono text-slate-500">System Status: Active • Portfolio Archive v2.0</p>
          </div>
        </div>

        {/* Welcome Card */}
        <div className="bg-white border border-slate-200 rounded p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-mono text-xs mb-3">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span> Live Archive
              </span>
              <h2 className="text-xl font-bold text-slate-900">Welcome back, Administrator</h2>
              <p className="text-sm text-slate-600 mt-1">
                Manage your professional portfolio content, research outputs, and incoming inquiries with structural precision.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="bg-white border border-slate-200 rounded p-5 shadow-sm hover:border-blue-600 transition-colors flex items-center justify-between group"
            >
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-slate-500">{card.title}</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">
                  {loading ? '...' : card.value}
                </p>
              </div>
              <div className="w-10 h-10 rounded bg-slate-50 border border-slate-200 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-lg">{card.icon}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
