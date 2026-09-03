import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowLeft, ExternalLink, Calendar, CheckCircle2, Layers, Cpu, Target, Sparkles } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';

interface Technology {
  id: number;
  name: string;
}

interface ProjectImage {
  id: number;
  image_url: string;
  caption?: string;
}

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
  technologies: Technology[];
  images: ProjectImage[];
}

async function getProject(slug: string): Promise<Project | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const res = await fetch(`${apiUrl}/api/v1/projects/${slug}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch project detail:', error);
    return null;
  }
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    return (
      <div className="portfolio-root min-h-screen flex flex-col justify-between">
        <Navbar />
        <div className="wrap" style={{ padding: '160px 0 100px', textAlign: 'center' }}>
          <h1 className="text-3xl font-bold mb-4">Project Not Found</h1>
          <p className="text-[var(--ink-soft)] mb-8">
            The project you are looking for does not exist or has been removed.
          </p>
          <Link
            href="/projects"
            className="btn btn-primary"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Projects
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="portfolio-root min-h-screen flex flex-col justify-between">
      <Navbar />

      <article className="wrap" style={{ padding: '140px 0 80px', maxWidth: '960px' }}>
        <div className="mb-8">
          <Link
            href="/projects"
            className="btn btn-ghost mb-6"
            style={{ padding: '8px 16px', fontSize: '12px' }}
          >
            <ArrowLeft className="w-4 h-4" /> Back to All Projects
          </Link>

          <div className="flex flex-wrap items-center gap-3 mb-4 mt-4">
            <span className="tag mono" style={{ background: 'var(--bg-alt)' }}>
              <Calendar className="w-3.5 h-3.5 inline mr-1" /> {project.year}
            </span>
            {project.is_featured && (
              <span className="tag" style={{ background: 'var(--blue)', color: '#fff' }}>
                Featured Project
              </span>
            )}
            <span className="tag capitalize">
              Status: {project.status}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
            {project.title}
          </h1>

          <p className="text-lg text-[var(--ink-soft)] leading-relaxed mb-8">
            {project.summary}
          </p>

          <div className="flex flex-wrap items-center gap-4 pb-8 border-b border-[var(--border)]">
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                View Repository →
              </a>
            )}
            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
              >
                <ExternalLink className="w-4 h-4" /> Live Demo
              </a>
            )}
          </div>
        </div>

        {/* Thumbnail / Banner */}
        {project.thumbnail_url && (
          <div className="mb-12 rounded-[var(--radius)] overflow-hidden border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm">
            <img
              src={getImageUrl(project.thumbnail_url)}
              alt={project.title}
              className="w-full h-auto max-h-[500px] object-cover rounded-[10px]"
            />
          </div>
        )}

        {/* Technology Stack */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="mb-12 p-6 bg-[var(--surface)] rounded-[var(--radius)] border border-[var(--border)] shadow-sm">
            <h2 className="text-xs font-bold tracking-wider text-[var(--ink-soft)] uppercase mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4" style={{ color: 'var(--blue)' }} /> Technology Stack
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech: Technology) => (
                <span
                  key={tech.id}
                  className="tag mono"
                  style={{ fontSize: '11px', padding: '6px 12px' }}
                >
                  {tech.name.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Sections */}
        <div className="space-y-8">
          {project.background && (
            <section className="bg-[var(--surface)] p-8 rounded-[var(--radius)] border border-[var(--border)] shadow-sm" style={{ opacity: 1, transform: 'none', padding: '32px' }}>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
                <Layers className="w-6 h-6" style={{ color: 'var(--blue)' }} /> Background & Context
              </h2>
              <div className="text-[var(--ink-soft)] leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {project.background}
              </div>
            </section>
          )}

          {project.problem && (
            <section className="bg-[var(--surface)] p-8 rounded-[var(--radius)] border border-[var(--border)] shadow-sm" style={{ opacity: 1, transform: 'none', padding: '32px' }}>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
                <Target className="w-6 h-6 text-amber-500" /> Problem Statement
              </h2>
              <div className="text-[var(--ink-soft)] leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {project.problem}
              </div>
            </section>
          )}

          {project.solution && (
            <section className="bg-[var(--surface)] p-8 rounded-[var(--radius)] border border-[var(--border)] shadow-sm" style={{ opacity: 1, transform: 'none', padding: '32px' }}>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
                <CheckCircle2 className="w-6 h-6 text-emerald-500" /> Proposed Solution
              </h2>
              <div className="text-[var(--ink-soft)] leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {project.solution}
              </div>
            </section>
          )}

          {project.implementation && (
            <section className="bg-[var(--surface)] p-8 rounded-[var(--radius)] border border-[var(--border)] shadow-sm" style={{ opacity: 1, transform: 'none', padding: '32px' }}>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
                <Cpu className="w-6 h-6 text-indigo-500" /> Implementation Details & Architecture
              </h2>
              <div className="text-[var(--ink-soft)] leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {project.implementation}
              </div>
            </section>
          )}

          {project.results && (
            <section className="bg-[var(--surface)] p-8 rounded-[var(--radius)] border border-[var(--border)] shadow-sm" style={{ opacity: 1, transform: 'none', padding: '32px' }}>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
                <Sparkles className="w-6 h-6" style={{ color: 'var(--blue)' }} /> Results & Key Metrics
              </h2>
              <div className="text-[var(--ink-soft)] leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {project.results}
              </div>
            </section>
          )}

          {project.description && !project.background && !project.solution && (
            <section className="bg-[var(--surface)] p-8 rounded-[var(--radius)] border border-[var(--border)] shadow-sm" style={{ opacity: 1, transform: 'none', padding: '32px' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>Project Overview</h2>
              <div className="text-[var(--ink-soft)] leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {project.description}
              </div>
            </section>
          )}
        </div>

        {/* Image Gallery */}
        {project.images && project.images.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>Project Gallery</h2>
            <div className="proj-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {project.images.map((img: ProjectImage) => (
                <div
                  key={img.id}
                  className="proj-card"
                >
                  <div className="proj-visual" style={{ background: 'var(--bg-alt)' }}>
                    <img
                      src={img.image_url}
                      alt={img.caption || 'Project screenshot'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {img.caption && (
                    <p className="text-xs text-[var(--ink-soft)] font-medium mt-2">
                      {img.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </article>

      <Footer />
    </div>
  );
}
