'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { getImageUrl } from '@/lib/utils';
import SectionHeader from '@/components/SectionHeader';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperClass } from 'swiper';
import { EffectCoverflow, Navigation, Pagination, Autoplay } from 'swiper/modules';
import { ChevronLeft, ChevronRight, ArrowRight, ExternalLink } from 'lucide-react';
import { SiGithub } from 'react-icons/si';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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

export default function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperClass | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
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

  // Reset active slide index when activeFilter changes
  useEffect(() => {
    setActiveIndex(0);
    if (swiperRef.current) {
      swiperRef.current.slideTo(0);
    }
  }, [activeFilter]);

  const activeProject = filteredProjects[activeIndex] || filteredProjects[0] || null;

  return (
    <section id="work" className="py-24 relative overflow-hidden">
      <div className="wrap relative z-10">
        <SectionHeader
          label="SELECTED WORK"
          title="Projects worth a"
          accentTitle="second look."
          description="Selected projects that solve real problems with robust architecture and clean engineering."
        />

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-10">
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
          <div className="text-center py-20 text-[var(--ink-soft)] font-mono text-sm">Curating showcase...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20 bg-[var(--surface)] rounded-[var(--radius)] border border-[var(--border)] p-8 shadow-sm">
            <p className="font-medium text-[var(--ink-soft)]">No projects found in this category.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 3D COVERFLOW CAROUSEL AREA */}
            <div className="relative w-full overflow-visible py-4">
              <Swiper
                onSwiper={(swiper) => {
                  swiperRef.current = swiper;
                }}
                effect={'coverflow'}
                grabCursor={true}
                centeredSlides={true}
                slidesPerView={'auto'}
                slideToClickedSlide={true}
                initialSlide={0}
                speed={500}
                coverflowEffect={{
                  rotate: 15,
                  stretch: 0,
                  depth: 180,
                  modifier: 1.2,
                  slideShadows: false,
                }}
                modules={[EffectCoverflow, Navigation, Pagination, Autoplay]}
                onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                className="project-coverflow-swiper !overflow-visible !py-6"
              >
                {filteredProjects.map((project, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <SwiperSlide
                      key={project.id}
                      className="!w-[280px] sm:!w-[460px] md:!w-[580px] lg:!w-[660px] aspect-[16/10] transition-all duration-300"
                    >
                      <div
                        className={`w-full h-full rounded-2xl overflow-hidden border transition-all duration-500 relative group cursor-pointer ${
                          isActive
                            ? 'bg-white border-[var(--blue)] shadow-[0_20px_40px_-15px_rgba(37,84,255,0.15)] ring-2 ring-[var(--blue)]/20'
                            : 'bg-white border-[var(--border)] shadow-md opacity-80 hover:opacity-100'
                        }`}
                      >
                        {project.thumbnail_url ? (
                          <img
                            src={getImageUrl(project.thumbnail_url)}
                            alt={project.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/80 p-6 text-center">
                            <span className="mono text-xs font-semibold text-[var(--blue)] mb-2 uppercase tracking-wider">
                              {project.year} · Architecture
                            </span>
                            <span className="text-lg sm:text-2xl font-bold text-[var(--ink)] font-sans max-w-md">
                              {project.title}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-2xl pointer-events-none" />
                      </div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>

              {/* CAROUSEL NAVIGATION CONTROLS */}
              {filteredProjects.length > 1 && (
                <div className="flex items-center justify-center gap-4 mt-2">
                  <button
                    type="button"
                    onClick={() => swiperRef.current?.slidePrev()}
                    aria-label="Previous Project"
                    className="w-10 h-10 rounded-full border border-[var(--border)] bg-white hover:border-[var(--blue)] hover:text-[var(--blue)] text-[var(--ink-soft)] flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <span className="mono text-xs text-[var(--ink-soft)] font-semibold tracking-wider px-2">
                    {String(activeIndex + 1).padStart(2, '0')} / {String(filteredProjects.length).padStart(2, '0')}
                  </span>

                  <button
                    type="button"
                    onClick={() => swiperRef.current?.slideNext()}
                    aria-label="Next Project"
                    className="w-10 h-10 rounded-full border border-[var(--border)] bg-white hover:border-[var(--blue)] hover:text-[var(--blue)] text-[var(--ink-soft)] flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* CENTERED PROJECT DETAILS BELOW CAROUSEL */}
            {activeProject && (
              <div key={activeProject.id} className="max-w-2xl mx-auto text-center space-y-4 pt-4 px-4 transition-all duration-300 animate-fadeIn">
                {/* Badge & Year */}
                <div className="flex items-center justify-center gap-3">
                  <span className="mono text-xs font-bold text-[var(--blue)]">
                    {String(activeIndex + 1).padStart(2, '0')}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--blue)]" />
                  <span className="mono text-xs font-semibold px-3.5 py-1 rounded-full bg-blue-50 text-[var(--blue)] border border-blue-100 uppercase tracking-wide">
                    {activeProject.is_featured ? 'Featured Project' : 'Selected Project'} · {activeProject.year}
                  </span>
                </div>

                {/* Project Title */}
                <h3
                  className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--ink)]"
                  style={{ fontFamily: 'Cabinet Grotesk, Inter, sans-serif' }}
                >
                  {activeProject.title}
                </h3>

                {/* Project Summary */}
                <p className="text-sm sm:text-base text-[var(--ink-soft)] leading-relaxed max-w-xl mx-auto">
                  {activeProject.summary}
                </p>

                {/* Technologies Stack */}
                {activeProject.technologies && activeProject.technologies.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                    {activeProject.technologies.map(tech => (
                      <span key={tech.id} className="tag mono text-[10px]">
                        {tech.name.toUpperCase()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-4 flex items-center justify-center gap-3 flex-wrap">
                  <Link
                    href={`/projects/${activeProject.slug}`}
                    className="btn btn-primary text-xs font-semibold rounded-full px-6 py-2.5 inline-flex items-center gap-2 group/btn"
                  >
                    <span>View Case Study</span>
                    <ArrowRight size={14} className="transition-transform duration-200 group-hover/btn:translate-x-1" />
                  </Link>
                  {activeProject.github_url && (
                    <a
                      href={activeProject.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-ghost text-xs font-semibold rounded-full px-5 py-2.5 inline-flex items-center gap-1.5"
                    >
                      <SiGithub className="w-3.5 h-3.5" />
                      <span>Source Code</span>
                      <ExternalLink size={12} className="opacity-60" />
                    </a>
                  )}
                  {activeProject.demo_url && (
                    <a
                      href={activeProject.demo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-ghost text-xs font-semibold rounded-full px-5 py-2.5 inline-flex items-center gap-1.5"
                    >
                      <span>Live Demo</span>
                      <ExternalLink size={12} className="opacity-60" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
