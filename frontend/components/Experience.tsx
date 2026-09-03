'use client';

import React, { useEffect, useState } from 'react';
import SectionHeader from '@/components/SectionHeader';

interface Skill {
  id: number;
  name: string;
}

interface ExperienceMedia {
  id: number;
  title: string;
  url: string;
  media_type: string;
}

interface ExperienceItem {
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
  skills?: Skill[];
  media?: ExperienceMedia[];
}

export default function Experience() {
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIds, setOpenIds] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    async function fetchExperiences() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      try {
        const res = await fetch(`${apiUrl}/api/v1/experiences`);
        if (res.ok) {
          const data = await res.json();
          setExperiences(data);
          if (data.length > 0) {
            setOpenIds({ [data[0].id]: true });
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchExperiences();
  }, []);

  const toggleAccordion = (id: number) => {
    setOpenIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section id="experience">
      <div className="wrap">
        <SectionHeader
          label="EXPERIENCE"
          title="Where I’ve built &"
          accentTitle="led."
          description="Professional career history, engineering roles, and technical leadership."
        />

        {loading ? (
          <div className="text-center py-20 text-[var(--ink-soft)]">Loading experience history...</div>
        ) : experiences.length === 0 ? (
          <div className="text-center py-20 bg-[var(--surface)] rounded-[var(--radius)] border border-[var(--border)] p-8">
            <p className="font-medium text-[var(--ink-soft)]">No experience records found.</p>
          </div>
        ) : (
          <div className="timeline">
            {experiences.map((exp) => {
              const isOpen = !!openIds[exp.id];
              const startDate = `${exp.start_month} ${exp.start_year}`;
              const endDate = exp.is_current ? 'Present' : `${exp.end_month || ''} ${exp.end_year || ''}`.trim();
              const dateStr = `${startDate} — ${endDate}`;

              return (
                <div key={exp.id} className={`t-item ${isOpen ? 'open' : ''}`}>
                  <div className="t-date mono">{dateStr}</div>
                  <div className="t-dot"></div>
                  <div className="t-body">
                    <h3>{exp.position_title}</h3>
                    <div className="t-org">
                      {exp.organization_name} {exp.location ? `· ${exp.location}` : ''} {exp.employment_type ? `(${exp.employment_type})` : ''}
                    </div>

                    <div className="t-toggle" onClick={() => toggleAccordion(exp.id)}>
                      <span>{isOpen ? 'Hide Details' : 'View Details'}</span>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>

                    {exp.description && (
                      <div className="t-desc">
                        <p className="whitespace-pre-line">{exp.description}</p>
                      </div>
                    )}

                    {exp.skills && exp.skills.length > 0 && (
                      <div className={`transition-all duration-300 ${isOpen ? 'mt-4 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {exp.skills.map(s => (
                            <span key={s.id} className="tag">{s.name}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {exp.media && exp.media.length > 0 && (
                      <div className={`transition-all duration-300 ${isOpen ? 'mt-4 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--border)]">
                          {exp.media.map(m => (
                            <a
                              key={m.id}
                              href={m.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-semibold px-3 py-1 bg-[var(--bg-alt)] border border-[var(--border)] rounded-lg hover:border-[var(--blue)] transition-colors inline-flex items-center gap-1"
                            >
                              <span>{m.title}</span>
                              <span className="text-[10px]">↗</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
