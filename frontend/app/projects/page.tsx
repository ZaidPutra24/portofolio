'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FolderGit2 } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';
import SectionHeader from '@/components/SectionHeader';

interface Technology {
  id: number;
  name: string;
}

interface Project {
  id: number;
  title: string;
  slug: string;
  summary: string;
  year: number;
  thumbnail_url?: string;
  github_url?: string;
  demo_url?: string;
  is_featured: boolean;
  technologies?: Technology[];
}

const CATEGORIES = [
  { label: 'All', value: 'all' },
  { label: 'AI / ML', value: 'ai' },
  { label: 'Web', value: 'web' },
  { label: 'Data', value: 'data' },
  { label: 'Research', value: 'research' },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    async function fetchProjects() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      try {
        const res = await fetch(`${apiUrl}/api/v1/projects?status=published`);
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  const getProjectCategory = (proj: Project) => {
    const text = (proj.title + ' ' + proj.summary + ' ' + (proj.technologies?.map(t => t.name).join(' ') || '')).toLowerCase();
    if (text.includes('ai') || text.includes('neural') || text.includes('vision') || text.includes('yolo') || text.includes('model') || text.includes('embedding') || text.includes('machine learning')) return 'ai';
    if (text.includes('web') || text.includes('react') || text.includes('next') || text.includes('saas') || text.includes('gateway') || text.includes('frontend') || text.includes('full-stack')) return 'web';
    if (text.includes('vector') || text.includes('database') || text.includes('sql') || text.includes('search') || text.includes('data') || text.includes('cluster')) return 'data';
    if (text.includes('research') || text.includes('quantum') || text.includes('simulation') || text.includes('algorithm')) return 'research';
    return 'web';
  };

  const filteredProjects = useMemo(() => {
    if (activeFilter === 'all') return projects;
    return projects.filter(p => getProjectCategory(p) === activeFilter);
  }, [projects, activeFilter]);

  const featuredProject = useMemo(() => {
    return filteredProjects.find(p => p.is_featured) || filteredProjects[0] || null;
  }, [filteredProjects]);

  const secondaryProjects = useMemo(() => {
    if (!featuredProject) return filteredProjects;
    return filteredProjects.filter(p => p.id !== featuredProject.id);
  }, [filteredProjects, featuredProject]);

  return (
    <div className="portfolio-root min-h-screen flex flex-col justify-between">
      <Navbar />

      <main style={{ padding: '140px 0 80px' }}>
        <div className="wrap">
          <div className="mb-8">
            <Link href="/" className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '12px' }}>
              ← Back to Home
            </Link>
          </div>

          <SectionHeader
            label="PORTFOLIO SHOWCASE"
            title="All Projects &"
            accentTitle="works."
            description="Explore a comprehensive collection of full-stack web applications, AI/ML models, and technical research projects I have built and delivered."
          />

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-12">
            {CATEGORIES.map(cat => (
              <button
                type="button"
                key={cat.value}
                onClick={() => setActiveFilter(cat.value)}
                className={`text-xs font-medium px-4 py-2 rounded-full border transition-all duration-250 ${
                  activeFilter === cat.value
                    ? 'bg-[var(--ink)] text-white border-[var(--ink)] shadow-sm'
                    : 'bg-[var(--surface)] text-[var(--ink-soft)] border-[var(--border)] hover:border-[var(--blue)] hover:text-[var(--ink)] hover:-translate-y-[1px]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20 text-[var(--ink-soft)] font-mono text-sm">Loading projects...</div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-20 bg-[var(--surface)] rounded-[var(--radius)] border border-[var(--border)] p-8 shadow-sm">
              <FolderGit2 className="w-12 h-12 mx-auto text-[var(--ink-faint)] mb-4" />
              <h3 className="text-lg font-semibold mb-2">No projects found</h3>
              <p className="text-[var(--ink-soft)] text-sm max-w-md mx-auto">
                No projects match this category filter.
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {/* FEATURED PROJECT */}
              {featuredProject && (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-10 shadow-sm transition-all duration-300 hover:border-[var(--blue)] group">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-7 space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="mono text-xs font-bold text-[var(--blue)]">01</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--blue)]" />
                        <span className="mono text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-[var(--blue)] border border-blue-100 uppercase">
                          Featured Project · {featuredProject.year}
                        </span>
                      </div>

                      <h3 className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--ink)] group-hover:text-[var(--blue)] transition-colors" style={{ fontFamily: 'Cabinet Grotesk, Inter, sans-serif' }}>
                        {featuredProject.title}
                      </h3>

                      <p className="text-sm sm:text-base text-[var(--ink-soft)] leading-relaxed">
                        {featuredProject.summary}
                      </p>

                      {featuredProject.technologies && featuredProject.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {featuredProject.technologies.map(tech => (
                            <span key={tech.id} className="tag mono text-[10px]">
                              {tech.name.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="pt-4 flex items-center gap-4">
                        <Link
                          href={`/projects/${featuredProject.slug}`}
                          className="group/link inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--blue)] hover:underline"
                        >
                          <span>View Case Study</span>
                          <span className="transition-transform duration-200 group-hover/link:translate-x-1">→</span>
                        </Link>
                        {featuredProject.github_url && (
                          <a
                            href={featuredProject.github_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)]"
                          >
                            Source ↗
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="lg:col-span-5 flex justify-center">
                      <div className="relative group/vis overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-alt)] shadow-md w-full max-w-lg aspect-[16/10]">
                        {featuredProject.thumbnail_url ? (
                          <img
                            src={getImageUrl(featuredProject.thumbnail_url)}
                            alt={featuredProject.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/vis:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 text-xs font-mono text-[var(--ink-soft)]">
                            System Architecture Visualization
                          </div>
                        )}
                        <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-xl pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECONDARY PROJECTS GRID */}
              {secondaryProjects.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {secondaryProjects.map((project, idx) => {
                    const numStr = String(idx + 2).padStart(2, '0');

                    return (
                      <div
                        key={project.id}
                        className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between transition-all duration-300 hover:border-[var(--blue)] hover:-translate-y-1 group"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="mono text-xs font-bold text-[var(--ink-faint)] group-hover:text-[var(--blue)] transition-colors">{numStr}</span>
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--blue)]/60" />
                              <span className="mono text-xs text-[var(--blue)] font-semibold">{project.year}</span>
                            </div>
                            {project.is_featured && (
                              <span className="text-[10px] mono px-2.5 py-0.5 rounded-full bg-[var(--bg-alt)] border border-[var(--border)] text-[var(--ink-soft)]">
                                Featured
                              </span>
                            )}
                          </div>

                          <div className="relative group/vis overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-alt)] aspect-[16/10] mb-4">
                            {project.thumbnail_url ? (
                              <img
                                src={getImageUrl(project.thumbnail_url)}
                                alt={project.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover/vis:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/50 text-xs font-mono text-[var(--ink-soft)]">
                                Architecture Visual
                              </div>
                            )}
                          </div>

                          <h3 className="text-xl font-bold text-[var(--ink)] leading-snug group-hover:text-[var(--blue)] transition-colors">
                            {project.title}
                          </h3>

                          <p className="text-xs sm:text-sm text-[var(--ink-soft)] leading-relaxed line-clamp-2">
                            {project.summary}
                          </p>

                          {project.technologies && project.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-2">
                              {project.technologies.map(tech => (
                                <span key={tech.id} className="tag mono text-[10px]">
                                  {tech.name.toUpperCase()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="pt-6 mt-6 border-t border-[var(--border)] flex items-center justify-between">
                          <Link
                            href={`/projects/${project.slug}`}
                            className="group/link inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--blue)] hover:underline"
                          >
                            <span>Case Study</span>
                            <span className="transition-transform duration-200 group-hover/link:translate-x-1">→</span>
                          </Link>
                          {project.github_url && (
                            <a
                              href={project.github_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)]"
                            >
                              Source ↗
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
