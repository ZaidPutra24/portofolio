'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { getImageUrl } from '@/lib/utils';
import SectionHeader from '@/components/SectionHeader';

interface Achievement {
  id: number;
  title: string;
  category: string;
  issuer: string;
  year_date: string;
  description?: string;
  credential_url?: string;
  evidence_url?: string;
}

const CATEGORIES = [
  { label: 'All', value: 'all' },
  { label: 'Competition', value: 'competition' },
  { label: 'Academic', value: 'academic' },
  { label: 'Research', value: 'research' },
  { label: 'Scholarship', value: 'scholarship' },
  { label: 'Professional', value: 'professional' },
  { label: 'Recognition', value: 'recognition' },
];

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 101,
    title: "Best Poster – 5th International Conference on Green Sustainable Technology & Management",
    issuer: "INTI International University, Malaysia",
    year_date: "2026-07-22",
    category: "Research",
    description: "Recognized for outstanding presentation and research paper output on sustainable energy AI optimization models in Southeast Asia.",
    evidence_url: "icgstm_certificate_2026.pdf",
    credential_url: "#",
  },
  {
    id: 102,
    title: "1st Place – Marine Transportation National Scientific Paper Competition 2026",
    issuer: "Faculty of Engineering, Universitas Halu Oleo",
    year_date: "2026-05-24",
    category: "Competition",
    description: "Awarded 1st place champion in national scientific paper competition for spatial optimization models in marine logistics.",
    evidence_url: "lkti_1st_place_award.pdf",
    credential_url: "#",
  },
  {
    id: 103,
    title: "Funding Recipient – PKM-KI (Karya Inovatif), Program Kreativitas Mahasiswa 2026",
    issuer: "Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi",
    year_date: "2026-05-25",
    category: "Scholarship",
    description: "National research funding grant awarded by Ministry of Education for innovative tech hardware and AI system prototype execution.",
    evidence_url: "pkm_ki_grant_letter_2026.pdf",
    credential_url: "#",
  },
  {
    id: 104,
    title: "Participant & Top Finalist – GAMMAFEST Data Science 2026",
    issuer: "HMP Gamma Sigma Beta",
    year_date: "2026-06-07",
    category: "Academic",
    description: "Official credential recognition for national level data science and machine learning predictive modeling competition.",
    evidence_url: "gammafest_datascience_2026.pdf",
    credential_url: "#",
  },
];

