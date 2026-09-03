'use client';

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import SectionHeader from '@/components/SectionHeader';
import {
  Grid,
  List,
  GitCommit,
  Copy,
  Check,
  ExternalLink,
  X,
  Quote,
  ArrowRight,
} from 'lucide-react';
import gsap from 'gsap';

interface Publication {
  id: number;
  title: string;
  authors: string;
  publisher_venue: string;
  year: number;
  doi?: string;
  publication_url?: string;
  pdf_url?: string;
  category?: string;
  type?: string;
  status?: string;
  citations?: number;
  abstract?: string;
  bibtex?: string;
}

const MOCK_PUBLICATIONS: Publication[] = [
  {
    id: 1,
    title: "Scalable Vector Search and Retrieval-Augmented Generation in High-Dimensional Embedding Spaces",
    authors: "Zaid Helsinki, E. Vance, A. Thorne",
    publisher_venue: "IEEE Transactions on Neural Networks & Learning Systems (TNNLS)",
    year: 2024,
    type: "Journal Article",
    status: "Published",
    citations: 38,
    doi: "10.1109/TNNLS.2024.3389102",
    publication_url: "https://doi.org/10.1109/TNNLS.2024.3389102",
    category: "ai",
    abstract: "We introduce a novel hierarchical clustering index for sub-millisecond similarity queries across multi-billion item embedding datasets. Our approach achieves a 4.2x latency reduction compared to standard HNSW indices while maintaining a 98.6% recall rate on standard benchmark datasets.",
    bibtex: `@article{helsinki2024scalable,
  title={Scalable Vector Search and Retrieval-Augmented Generation in High-Dimensional Embedding Spaces},
  author={Helsinki, Zaid and Vance, E. and Thorne, A.},
  journal={IEEE Transactions on Neural Networks and Learning Systems},
  volume={35},
  number={4},
  pages={1042--1056},
  year={2024},
  publisher={IEEE}
}`
  },
  {
    id: 2,
    title: "Autonomous Agent Consensus Mechanisms for Distributed Edge Computing Frameworks",
    authors: "Zaid Helsinki, M. Kowalski",
    publisher_venue: "ACM Conference on Embedded Networked Sensor Systems (SenSys '23)",
    year: 2023,
    type: "Conference Paper",
    status: "Peer Reviewed",
    citations: 24,
    doi: "10.1145/3583133.3596321",
    publication_url: "https://doi.org/10.1145/3583133.3596321",
    category: "systems",
    abstract: "This paper presents a fault-tolerant agent consensus protocol engineered specifically for ultra-low latency edge compute topology. By leveraging lightweight cryptographic proofs and asynchronous state synchronization, the protocol withstands up to 35% Byzantine node faults.",
    bibtex: `@inproceedings{helsinki2023autonomous,
  title={Autonomous Agent Consensus Mechanisms for Distributed Edge Computing Frameworks},
  author={Helsinki, Zaid and Kowalski, M.},
  booktitle={Proceedings of the 21st ACM Conference on Embedded Networked Sensor Systems},
  pages={215--228},
  year={2023}
}`
  },
  {
    id: 3,
    title: "Zero-Shot Cross-Lingual Domain Adaptation using Contrastive Multi-Task Embeddings",
    authors: "Zaid Helsinki, S. Rahman, L. Zhang",
    publisher_venue: "Association for Computational Linguistics (ACL Findings '23)",
    year: 2023,
    type: "Conference Paper",
    status: "Peer Reviewed",
    citations: 19,
    doi: "10.18653/v1/2023.findings-acl.412",
    publication_url: "https://doi.org/10.18653/v1/2023.findings-acl.412",
    category: "ai",
    abstract: "We evaluate zero-shot cross-lingual capabilities of contrastively aligned transformers when applied to low-resource domain adaptation tasks. Empirical results across 14 languages demonstrate state-of-the-art accuracy with zero target-language supervised samples.",
    bibtex: `@inproceedings{helsinki2023zero,
  title={Zero-Shot Cross-Lingual Domain Adaptation using Contrastive Multi-Task Embeddings},
  author={Helsinki, Zaid and Rahman, S. and Zhang, L.},
  booktitle={Findings of the Association for Computational Linguistics: ACL 2023},
  pages={6540--6552},
  year={2023}
}`
  },
  {
    id: 4,
    title: "Asynchronous Microservices Gateway Architecture for High-Throughput Real-Time Pipelines",
    authors: "Zaid Helsinki",
    publisher_venue: "Journal of Systems and Software Architecture",
    year: 2022,
    type: "Journal Article",
    status: "Published",
    citations: 31,
    doi: "10.1016/j.jss.2022.111402",
    publication_url: "https://doi.org/10.1016/j.jss.2022.111402",
    category: "systems",
    abstract: "A comprehensive analysis of non-blocking I/O event loops and backpressure management in distributed API gateways handling over 500,000 requests per second. Includes benchmark suites and open-source implementation guidelines.",
    bibtex: `@article{helsinki2022asynchronous,
  title={Asynchronous Microservices Gateway Architecture for High-Throughput Real-Time Pipelines},
  author={Helsinki, Zaid},
  journal={Journal of Systems and Software Architecture},
  volume={188},
  pages={111402},
  year={2022},
  publisher={Elsevier}
}`
  }
];

