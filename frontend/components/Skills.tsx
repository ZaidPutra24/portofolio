'use client';

import React, { useState, useEffect } from 'react';
import SectionHeader from '@/components/SectionHeader';
import IconResolver, { resolveSkillIcon } from '@/components/IconResolver';

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

const DEFAULT_CATEGORIES: SkillCategory[] = [
  {
    id: 1,
    name: 'Backend & APIs',
    order_index: 1,
    skills: [
      { id: 1, name: 'Python', level: 'Expert', icon_name: 'SiPython', order_index: 1, category_id: 1 },
      { id: 2, name: 'FastAPI', level: 'Expert', icon_name: 'SiFastapi', order_index: 2, category_id: 1 },
      { id: 3, name: 'Node.js', level: 'Advanced', icon_name: 'SiNodedotjs', order_index: 3, category_id: 1 },
      { id: 4, name: 'Go', level: 'Intermediate', icon_name: 'SiGo', order_index: 4, category_id: 1 },
      { id: 5, name: 'MySQL', level: 'Advanced', icon_name: 'SiMysql', order_index: 5, category_id: 1 },
      { id: 6, name: 'PostgreSQL', level: 'Expert', icon_name: 'SiPostgresql', order_index: 6, category_id: 1 },
      { id: 7, name: 'MongoDB', level: 'Advanced', icon_name: 'SiMongodb', order_index: 7, category_id: 1 },
      { id: 8, name: 'Redis', level: 'Advanced', icon_name: 'SiRedis', order_index: 8, category_id: 1 },
      { id: 9, name: 'GraphQL', level: 'Advanced', icon_name: 'SiGraphql', order_index: 9, category_id: 1 },
      { id: 10, name: 'Docker', level: 'Advanced', icon_name: 'SiDocker', order_index: 10, category_id: 1 }
    ]
  },
  {
    id: 2,
    name: 'Frontend & Web',
    order_index: 2,
    skills: [
      { id: 11, name: 'Laravel', level: 'Advanced', icon_name: 'SiLaravel', order_index: 1, category_id: 2 },
      { id: 12, name: 'React', level: 'Expert', icon_name: 'SiReact', order_index: 2, category_id: 2 },
      { id: 13, name: 'Next.js', level: 'Expert', icon_name: 'SiNextdotjs', order_index: 3, category_id: 2 },
      { id: 14, name: 'TypeScript', level: 'Expert', icon_name: 'SiTypescript', order_index: 4, category_id: 2 },
      { id: 15, name: 'Vue.js', level: 'Advanced', icon_name: 'SiVuedotjs', order_index: 5, category_id: 2 },
      { id: 16, name: 'Svelte', level: 'Intermediate', icon_name: 'SiSvelte', order_index: 6, category_id: 2 },
      { id: 17, name: 'Tailwind CSS', level: 'Expert', icon_name: 'SiTailwindcss', order_index: 7, category_id: 2 },
      { id: 18, name: 'Figma', level: 'Advanced', icon_name: 'SiFigma', order_index: 8, category_id: 2 },
      { id: 34, name: 'Canva', level: 'Advanced', icon_name: 'simple-icons:canva', order_index: 9, category_id: 2 }
    ]
  },
  {
    id: 3,
    name: 'Systems & Infra',
    order_index: 3,
    skills: [
      { id: 19, name: 'AWS', level: 'Advanced', icon_name: 'FaAws', order_index: 1, category_id: 3 },
      { id: 20, name: 'Azure', level: 'Intermediate', icon_name: 'VscAzure', order_index: 2, category_id: 3 },
      { id: 21, name: 'Google Cloud', level: 'Intermediate', icon_name: 'SiGooglecloud', order_index: 3, category_id: 3 },
      { id: 22, name: 'Kubernetes', level: 'Advanced', icon_name: 'SiKubernetes', order_index: 4, category_id: 3 },
      { id: 23, name: 'Terraform', level: 'Advanced', icon_name: 'SiTerraform', order_index: 5, category_id: 3 },
      { id: 24, name: 'Grafana', level: 'Intermediate', icon_name: 'SiGrafana', order_index: 6, category_id: 3 }
    ]
  },
  {
    id: 4,
    name: 'AI & Data',
    order_index: 4,
    skills: [
      { id: 25, name: 'PyTorch', level: 'Expert', icon_name: 'SiPytorch', order_index: 1, category_id: 4 },
      { id: 26, name: 'TensorFlow', level: 'Advanced', icon_name: 'SiTensorflow', order_index: 2, category_id: 4 },
      { id: 27, name: 'Pandas', level: 'Expert', icon_name: 'SiPandas', order_index: 3, category_id: 4 },
      { id: 28, name: 'NumPy', level: 'Expert', icon_name: 'SiNumpy', order_index: 4, category_id: 4 },
      { id: 29, name: 'Jupyter', level: 'Expert', icon_name: 'SiJupyter', order_index: 5, category_id: 4 },
      { id: 30, name: 'Streamlit', level: 'Expert', icon_name: 'SiStreamlit', order_index: 6, category_id: 4 },
      { id: 31, name: 'OpenCV', level: 'Intermediate', icon_name: 'SiOpencv', order_index: 7, category_id: 4 },
      { id: 32, name: 'Hugging Face', level: 'Intermediate', icon_name: 'SiHuggingface', order_index: 8, category_id: 4 },
      { id: 33, name: 'Scikit-learn', level: 'Intermediate', icon_name: 'SiScikitlearn', order_index: 9, category_id: 4 }
    ]
  }
];