export default function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState('all');

  // Showcase Slideshow State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progressValue, setProgressValue] = useState(0);

  // Evidence Lightbox Drawer State
  const [modalData, setModalData] = useState<{
    isOpen: boolean;
    title: string;
    issuer: string;
    date: string;
    desc: string;
    evidence_url?: string;
    credential_url?: string;
  } | null>(null);

  // DOM Refs
  const gridRef = useRef<HTMLDivElement>(null);
  const modalBoxRef = useRef<HTMLDivElement>(null);

  // Fetch Achievements from API
  useEffect(() => {
    async function fetchAch() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      try {
        const res = await fetch(`${apiUrl}/api/v1/academic/achievements`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const sorted = data.sort(
              (a: Achievement, b: Achievement) =>
                new Date(b.year_date).getTime() - new Date(a.year_date).getTime()
            );
            setAchievements(sorted);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAch();
  }, []);

  const allItems = achievements.length > 0 ? achievements : DEFAULT_ACHIEVEMENTS;

  const filteredAchievements = activeCat === 'all'
    ? allItems
    : allItems.filter(
        (ach) => ach.category.toLowerCase() === activeCat.toLowerCase()
      );



  // Showcase Items
  const showcaseList = allItems.slice(0, 3).map((item, idx) => ({
    id: item.id,
    index: `${idx + 1} / ${Math.min(allItems.length, 3)}`,
    date: item.year_date || '',
    title: item.title || '',
    issuer: item.issuer ? (item.issuer.startsWith('Issued by') ? item.issuer : `Issued by ${item.issuer}`) : 'Issued by Unknown',
    desc: item.description || 'Recognized for outstanding presentation and research paper output in academic and professional settings.',
    fileName: item.evidence_url ? item.evidence_url.split('/').pop() || 'certificate_document.pdf' : 'certificate_document.pdf',
    docTitle: `${(item.title || '').toUpperCase()} DOCUMENT`,
    evidence_url: item.evidence_url,
    credential_url: item.credential_url,
  }));

  // Auto Slideshow Progress Interval (5 Seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setProgressValue((prev) => {
        if (prev >= 100) {
          setCurrentSlide((s) => (s + 1) % showcaseList.length);
          return 0;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [showcaseList.length]);

  const setSlide = (index: number) => {
    setCurrentSlide(index);
    setProgressValue(0);
  };

  // GSAP Filter Stagger Animation on Grid Cards
  useEffect(() => {
    if (gridRef.current) {
      const items = gridRef.current.querySelectorAll('.award-item');
      if (items.length > 0) {
        gsap.fromTo(
          items,
          { opacity: 0, scale: 0.95, y: 15 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.35,
            stagger: 0.05,
            ease: 'back.out(1.2)',
          }
        );
      }
    }
  }, [activeCat, filteredAchievements.length]);

  // Modal Dialog Handlers
  const openEvidenceModal = (
    title: string,
    issuer: string,
    date: string,
    desc: string,
    evidence_url?: string,
    credential_url?: string
  ) => {
    setModalData({
      isOpen: true,
      title: title || '',
      issuer: issuer ? (issuer.startsWith('Issued by') ? issuer : `Issued by ${issuer}`) : 'Issued by Unknown',
      date: date || '',
      desc: desc || '',
      evidence_url,
      credential_url,
    });
  };

  useEffect(() => {
    if (modalData?.isOpen && modalBoxRef.current) {
      gsap.fromTo(
        modalBoxRef.current,
        { scale: 0.85, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.4)' }
      );
    }
  }, [modalData?.isOpen]);

  const closeEvidenceModal = () => {
    if (modalBoxRef.current) {
      gsap.to(modalBoxRef.current, {
        scale: 0.9,
        opacity: 0,
        y: 15,
        duration: 0.25,
        onComplete: () => setModalData(null),
      });
    } else {
      setModalData(null);
    }
  };

  const currentShowcase = showcaseList[currentSlide] || showcaseList[0];

  const isPdf = (url?: string) => (url ? url.toLowerCase().endsWith('.pdf') : false);

  // Continuous Marquee Loop Items
  const marqueeItems = allItems.length >= 4 ? allItems : [...allItems, ...DEFAULT_ACHIEVEMENTS];

  return (
    <section id="achievements" className="py-16 sm:py-24 relative overflow-hidden">
      {/* Styles for Tab Slider, Border Beam, Floating Bobbing, and Marquee */}
      <style>{`
        .marquee-track {
          display: flex;
          width: max-content;
          animation: auto-scroll-marquee 28s linear infinite;
        }

        .marquee-wrapper:hover .marquee-track {
          animation-play-state: paused;
        }

        @keyframes auto-scroll-marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }

        .auto-float-slow {
          animation: float-slow-motion 5s ease-in-out infinite alternate;
        }

        .auto-float-fast {
          animation: float-fast-motion 3.5s ease-in-out infinite alternate;
        }

        @keyframes float-slow-motion {
          0% { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-4px) rotate(0.4deg); }
        }

        @keyframes float-fast-motion {
          0% { transform: translateY(0px) scale(1); }
          100% { transform: translateY(-3px) scale(1.01); }
        }

        .border-beam {
          position: absolute;
          inset: -1px;
          border-radius: 1.5rem;
          padding: 1.5px;
          background: linear-gradient(90deg, transparent, rgba(37, 84, 255, 0.9), rgba(37, 84, 255, 0.4), transparent);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0.7;
          animation: beam-spin 4s linear infinite;
          pointer-events: none;
        }

        @keyframes beam-spin {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(226, 232, 240, 0.9);
          box-shadow: 0 20px 40px -15px rgba(37, 84, 255, 0.08);
        }
      `}</style>

      <div className="wrap max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        {/* Standard Preserved Section Header */}
        <header className="space-y-6">
          <SectionHeader
            label="AWARDS & RECOGNITION"
            title="Recognition that marks the"
            accentTitle="work."
            description="Selected achievements, competitions, academic recognition, and verified certificates."
          />

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-10">
            {CATEGORIES.map((cat) => {
              const isActive = activeCat === cat.value;
              return (
                <button
                  type="button"
                  key={cat.value}
                  onClick={() => setActiveCat(cat.value)}
                  className={`text-xs font-medium px-4 py-2 rounded-full border transition-all duration-250 capitalize cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[var(--ink)] text-white border-[var(--ink)] shadow-sm'
                      : 'bg-[var(--surface)] text-[var(--ink-soft)] border-[var(--border)] hover:border-[var(--blue)] hover:text-[var(--ink)] hover:-translate-y-[1px]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </header>

        {/* SECTION 1: AUTONOMOUS SELF-PLAYING VISUAL SHOWCASE SLIDESHOW */}
        {currentShowcase && (
          <div className="glass-card rounded-3xl px-6 py-6 sm:px-10 sm:py-8 lg:px-14 lg:py-10 overflow-hidden relative group">
            <div className="border-beam"></div>

            {/* Auto Progress Bar */}
            <div className="absolute top-0 left-0 right-0 bg-slate-100 h-1 z-20">
              <div
                className="h-full bg-[#2554ff] transition-all duration-100 ease-linear"
                style={{ width: `${progressValue}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start content-start pt-2 relative z-10">
              {/* Left Column: Dynamic Content Info */}
              <div className="lg:col-span-6 self-start flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-0.5 text-[10px] sm:text-[11px] font-bold text-[#2554ff] bg-blue-50 border border-blue-100 rounded-full font-mono uppercase">
                      FEATURED SHOWCASE • {currentShowcase.index}
                    </span>
                    <span className="text-xs font-medium text-slate-400 font-mono">
                      {currentShowcase.date}
                    </span>
                  </div>

                  <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 leading-snug transition-all duration-500 mb-2">
                    {currentShowcase.title}
                  </h2>

                  <p className="text-xs font-semibold text-[#2554ff] font-mono mb-2">
                    {currentShowcase.issuer}
                  </p>

                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {currentShowcase.desc}
                  </p>
                </div>

                {/* Interactive Control Dots */}
                <div className="flex items-center gap-3 pt-2">
                  {showcaseList.map((_, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setSlide(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                      className={`slide-dot transition-all cursor-pointer ${
                        idx === currentSlide
                          ? 'w-8 h-2 rounded-full bg-[#2554ff]'
                          : 'w-2.5 h-2 rounded-full bg-slate-200 hover:bg-blue-300'
                      }`}
                    ></button>
                  ))}
                  <span className="text-[11px] text-slate-400 font-mono ml-2">
                    Auto-cycling every 5s
                  </span>
                </div>
              </div>

              {/* Right Column: Visual Frame Mockup */}
              <div className="lg:col-span-6 self-start">
                <div
                  className="relative bg-slate-900 rounded-xl p-3 sm:p-4 shadow-lg overflow-hidden border border-slate-800 text-white cursor-pointer group/frame"
                  onClick={() =>
                    openEvidenceModal(
                      currentShowcase.title,
                      currentShowcase.issuer,
                      currentShowcase.date,
                      currentShowcase.desc,
                      currentShowcase.evidence_url,
                      currentShowcase.credential_url
                    )
                  }
                >
                  {/* Window Controls Mockup */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-400/80 shrink-0"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500/80 shrink-0"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600/80 shrink-0"></span>
                      <span className="text-[10px] font-mono text-slate-400 ml-2 truncate max-w-[120px] sm:max-w-[180px]">
                        {currentShowcase.fileName}
                      </span>
                    </div>
                    <span className="text-[9px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-mono flex items-center gap-1 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span> Verified Document
                    </span>
                  </div>

                  {/* Document Render Mockup */}
                  <div className="bg-slate-800/90 rounded-lg py-3 px-4 max-h-[140px] flex flex-col items-center justify-center text-center space-y-2 relative overflow-hidden group/box">
                    {currentShowcase.evidence_url && !isPdf(currentShowcase.evidence_url) ? (
                      <div className="relative w-full h-auto max-h-[160px] overflow-hidden rounded">
                        <img
                          src={getImageUrl(currentShowcase.evidence_url)}
                          alt={currentShowcase.title}
                          className="max-h-[160px] w-full object-contain group-hover/box:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded shadow flex items-center justify-center text-white font-bold font-mono text-[9px] group-hover/box:scale-110 transition-transform duration-300">
                        PDF
                      </div>
                    )}

                            <div className="space-y-0.5">
                              <p className="text-[11px] font-bold text-slate-200 font-mono line-clamp-1">
                                {currentShowcase.docTitle}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                Click to expand high-resolution evidence document
                              </p>
                            </div>

                            {/* Hover Overlay Button */}
                            <div className="absolute inset-0 bg-blue-950/60 backdrop-blur-xs opacity-0 group-hover/box:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="bg-white text-slate-900 text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                                Click to View Full Document ↗
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

        {/* SECTION 2: INFINITE AUTO-SCROLLING MARQUEE STRIP */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase font-mono">
              Continuous Milestone Ticker (Auto-Scrolling)
            </h3>
            <span className="text-[11px] text-[#2554ff] font-mono">Hover to pause</span>
          </div>

          <div className="marquee-wrapper overflow-hidden bg-slate-50 py-4 rounded-2xl border border-slate-200/80 relative">
            <div className="marquee-track space-x-4">
              {/* Double mapping for infinite smooth seamless loop */}
              {[...marqueeItems, ...marqueeItems].map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  className="inline-flex items-center gap-3 bg-white px-5 py-2.5 rounded-xl border border-slate-200 shadow-2xs shrink-0 cursor-pointer hover:border-blue-300 transition-colors"
                  onClick={() =>
                    openEvidenceModal(
                      item.title,
                      item.issuer,
                      item.year_date,
                      item.description || 'Verified credential.',
                      item.evidence_url,
                      item.credential_url
                    )
                  }
                >
                  <span className="text-base text-[#2554ff]">✦</span>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{item.title}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{item.issuer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 3: VISUAL GRID DECK WITH FILTERING */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 gap-6" id="awards-grid">
          {loading ? (
            <div className="col-span-full text-center py-12 text-slate-400 font-mono text-xs">
              Curating achievements...
            </div>
          ) : filteredAchievements.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 p-8">
              <p className="text-sm font-medium text-slate-500">
                No achievements found in this category.
              </p>
            </div>
          ) : (
            filteredAchievements.map((item, idx) => (
              <article
                key={item.id}
                className={`award-item glass-card rounded-2xl p-5 space-y-4 hover:border-blue-400 transition-all duration-300 group cursor-pointer ${
                  idx % 2 === 0 ? 'auto-float-fast' : 'auto-float-slow'
                }`}
                onClick={() =>
                  openEvidenceModal(
                    item.title || 'Untitled',
                    item.issuer || 'Unknown Issuer',
                    item.year_date || '',
                    item.description || 'Verified academic and professional credential.',
                    item.evidence_url,
                    item.credential_url
                  )
                }
              >
                {/* Top Badge */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2554ff] font-mono">
                    {item.year_date || ''}
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold uppercase">
                    {item.category || 'competition'}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-1.5">
                  <h4 className="text-base font-bold text-slate-900 group-hover:text-[#2554ff] transition-colors line-clamp-2">
                    {item.title || 'Untitled'}
                  </h4>
                  <p className="text-xs text-slate-500 font-mono truncate">{item.issuer || 'Unknown Issuer'}</p>
                </div>

                {/* Footer Action */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-[#2554ff]">
                  <span>View Evidence</span>
                  <span className="group-hover:translate-x-1 transition-transform">↗</span>
                </div>
              </article>
            ))
          )}
        </div>

        {/* EVIDENCE LIGHTBOX MODAL */}
        {modalData?.isOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md transition-opacity duration-300"
            onClick={closeEvidenceModal}
          >
            <div
              ref={modalBoxRef}
              className="bg-white max-w-xl w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={closeEvidenceModal}
                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>

              <div className="space-y-2">
                <span className="px-3 py-1 text-xs font-bold text-[#2554ff] bg-blue-50 border border-blue-200 rounded-full font-mono inline-block">
                  {modalData.date}
                </span>
                <h3 className="text-xl font-bold text-slate-900 leading-snug">
                  {modalData.title}
                </h3>
                <p className="text-xs font-semibold text-[#2554ff] font-mono">
                  {modalData.issuer}
                </p>
              </div>

              {/* Evidence Media Preview if file attached */}
              {modalData.evidence_url && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#2554ff] font-bold text-xs flex items-center justify-center font-mono">
                      {isPdf(modalData.evidence_url) ? 'PDF' : 'IMG'}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-900 truncate max-w-xs">
                        {modalData.evidence_url.split('/').pop()}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">Attached Evidence Document</p>
                    </div>
                  </div>
                  <a
                    href={getImageUrl(modalData.evidence_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-[#2554ff] hover:underline"
                  >
                    Open File ↗
                  </a>
                </div>
              )}

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase font-mono">
                  Evidence Description
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {modalData.desc}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-[#2554ff] font-medium flex items-center gap-1 font-mono">
                  ✓ Digital Credential Verified
                </span>
                <button
                  type="button"
                  onClick={closeEvidenceModal}
                  className="px-5 py-2 bg-[#2554ff] text-white rounded-full text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}