const CATEGORIES = [
  { label: 'All', value: 'all' },
  { label: 'AI / ML', value: 'ai' },
  { label: 'Systems', value: 'systems' },
];

/* ---------- MAGNETIC BUTTON / WRAPPER PHYSICS ---------- */
function MagneticButton({
  children,
  className = '',
  onClick,
  type = 'button',
  strength = 0.38,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  strength?: number;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;

    gsap.to(btnRef.current, {
      x: dx * strength,
      y: dy * strength,
      duration: 0.3,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  };

  const handleMouseLeave = () => {
    if (!btnRef.current) return;
    gsap.to(btnRef.current, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.4)',
      overwrite: 'auto',
    });
  };

  return (
    <button
      ref={btnRef}
      type={type}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </button>
  );
}

/* ---------- MULTI-LAYER 3D DEPTH PARALLAX BENTO CARD ---------- */
function BentoCard({
  pub,
  isFeatured,
  onOpenModal,
}: {
  pub: Publication;
  isFeatured?: boolean;
  onOpenModal: (pub: Publication, rect?: DOMRect) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Depth Parallax Layers
  const layerBadges = useRef<HTMLDivElement>(null);
  const layerTitle = useRef<HTMLDivElement>(null);
  const layerAbstract = useRef<HTMLDivElement>(null);
  const layerFooter = useRef<HTMLDivElement>(null);

  const [spotlight, setSpotlight] = useState({ x: 0, y: 0, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !containerRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normX = x / rect.width - 0.5;
    const normY = y / rect.height - 0.5;

    // Card Tilt
    gsap.to(containerRef.current, {
      rotateX: -normY * 12,
      rotateY: normX * 12,
      duration: 0.35,
      ease: 'power2.out',
      overwrite: 'auto',
    });

    // Z-Plane Parallax Layer Movement
    if (layerBadges.current) {
      gsap.to(layerBadges.current, {
        x: normX * 8,
        y: normY * 8,
        z: 25,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }

    if (layerTitle.current) {
      gsap.to(layerTitle.current, {
        x: normX * 16,
        y: normY * 16,
        z: 45,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }

    if (layerAbstract.current) {
      gsap.to(layerAbstract.current, {
        x: normX * 10,
        y: normY * 10,
        z: 30,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }

    if (layerFooter.current) {
      gsap.to(layerFooter.current, {
        x: normX * 14,
        y: normY * 14,
        z: 35,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }

    setSpotlight({ x, y, opacity: 1 });
  };

  const handleMouseLeave = () => {
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.7,
        ease: 'elastic.out(1, 0.4)',
        overwrite: 'auto',
      });
    }

    const layers = [layerBadges, layerTitle, layerAbstract, layerFooter];
    layers.forEach((ref) => {
      if (ref.current) {
        gsap.to(ref.current, {
          x: 0,
          y: 0,
          z: 0,
          duration: 0.7,
          ease: 'elastic.out(1, 0.4)',
          overwrite: 'auto',
        });
      }
    });

    setSpotlight((prev) => ({ ...prev, opacity: 0 }));
  };

  const handleClick = () => {
    const rect = cardRef.current?.getBoundingClientRect();
    onOpenModal(pub, rect);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{ perspective: '1200px' }}
      className={`group relative rounded-2xl bg-white border border-[var(--border)] p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-[var(--blue)] cursor-pointer overflow-hidden ${
        isFeatured ? 'md:col-span-8 bg-gradient-to-br from-white via-blue-50/20 to-white' : 'md:col-span-4'
      }`}
    >
      {/* Border Beam Glow Tracer */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--blue)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 pointer-events-none" />

      {/* Holographic 3D Light Reflex & Spotlight */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 rounded-2xl z-10"
        style={{
          opacity: spotlight.opacity,
          background: `radial-gradient(380px circle at ${spotlight.x}px ${spotlight.y}px, rgba(37, 84, 255, 0.12), rgba(255, 255, 255, 0.05) 50%, transparent 80%)`,
        }}
      />

      {/* 3D Multi-Layer Content Container */}
      <div
        ref={containerRef}
        style={{ transformStyle: 'preserve-3d' }}
        className="w-full h-full flex flex-col justify-between space-y-6 relative z-10 pointer-events-none"
      >
        {/* Layer 1: Year & Category Badges (Z: 25px) */}
        <div
          ref={layerBadges}
          style={{ transformStyle: 'preserve-3d' }}
          className="flex items-center justify-between gap-2 flex-wrap"
        >
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-[var(--blue)] text-xs font-mono font-semibold border border-blue-100 shadow-xs">
              {pub.year}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--bg-alt)] text-[var(--ink-soft)] text-[11px] font-mono border border-[var(--border)]">
              {pub.type || 'Publication'}
            </span>
          </div>

          {pub.citations !== undefined && (
            <span className="text-xs font-mono text-[var(--blue)] font-medium bg-blue-50/60 px-2.5 py-1 rounded-full border border-blue-100 flex items-center gap-1 shadow-xs">
              <Quote size={11} className="text-[var(--blue)]" />
              {pub.citations} Citations
            </span>
          )}
        </div>

        {/* Layer 2: Title (Z: 45px) */}
        <div ref={layerTitle} style={{ transformStyle: 'preserve-3d' }} className="space-y-3">
          <h3 className="text-lg sm:text-xl font-bold text-[var(--ink)] group-hover:text-[var(--blue)] transition-colors leading-snug font-sans">
            {pub.title}
          </h3>
        </div>

        {/* Layer 3: Abstract / Excerpt (Z: 30px) */}
        <div ref={layerAbstract} style={{ transformStyle: 'preserve-3d' }}>
          <p className="text-xs sm:text-sm text-[var(--ink-soft)] line-clamp-2 leading-relaxed">
            {pub.abstract || pub.authors}
          </p>
        </div>

        {/* Layer 4: Publisher Venue & Magnetic Action Button (Z: 35px) */}
        <div
          ref={layerFooter}
          style={{ transformStyle: 'preserve-3d' }}
          className="pt-4 border-t border-[var(--border)] flex items-center justify-between gap-4 pointer-events-auto"
        >
          <span className="text-xs font-medium text-[var(--ink-soft)] truncate max-w-[180px] sm:max-w-[260px]">
            {pub.publisher_venue}
          </span>

          {/* Magnetic "View Publication" Action Button */}
          <MagneticButton
            strength={0.4}
            className="px-3.5 py-1.5 rounded-full bg-blue-50 text-[var(--blue)] border border-blue-100 hover:bg-[var(--blue)] hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer group/btn"
          >
            <span>View Publication</span>
            <ArrowRight size={13} className="group-hover/btn:translate-x-1 transition-transform" />
          </MagneticButton>
        </div>
      </div>
    </div>
  );
}

/* ---------- MULTI-LAYER 3D PARALLAX TIMELINE CARD ---------- */
function TimelineCard({
  pub,
  onOpenModal,
}: {
  pub: Publication;
  onOpenModal: (pub: Publication, rect?: DOMRect) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layerHeader = useRef<HTMLDivElement>(null);
  const layerTitle = useRef<HTMLDivElement>(null);
  const layerText = useRef<HTMLDivElement>(null);
  const layerFooter = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !containerRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const normX = e.clientX - rect.left - rect.width / 2;
    const normY = e.clientY - rect.top - rect.height / 2;

    const ratioX = normX / (rect.width / 2);
    const ratioY = normY / (rect.height / 2);

    gsap.to(containerRef.current, {
      rotateX: -ratioY * 8,
      rotateY: ratioX * 8,
      duration: 0.3,
      ease: 'power2.out',
      overwrite: 'auto',
    });

    if (layerHeader.current) gsap.to(layerHeader.current, { x: ratioX * 6, y: ratioY * 6, z: 20, duration: 0.3 });
    if (layerTitle.current) gsap.to(layerTitle.current, { x: ratioX * 12, y: ratioY * 12, z: 35, duration: 0.3 });
    if (layerText.current) gsap.to(layerText.current, { x: ratioX * 8, y: ratioY * 8, z: 22, duration: 0.3 });
    if (layerFooter.current) gsap.to(layerFooter.current, { x: ratioX * 10, y: ratioY * 10, z: 28, duration: 0.3 });
  };

  const handleMouseLeave = () => {
    if (containerRef.current) {
      gsap.to(containerRef.current, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    }
    [layerHeader, layerTitle, layerText, layerFooter].forEach((ref) => {
      if (ref.current) gsap.to(ref.current, { x: 0, y: 0, z: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    });
  };

  return (
    <div className="relative group" style={{ perspective: '1000px' }}>
      {/* Timeline Node */}
      <div className="absolute -left-[31px] sm:-left-[39px] top-6 w-4 h-4 rounded-full bg-white border-2 border-[var(--blue)] group-hover:scale-125 group-hover:bg-[var(--blue)] transition-all duration-300 shadow-xs z-10" />

      {/* Timeline Card */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => onOpenModal(pub, cardRef.current?.getBoundingClientRect())}
        className="bg-white border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md hover:border-[var(--blue)] transition-all cursor-pointer overflow-hidden"
      >
        <div ref={containerRef} style={{ transformStyle: 'preserve-3d' }} className="space-y-3 pointer-events-none">
          <div ref={layerHeader} className="flex items-center gap-3 mb-2">
            <span className="px-3 py-0.5 rounded-full bg-blue-50 text-[var(--blue)] text-xs font-mono font-semibold border border-blue-100">
              {pub.year}
            </span>
            <span className="text-xs font-mono text-[var(--ink-soft)] bg-[var(--bg-alt)] px-2.5 py-0.5 rounded-full border border-[var(--border)]">
              {pub.publisher_venue}
            </span>
          </div>

          <div ref={layerTitle}>
            <h3 className="text-lg font-bold text-[var(--ink)] group-hover:text-[var(--blue)] transition-colors leading-snug">
              {pub.title}
            </h3>
          </div>

          <div ref={layerText}>
            <p className="text-xs sm:text-sm text-[var(--ink-soft)] line-clamp-2 leading-relaxed">
              {pub.abstract || pub.authors}
            </p>
          </div>

          <div ref={layerFooter} className="flex items-center justify-between text-xs font-semibold text-[var(--blue)] pt-3 border-t border-[var(--border)] pointer-events-auto">
            <span className="text-[var(--ink-soft)] truncate max-w-[200px]">{pub.authors}</span>
            <MagneticButton strength={0.35} className="px-3 py-1 rounded-full bg-blue-50 hover:bg-[var(--blue)] hover:text-white transition-all flex items-center gap-1 cursor-pointer">
              <span>View Publication</span>
              <ArrowRight size={12} />
            </MagneticButton>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- FLUID MODAL SPRING EXPANSION DRAWER ---------- */
function ModalDrawer({
  pub,
  originRect,
  onClose,
}: {
  pub: Publication | null;
  originRect: DOMRect | null;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'abstract' | 'bibtex'>('abstract');
  const [copied, setCopied] = useState(false);

  const backdropRef = useRef<HTMLDivElement>(null);
  const modalBoxRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    if (modalBoxRef.current && backdropRef.current) {
      gsap.to(modalBoxRef.current, {
        scale: 0.9,
        opacity: 0,
        y: 20,
        duration: 0.25,
        ease: 'power2.in',
      });
      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: onClose,
      });
    } else {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  // Fluid Spring Expansion Animation on Mount
  useEffect(() => {
    if (!pub) return;

    if (backdropRef.current) {
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.35, ease: 'power2.out' }
      );
    }

    if (modalBoxRef.current) {
      if (originRect) {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const cardCenterX = originRect.left + originRect.width / 2;
        const cardCenterY = originRect.top + originRect.height / 2;

        const targetCenterX = windowWidth / 2;
        const targetCenterY = windowHeight / 2;

        const deltaX = cardCenterX - targetCenterX;
        const deltaY = cardCenterY - targetCenterY;

        gsap.fromTo(
          modalBoxRef.current,
          {
            x: deltaX,
            y: deltaY,
            scale: 0.35,
            opacity: 0,
            borderRadius: '28px',
          },
          {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            borderRadius: '16px',
            duration: 0.55,
            ease: 'back.out(1.35)',
          }
        );
      } else {
        gsap.fromTo(
          modalBoxRef.current,
          { scale: 0.85, opacity: 0, y: 30 },
          { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: 'back.out(1.4)' }
        );
      }
    }
  }, [pub, originRect]);

  if (!pub) return null;

  const defaultBibtex = pub.bibtex || `@article{helsinki${pub.year}${pub.id},
  title={${pub.title}},
  author={${pub.authors}},
  journal={${pub.publisher_venue}},
  year={${pub.year}}
}`;

  const handleCopyBibtex = () => {
    navigator.clipboard.writeText(defaultBibtex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md transition-all"
    >
      <div className="absolute inset-0" onClick={handleClose} />

      <div
        ref={modalBoxRef}
        className="relative w-full max-w-2xl bg-white border border-[var(--border)] rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-[var(--border)] flex items-start justify-between gap-4 bg-[var(--bg-alt)]/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-0.5 rounded-full bg-blue-50 text-[var(--blue)] text-xs font-mono font-semibold border border-blue-100">
                {pub.year}
              </span>
              <span className="text-xs font-mono text-[var(--ink-soft)] bg-white px-2.5 py-0.5 rounded-full border border-[var(--border)]">
                {pub.publisher_venue}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--ink)] font-sans leading-snug">
              {pub.title}
            </h2>
          </div>

          <MagneticButton
            onClick={handleClose}
            strength={0.4}
            className="p-2 text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--bg-alt)] rounded-full transition-colors cursor-pointer"
          >
            <X size={18} />
          </MagneticButton>
        </div>

        {/* Tab Switcher inside Modal */}
        <div className="px-6 pt-4 flex items-center justify-between border-b border-[var(--border)]">
          <div className="flex gap-2">
            <MagneticButton
              onClick={() => setActiveTab('abstract')}
              strength={0.25}
              className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
                activeTab === 'abstract'
                  ? 'border-[var(--blue)] text-[var(--blue)] bg-blue-50/30'
                  : 'border-transparent text-[var(--ink-soft)] hover:text-[var(--ink)]'
              }`}
            >
              Abstract
            </MagneticButton>
            <MagneticButton
              onClick={() => setActiveTab('bibtex')}
              strength={0.25}
              className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
                activeTab === 'bibtex'
                  ? 'border-[var(--blue)] text-[var(--blue)] bg-blue-50/30'
                  : 'border-transparent text-[var(--ink-soft)] hover:text-[var(--ink)]'
              }`}
            >
              BibTeX Citation
            </MagneticButton>
          </div>

          {pub.publication_url && (
            <a
              href={pub.publication_url}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-[var(--blue)] hover:underline inline-flex items-center gap-1"
            >
              <span>DOI Link</span>
              <ExternalLink size={12} />
            </a>
          )}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="text-xs text-[var(--ink-soft)] font-mono">
            <span className="font-semibold text-[var(--ink)]">Authors: </span>
            {pub.authors}
          </div>

          {activeTab === 'abstract' ? (
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-[var(--ink)] uppercase tracking-wider">
                Abstract
              </h4>
              <p className="text-sm text-[var(--ink-soft)] leading-relaxed bg-[var(--bg-alt)]/60 p-4 rounded-xl border border-[var(--border)]">
                {pub.abstract || "Full publication abstract available via publisher portal or DOI index."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold text-[var(--ink)] uppercase tracking-wider">
                  BibTeX Entry
                </h4>
                <MagneticButton
                  onClick={handleCopyBibtex}
                  strength={0.3}
                  className="px-3 py-1.5 rounded-lg bg-[var(--blue)] text-white hover:bg-blue-700 transition-colors text-xs font-medium inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copied ? 'Copied!' : 'Copy BibTeX'}</span>
                </MagneticButton>
              </div>

              <pre className="bg-slate-950 text-blue-200 p-4 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                {defaultBibtex}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[var(--bg-alt)]/50 border-t border-[var(--border)] flex justify-end">
          <MagneticButton
            onClick={handleClose}
            strength={0.35}
            className="px-4 py-2 rounded-full border border-[var(--border)] text-[var(--ink)] hover:bg-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </MagneticButton>
        </div>
      </div>
    </div>
  );
}

/* ---------- MAIN PUBLICATIONS COMPONENT ---------- */
export default function Publications() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [layoutMode, setLayoutMode] = useState<'bento' | 'timeline' | 'compact'>('bento');
  const [selectedPub, setSelectedPub] = useState<Publication | null>(null);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);

  const sectionRef = useRef<HTMLElement>(null);
  const contentContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchPubs() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      try {
        const res = await fetch(`${apiUrl}/api/v1/academic/publications`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setPublications(data);
          } else {
            setPublications(MOCK_PUBLICATIONS);
          }
        } else {
          setPublications(MOCK_PUBLICATIONS);
        }
      } catch (err) {
        console.error('Error fetching publications:', err);
        setPublications(MOCK_PUBLICATIONS);
      } finally {
        setLoading(false);
      }
    }
    fetchPubs();
  }, []);

  const filteredPublications = useMemo(() => {
    if (activeFilter === 'all') return publications;
    return publications.filter((p) => (p.category || 'ai') === activeFilter);
  }, [publications, activeFilter]);

  // STAGGERED SPRING ENTRY (GSAP PHYSICS) WHEN FILTER OR LAYOUT CHANGES
  useEffect(() => {
    if (loading || !contentContainerRef.current) return;

    const items = contentContainerRef.current.children;
    if (items.length > 0) {
      gsap.fromTo(
        items,
        {
          opacity: 0,
          scale: 0.85,
          y: 35,
          rotateX: 10,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          rotateX: 0,
          duration: 0.65,
          stagger: 0.08,
          ease: 'back.out(1.6)',
          clearProps: 'transform,opacity',
        }
      );
    }
  }, [filteredPublications, layoutMode, loading]);

  const handleOpenModal = (pub: Publication, rect?: DOMRect) => {
    setOriginRect(rect || null);
    setSelectedPub(pub);
  };

  return (
    <section id="publications" ref={sectionRef} className="py-28 relative overflow-hidden bg-[var(--bg)]">
      <div className="wrap relative z-10 max-w-[1280px] mx-auto px-6 md:px-10">
        <SectionHeader
          label="PUBLICATIONS & RESEARCH"
          title="Papers, articles &"
          accentTitle="journals."
          description="Academic research, peer-reviewed journals, and technical publications in engineering & AI."
        />

        {/* CONTROLS: Category Filters (with Magnetic Physics) & Layout Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-[var(--border)]">
          {/* Category Filter Buttons (Magnetic Physics) */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <MagneticButton
                key={cat.value}
                onClick={() => setActiveFilter(cat.value)}
                strength={0.35}
                className={`text-xs font-medium px-4 py-2 rounded-full border transition-all duration-250 cursor-pointer ${
                  activeFilter === cat.value
                    ? 'bg-[var(--ink)] text-white border-[var(--ink)] shadow-xs'
                    : 'bg-[var(--surface)] text-[var(--ink-soft)] border-[var(--border)] hover:border-[var(--blue)] hover:text-[var(--ink)]'
                }`}
              >
                {cat.label}
              </MagneticButton>
            ))}
          </div>

          {/* Layout Switcher (Bento, Timeline, Compact) with Magnetic Buttons */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-[var(--border)] shadow-xs">
            <MagneticButton
              onClick={() => setLayoutMode('bento')}
              strength={0.25}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                layoutMode === 'bento'
                  ? 'bg-[var(--blue)] text-white shadow-xs'
                  : 'text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--bg-alt)]'
              }`}
            >
              <Grid size={14} />
              <span>Bento</span>
            </MagneticButton>

            <MagneticButton
              onClick={() => setLayoutMode('timeline')}
              strength={0.25}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                layoutMode === 'timeline'
                  ? 'bg-[var(--blue)] text-white shadow-xs'
                  : 'text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--bg-alt)]'
              }`}
            >
              <GitCommit size={14} />
              <span>Timeline</span>
            </MagneticButton>

            <MagneticButton
              onClick={() => setLayoutMode('compact')}
              strength={0.25}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                layoutMode === 'compact'
                  ? 'bg-[var(--blue)] text-white shadow-xs'
                  : 'text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--bg-alt)]'
              }`}
            >
              <List size={14} />
              <span>Compact</span>
            </MagneticButton>
          </div>
        </div>

        {/* LOADING & EMPTY STATES */}
        {loading ? (
          <div className="text-center py-20 text-[var(--ink-soft)] font-mono text-sm">
            Loading publications...
          </div>
        ) : filteredPublications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[var(--border)] p-8 shadow-xs">
            <p className="font-medium text-[var(--ink-soft)]">
              No publications found in this category.
            </p>
          </div>
        ) : (
          <div>
            {/* MODE 1: BENTO GRID */}
            {layoutMode === 'bento' && (
              <div
                ref={contentContainerRef}
                className="grid grid-cols-1 md:grid-cols-12 gap-6"
              >
                {filteredPublications.map((pub, idx) => (
                  <BentoCard
                    key={pub.id}
                    pub={pub}
                    isFeatured={idx === 0}
                    onOpenModal={handleOpenModal}
                  />
                ))}
              </div>
            )}

            {/* MODE 2: TIMELINE VIEW */}
            {layoutMode === 'timeline' && (
              <div
                ref={contentContainerRef}
                className="relative pl-6 sm:pl-8 border-l-2 border-blue-200 space-y-8 my-4 ml-2 sm:ml-4"
              >
                {filteredPublications.map((pub) => (
                  <TimelineCard
                    key={pub.id}
                    pub={pub}
                    onOpenModal={handleOpenModal}
                  />
                ))}
              </div>
            )}

            {/* MODE 3: COMPACT LIST VIEW */}
            {layoutMode === 'compact' && (
              <div
                ref={contentContainerRef}
                className="bg-white rounded-2xl border border-[var(--border)] shadow-xs divide-y divide-[var(--border)] overflow-hidden"
              >
                {filteredPublications.map((pub) => (
                  <div
                    key={pub.id}
                    onClick={(e) => handleOpenModal(pub, e.currentTarget.getBoundingClientRect())}
                    className="p-5 sm:p-6 hover:bg-blue-50/20 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[var(--blue)] text-[11px] font-mono font-semibold border border-blue-100">
                          {pub.year}
                        </span>
                        <span className="text-xs font-mono text-[var(--ink-soft)] truncate max-w-[260px]">
                          {pub.publisher_venue}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-[var(--ink)] group-hover:text-[var(--blue)] transition-colors leading-snug">
                        {pub.title}
                      </h3>

                      <p className="text-xs text-[var(--ink-soft)] truncate">
                        {pub.authors}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <MagneticButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(pub, (e.currentTarget.parentElement?.parentElement as HTMLElement)?.getBoundingClientRect());
                        }}
                        strength={0.35}
                        className="px-3.5 py-1.5 rounded-full bg-blue-50 text-[var(--blue)] border border-blue-100 hover:bg-[var(--blue)] hover:text-white transition-all text-xs font-semibold cursor-pointer"
                      >
                        <span>View Publication</span>
                      </MagneticButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ABSTRACT & BIBTEX MODAL DRAWER */}
      <ModalDrawer
        pub={selectedPub}
        originRect={originRect}
        onClose={() => {
          setSelectedPub(null);
          setOriginRect(null);
        }}
      />
    </section>
  );
}
