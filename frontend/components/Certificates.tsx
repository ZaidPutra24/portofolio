'use client';

import React, { useEffect, useState, useRef } from 'react';
import { getImageUrl } from '@/lib/utils';
import SectionHeader from '@/components/SectionHeader';

interface Certificate {
  id: number;
  name: string;
  issuer: string;
  issue_date: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
  image_url?: string;
  description?: string;
}

export default function Certificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState('all');
  const [selectedCertId, setSelectedCertId] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchCerts() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      try {
        const res = await fetch(`${apiUrl}/api/v1/academic/certificates`);
        if (res.ok) {
          const data = await res.json();
          const sorted = data.sort((a: Certificate, b: Certificate) => new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime());
          setCertificates(sorted);
          if (sorted.length > 0) {
            setSelectedCertId(sorted[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCerts();
  }, []);

  // Auto-scroll smooth infinite marquee effect with pause on hover
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    let animationFrameId: number;
    let isPaused = false;

    const handleMouseEnter = () => { isPaused = true; };
    const handleMouseLeave = () => { isPaused = false; };
    const handleTouchStart = () => { isPaused = true; };
    const handleTouchEnd = () => { isPaused = false; };

    rail.addEventListener('mouseenter', handleMouseEnter);
    rail.addEventListener('mouseleave', handleMouseLeave);
    rail.addEventListener('touchstart', handleTouchStart);
    rail.addEventListener('touchend', handleTouchEnd);

    const scrollStep = () => {
      if (!isPaused && rail) {
        rail.scrollLeft += 0.8;
        const halfWidth = rail.scrollWidth / 2;
        if (halfWidth > 0 && rail.scrollLeft >= halfWidth) {
          rail.scrollLeft -= halfWidth;
        }
      }
      animationFrameId = requestAnimationFrame(scrollStep);
    };

    animationFrameId = requestAnimationFrame(scrollStep);

    return () => {
      cancelAnimationFrame(animationFrameId);
      rail.removeEventListener('mouseenter', handleMouseEnter);
      rail.removeEventListener('mouseleave', handleMouseLeave);
      rail.removeEventListener('touchstart', handleTouchStart);
      rail.removeEventListener('touchend', handleTouchEnd);
    };
  }, [certificates, activeCat]);

  const isPdf = (url?: string) => url ? url.toLowerCase().endsWith('.pdf') : false;

  const getCertCategory = (cert: Certificate) => {
    const text = (cert.name + ' ' + cert.issuer).toLowerCase();
    if (text.includes('aws') || text.includes('cloud') || text.includes('azure') || text.includes('gcp') || text.includes('ai') || text.includes('machine learning') || text.includes('deep learning')) {
      return 'Cloud & AI';
    }
    if (text.includes('data') || text.includes('sql') || text.includes('analytics') || text.includes('database')) {
      return 'Data';
    }
    if (text.includes('dev') || text.includes('react') || text.includes('node') || text.includes('python') || text.includes('code') || text.includes('software') || text.includes('programming')) {
      return 'Development';
    }
    return 'Technical';
  };

  const categories = ['all', 'Technical', 'Cloud & AI', 'Data', 'Development'];

  const filteredCertificates = activeCat === 'all'
    ? certificates
    : certificates.filter(cert => getCertCategory(cert).toLowerCase() === activeCat.toLowerCase());

  const displayedCertificates = filteredCertificates;

  const selectedCert = certificates.find(c => c.id === selectedCertId) || filteredCertificates[0] || certificates[0];

  const scrollRail = (direction: 'left' | 'right') => {
    if (railRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      railRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section id="certificates">
      <div className="wrap">
        {/* Lightbox Modal for Image Preview */}
        {previewImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn" onClick={() => setPreviewImage(null)}>
            <div className="relative max-w-5xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="absolute top-5 right-5 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full p-2.5 z-10 transition-colors"
                title="Close preview"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
              <div className="mb-4">
                <span className="text-xs font-mono text-[var(--blue)] font-semibold uppercase tracking-wider">Certificate Document Evidence</span>
                <h4 className="text-lg font-bold text-[var(--ink)] mt-1">{selectedCert?.name}</h4>
              </div>
              <div className="bg-[var(--bg-alt)] rounded-xl border border-[var(--border)] p-4 flex items-center justify-center max-h-[75vh] overflow-auto">
                <img src={getImageUrl(previewImage)} alt="Certificate full preview" className="max-w-full h-auto object-contain rounded-lg shadow-sm" />
              </div>
            </div>
          </div>
        )}

        {/* Section Header */}
        <SectionHeader
          label="CERTIFICATIONS"
          title="Licenses &"
          accentTitle="credentials."
          description="Professional certifications and technical credentials."
        />

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map(cat => (
            <button
              type="button"
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`text-xs font-medium px-4 py-2 rounded-full border transition-all duration-250 capitalize ${
                activeCat === cat
                  ? 'bg-[var(--ink)] text-white border-[var(--ink)] shadow-sm'
                  : 'bg-[var(--surface)] text-[var(--ink-soft)] border-[var(--border)] hover:border-[var(--blue)] hover:text-[var(--ink)] hover:-translate-y-[1px]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-[var(--ink-soft)] font-mono text-sm">Curating certificate archive...</div>
        ) : filteredCertificates.length === 0 ? (
          <div className="text-center py-20 bg-[var(--surface)] rounded-[var(--radius)] border border-[var(--border)] p-8 shadow-sm">
            <p className="font-medium text-[var(--ink-soft)]">No certificates found in this category.</p>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* 3. & 4. FEATURED CERTIFICATE ARCHIVE VIEWER & STACK DEPTH EFFECT */}
            {selectedCert && (
              <div className="relative bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-10 shadow-lg transition-all duration-500 overflow-hidden group/feat">
                {/* Stack / Depth Background Layers */}
                <div className="absolute -bottom-3 left-6 right-6 h-6 bg-[var(--bg-alt)] border border-[var(--border)] rounded-b-2xl opacity-60 -z-10 transform scale-[0.98]" />
                <div className="absolute -bottom-6 left-12 right-12 h-6 bg-[var(--bg)] border border-[var(--border)] rounded-b-2xl opacity-30 -z-20 transform scale-[0.95]" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  
                  {/* LEFT: Large Certificate Preview / Document Representation */}
                  <div className="lg:col-span-7 flex flex-col justify-center">
                    <div className="relative bg-[var(--bg-alt)] border border-[var(--border)] rounded-xl p-4 sm:p-6 overflow-hidden shadow-inner flex items-center justify-center min-h-[340px]">
                      {selectedCert.image_url ? (
                        isPdf(selectedCert.image_url) ? (
                          <div 
                            className="flex flex-col items-center text-center space-y-4 p-8 w-full cursor-pointer hover:bg-black/[0.02] transition-colors rounded-xl"
                            onClick={() => window.open(getImageUrl(selectedCert.image_url), '_blank')}
                            title="Click to open PDF document"
                          >
                            <div className="w-14 h-14 rounded-xl bg-red-50 border border-red-200 text-red-600 font-bold text-sm flex items-center justify-center shadow-sm">
                              PDF
                            </div>
                            <div>
                              <span className="text-xs font-mono text-red-600 font-semibold uppercase tracking-wider">Verified PDF Document</span>
                              <h4 className="text-base font-bold text-[var(--ink)] mt-1">{selectedCert.name}</h4>
                              <p className="text-xs text-[var(--ink-soft)] mt-1">{selectedCert.issuer} · Issued {selectedCert.issue_date}</p>
                            </div>
                            <a
                              href={getImageUrl(selectedCert.image_url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs font-semibold text-[var(--blue)] hover:underline inline-flex items-center gap-1.5"
                            >
                              View PDF Document ↗
                            </a>
                          </div>
                        ) : (
                          <div className="relative group w-full cursor-pointer" onClick={() => setPreviewImage(selectedCert.image_url || null)}>
                            <img
                              src={getImageUrl(selectedCert.image_url)}
                              alt={selectedCert.name}
                              className="w-full h-auto max-h-[380px] object-contain rounded-lg shadow-sm mx-auto transition-transform duration-300 group-hover:scale-[1.01]"
                            />
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <span className="text-xs font-semibold text-white bg-black/70 px-4 py-2 rounded-full shadow-lg">
                                Click to expand certificate ↗
                              </span>
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="h-64 flex items-center justify-center text-xs font-mono text-[var(--ink-soft)] italic">
                          Official Certificate Record (No preview attached)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT: Metadata & Actions */}
                  <div className="lg:col-span-5 space-y-5">
                    <div className="flex items-center justify-between">
                      <span className="mono text-xs font-semibold px-3.5 py-1 rounded-full bg-blue-50 text-[var(--blue)] border border-blue-100 uppercase tracking-wider">
                        {getCertCategory(selectedCert)} Archive Item
                      </span>
                      <span className="text-xs font-mono text-[var(--ink-soft)] font-medium">
                        {selectedCert.issue_date}
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)] leading-snug">
                      {selectedCert.name}
                    </h3>

                    <div className="space-y-2 text-xs font-mono text-[var(--ink-soft)]">
                      <p className="flex items-center gap-2">
                        <span className="text-[var(--ink)] font-semibold">Issuer:</span> {selectedCert.issuer}
                      </p>
                      {selectedCert.credential_id && (
                        <p className="flex items-center gap-2">
                          <span className="text-[var(--ink)] font-semibold">Credential ID:</span> {selectedCert.credential_id}
                        </p>
                      )}
                      {selectedCert.expiry_date && (
                        <p className="flex items-center gap-2">
                          <span className="text-[var(--ink)] font-semibold">Expires:</span> {selectedCert.expiry_date}
                        </p>
                      )}
                    </div>

                    {selectedCert.description && (
                      <p className="text-xs sm:text-sm text-[var(--ink-soft)] leading-relaxed pt-2 border-t border-[var(--border)] whitespace-pre-line">
                        {selectedCert.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[var(--border)]">
                      {selectedCert.credential_url && (
                        <a
                          href={selectedCert.credential_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-[var(--blue)] hover:underline inline-flex items-center gap-1.5"
                        >
                          Verify Credential →
                        </a>
                      )}
                      {selectedCert.image_url && (
                        isPdf(selectedCert.image_url) ? (
                          <a
                            href={getImageUrl(selectedCert.image_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)] inline-flex items-center gap-1"
                          >
                            View PDF ↗
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPreviewImage(selectedCert.image_url || null)}
                            className="text-xs font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)] inline-flex items-center gap-1"
                          >
                            View Certificate ↗
                          </button>
                        )
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* 1. HORIZONTAL CERTIFICATE RAIL */}
            <div className="space-y-4 pt-6">
              <div className="flex items-center justify-between px-1">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-mono font-semibold text-[var(--ink-soft)] px-1">Certificate archive rail</h4>
                  <p className="text-[11px] text-[var(--ink-faint)] px-1">Select any item to inspect in the featured archive viewer</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => scrollRail('left')}
                    className="w-9 h-9 rounded-full border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--blue)] hover:text-[var(--blue)] flex items-center justify-center text-xs transition-all shadow-sm"
                    title="Scroll left"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollRail('right')}
                    className="w-9 h-9 rounded-full border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--blue)] hover:text-[var(--blue)] flex items-center justify-center text-xs transition-all shadow-sm"
                    title="Scroll right"
                  >
                    →
                  </button>
                </div>
              </div>

              {/* Horizontal Scrollable Rail with Subtle Edge Fade */}
              <div className="relative">
                {/* Edge fade gradient indicators */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[var(--bg)] to-transparent pointer-events-none z-10 hidden sm:block" />
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[var(--bg)] to-transparent pointer-events-none z-10 hidden sm:block" />

                <div
                  ref={railRef}
                  className="flex gap-5 overflow-x-auto pb-4 pt-2 px-1 scrollbar-none focus:outline-none group/rail"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {displayedCertificates.concat(displayedCertificates).map((cert, idx) => {
                    const isSelected = cert.id === selectedCertId;
                    const pdf = isPdf(cert.image_url);

                    return (
                      <div
                        key={`${cert.id}-${idx}`}
                        onClick={() => setSelectedCertId(cert.id)}
                        className={`flex-shrink-0 w-[280px] sm:w-[320px] bg-[var(--surface)] border rounded-[var(--radius)] p-5 cursor-pointer transition-all duration-300 flex flex-col justify-between group/card ${
                          isSelected
                            ? 'border-[var(--blue)] ring-2 ring-[var(--blue)]/20 shadow-md translate-y-[-2px]'
                            : 'border-[var(--border)] hover:border-[var(--blue)] hover:-translate-y-1 hover:shadow-md hover:scale-[1.02] group-hover/rail:opacity-60 hover:!opacity-100'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="mono text-[11px] text-[var(--blue)] font-semibold">{cert.issue_date}</span>
                            <span className="text-[10px] bg-[var(--bg-alt)] px-2.5 py-0.5 rounded-full mono text-[var(--ink-soft)] truncate max-w-[140px]">{cert.issuer}</span>
                          </div>

                          <h5 className="text-sm font-bold text-[var(--ink)] mb-2 line-clamp-2 leading-snug">{cert.name}</h5>

                          {cert.image_url && (
                            <div className="mt-3 h-28 rounded-xl border border-[var(--border)] bg-[var(--bg-alt)] overflow-hidden flex items-center justify-center relative">
                              {pdf ? (
                                <a
                                  href={getImageUrl(cert.image_url)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center gap-3 p-3 w-full h-full justify-start bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:border-[var(--blue)] transition-colors group-hover/card:shadow-sm"
                                  title="Open PDF document in new tab"
                                >
                                  <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 text-red-600 font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
                                    PDF
                                  </div>
                                  <div className="min-w-0 text-left">
                                    <span className="text-[11px] font-bold text-[var(--ink)] block truncate">Verified Document</span>
                                    <span className="text-[10px] font-mono text-[var(--blue)] hover:underline inline-flex items-center gap-0.5 mt-0.5">View PDF ↗</span>
                                  </div>
                                </a>
                              ) : (
                                <img
                                  src={getImageUrl(cert.image_url)}
                                  alt={cert.name}
                                  className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300 rounded-lg"
                                />
                              )}
                            </div>
                          )}
                        </div>

                        <div className="border-t border-[var(--border)] pt-3 mt-4 flex items-center justify-between text-[11px] font-semibold">
                          <span className="text-[var(--ink-soft)] group-hover/card:text-[var(--blue)] transition-colors inline-flex items-center gap-1">
                            {isSelected ? 'Currently Viewing' : 'Inspect Archive ↗'}
                          </span>
                          {cert.credential_url && (
                            <span className="text-[var(--blue)] font-mono text-[10px]">Verified</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </section>
  );
}