export default function Skills() {
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState<string>('all');

  useEffect(() => {
    async function fetchSkills() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      try {
        const res = await fetch(`${apiUrl}/api/v1/skills`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setCategories(data);
          } else {
            setCategories(DEFAULT_CATEGORIES);
          }
        } else {
          setCategories(DEFAULT_CATEGORIES);
        }
      } catch (err) {
        console.error('Failed to fetch skills:', err);
        setCategories(DEFAULT_CATEGORIES);
      } finally {
        setLoading(false);
      }
    }
    fetchSkills();
  }, []);

  const filterCategories = [
    { id: 'all', name: 'All' },
    ...categories.map(cat => ({ id: String(cat.id), name: cat.name }))
  ];

  const marqueeRows = categories.map((cat, idx) => ({
    id: String(cat.id),
    categoryName: cat.name,
    reverse: idx % 2 === 1,
    speedClass: idx % 2 === 1 ? 'animate-marquee-reverse' : 'animate-marquee',
    items: cat.skills || []
  }));

  return (
    <section id="skills" className="relative py-28 overflow-hidden bg-[#fafafb]">
      <div className="wrap relative z-10 max-w-[1280px] mx-auto px-6 md:px-10">
        
        {/* Header */}
        <SectionHeader
          label="SKILLS"
          title="Technical Stack &"
          accentTitle="proficiency."
          description="Filter by category to explore core technologies, frameworks, and engineering skills."
        />

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-12">
          {filterCategories.map(cat => (
            <button
              type="button"
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={`text-xs font-medium px-4 py-2 rounded-full border transition-all duration-250 ${
                activeCat === cat.id
                  ? 'bg-[var(--ink)] text-white border-[var(--ink)] shadow-sm'
                  : 'bg-[var(--surface)] text-[var(--ink-soft)] border-[var(--border)] hover:border-[var(--blue)] hover:text-[var(--ink)] hover:-translate-y-[1px]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Compact Stacked Horizontal Marquees */}
        {loading ? (
          <div className="text-center py-20 text-[var(--ink-soft)] font-mono text-sm">
            Curating skills & expertise...
          </div>
        ) : (
          <div className="space-y-6 pt-4">
            {marqueeRows.map(row => {
              const isActive = activeCat === 'all' || activeCat === row.id;

              if (row.items.length === 0) return null;

              // Render duplicated items for a perfectly seamless, infinite marquee loop
              const duplicatedItems = [...row.items, ...row.items, ...row.items, ...row.items];

              return (
                <div
                  key={row.id}
                  className={`transition-all duration-500 ease-in-out ${
                    isActive
                      ? 'opacity-100 scale-100 blur-0'
                      : 'opacity-15 scale-[0.98] blur-[1px] pointer-events-none'
                  }`}
                >
                  {/* Category Label at the top-left of each marquee (subtle) */}
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-soft)] mb-2 block px-2 opacity-60">
                    {row.categoryName}
                  </span>

                  {/* Infinite Moving Marquee strip */}
                  <div className="marquee-container mask-gradient bg-white rounded-2xl py-5 border border-[var(--border)]/60 shadow-[0_2px_8px_-3px_rgba(11,14,20,0.03)] relative flex items-center overflow-hidden">
                    <div className={`${row.speedClass} gap-14 px-7 flex items-center`}>
                      {duplicatedItems.map((logo, idx) => (
                        <div
                          key={`${logo.name}-${idx}`}
                          className="relative group flex flex-col items-center justify-center min-w-[90px] h-[80px] transition-all duration-300 hover:scale-110 cursor-help"
                        >
                          {/* Logo representation */}
                          <div className="w-10 h-10 flex items-center justify-center transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(37,84,255,0.3)]">
                            {resolveSkillIcon(logo.icon_name || '')}
                          </div>

                          {/* Brand Name */}
                          <span className="text-[10px] font-medium text-[var(--ink-soft)] mt-2 font-mono tracking-tight transition-colors group-hover:text-[var(--blue)]">
                            {logo.name}
                          </span>

                          {/* Highly Elegant Hover Tooltip Popup showing skill proficiency level */}
                          <div className="absolute bottom-full mb-3 hidden group-hover:flex flex-col items-center z-50 pointer-events-none animate-fadeIn">
                            <div className="bg-[var(--ink)] text-white text-[10px] font-mono px-3 py-1.5 rounded-lg shadow-xl border border-white/10 whitespace-nowrap">
                              <span className="font-bold text-[var(--cyan)]">{logo.name}</span>
                              <span className="mx-1 text-slate-400">::</span>
                              <span className="text-emerald-400 font-semibold">{logo.level || 'Intermediate'}</span>
                            </div>
                            <div className="w-2.5 h-2.5 bg-[var(--ink)] rotate-45 -mt-1.5 border-r border-b border-white/10" />
                          </div>
                        </div>
                      ))}
                    </div>
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