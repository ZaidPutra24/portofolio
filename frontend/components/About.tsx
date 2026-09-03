'use client';

import React, { useEffect, useState, useRef } from 'react';
import { getImageUrl } from '@/lib/utils';
import SectionHeader from '@/components/SectionHeader';

interface Profile {
  full_name: string;
  headline?: string;
  bio?: string;
  education?: string;
  career_focus?: string;
  research_interests?: string;
  avatar_url?: string;
}

function InteractiveProfileCard({ avatarUrl, fullName, headline }: { avatarUrl: string; fullName: string; headline?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [transformStyle, setTransformStyle] = useState('');
  const [imgTransform, setImgTransform] = useState('translate(0px, 0px)');
  const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50 });
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const normX = (x - centerX) / centerX;
    const normY = (y - centerY) / centerY;

    const rotateX = -normY * 3;
    const rotateY = normX * 3;
    setTransformStyle(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`);

    const imgX = -normX * 5;
    const imgY = -normY * 5;
    setImgTransform(`translate(${imgX}px, ${imgY}px)`);

    const spotX = (x / rect.width) * 100;
    const spotY = (y / rect.height) * 100;
    setSpotlightPos({ x: spotX, y: spotY });
  };

  const handleMouseEnter = () => {
    if (reducedMotion) return;
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setImgTransform('translate(0px, 0px)');
    setSpotlightPos({ x: 50, y: 50 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        borderRadius: '16px',
        background: 'var(--surface)',
        border: isHovered ? '1px solid rgba(37, 84, 255, 0.4)' : '1px solid var(--border)',
        boxShadow: isHovered
          ? '0 12px 32px -8px rgba(37, 84, 255, 0.12), 0 4px 12px -2px rgba(11, 14, 20, 0.08)'
          : '0 4px 24px -12px rgba(11, 14, 20, 0.08)',
        padding: '16px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        transform: transformStyle,
        transition: isHovered ? 'border-color 0.4s ease, box-shadow 0.4s ease' : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.4s ease, box-shadow 0.4s ease',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle 220px at ${spotlightPos.x}% ${spotlightPos.y}%, rgba(37, 84, 255, 0.07), transparent 70%)`,
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.4s ease',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: isHovered ? 0.7 : 0,
          transition: 'opacity 0.5s ease',
          pointerEvents: 'none',
          zIndex: 3,
        }}
      >
        <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
          <circle cx="18%" cy="22%" r="2" fill="var(--blue)" opacity="0.45" />
          <circle cx="82%" cy="28%" r="1.5" fill="var(--blue)" opacity="0.35" />
          <circle cx="78%" cy="72%" r="2" fill="var(--blue)" opacity="0.4" />
          <circle cx="22%" cy="78%" r="1.5" fill="var(--blue)" opacity="0.3" />
          <line x1="18%" y1="22%" x2="35%" y2="28%" stroke="var(--blue)" strokeWidth="0.5" opacity="0.25" />
          <line x1="78%" y1="72%" x2="82%" y2="28%" stroke="var(--blue)" strokeWidth="0.5" opacity="0.2" />
        </svg>
      </div>

      <div style={{ position: 'relative', zIndex: 4 }}>
        <div style={{ overflow: 'hidden', borderRadius: '12px', marginBottom: '12px' }}>
          <img
            src={avatarUrl}
            alt={fullName}
            style={{
              width: '100%',
              height: '220px',
              objectFit: 'cover',
              borderRadius: '12px',
              transform: imgTransform,
              transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
          />
        </div>
        <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{fullName}</h3>
        {headline && <p style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '4px' }}>{headline}</p>}
      </div>
    </div>
  );
}

export default function About() {
  const [profile, setProfile] = useState<Profile>({
    full_name: 'Zaid Helsinki',
    headline: '',
    bio: 'I started with a deep fascination for clean code and robust systems, building APIs, databases, and structured backends. That foundation naturally expanded into integrating AI models, vector databases, and responsive frontends.\n\nToday I focus on building complete digital solutions that are lightning fast, elegant, and maintainable. I care deeply about architecture, user experience, and delivering software that truly works.',
    education: '',
    career_focus: '',
    research_interests: '',
    avatar_url: '',
  });

  useEffect(() => {
    async function fetchProfile() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      try {
        const res = await fetch(`${apiUrl}/api/v1/profile`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.full_name) {
            setProfile(data);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    }
    fetchProfile();
  }, []);

  const bioParagraphs = profile.bio
    ? profile.bio.split('\n\n').filter(Boolean)
    : [
        'I started with a deep fascination for clean code and robust systems, building APIs, databases, and structured backends. That foundation naturally expanded into integrating AI models, vector databases, and responsive frontends.',
        'Today I focus on building complete digital solutions that are lightning fast, elegant, and maintainable. I care deeply about architecture, user experience, and delivering software that truly works.'
      ];

  return (
    <section id="about">
      <div className="wrap">
        <SectionHeader
          label="ABOUT"
          title="Bridging the gap between engineering &"
          accentTitle="intelligent systems."
          description={profile.career_focus || 'Grounded in full-stack architecture, focused on scalable backend APIs and modern web interfaces.'}
        />
        <div className="about-grid">
          <div className="bio">
            {bioParagraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
            <div className="stack-row">
              <span className="stack-chip">PYTHON</span>
              <span className="stack-chip">FASTAPI</span>
              <span className="stack-chip">NEXT.JS</span>
              <span className="stack-chip">TYPESCRIPT</span>
              <span className="stack-chip">TAILWIND</span>
              <span className="stack-chip">POSTGRESQL</span>
              <span className="stack-chip">DOCKER</span>
              <span className="stack-chip">GIT</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {profile.avatar_url && (
              <InteractiveProfileCard avatarUrl={getImageUrl(profile.avatar_url)} fullName={profile.full_name} headline={profile.headline} />
            )}
            <div className="stat-grid">
              <div className="stat"><div className="num">15+</div><div className="lbl">Projects completed</div></div>
              <div className="stat"><div className="num">100%</div><div className="lbl">Commitment</div></div>
              <div className="stat"><div className="num">10+</div><div className="lbl">National & International Awards</div></div>
              <div className="stat"><div className="num">99.9%</div><div className="lbl">System reliability</div></div>
            </div>
            {(profile.education || profile.career_focus || profile.research_interests) && (
              <div style={{ borderRadius: '16px', background: 'var(--surface)', border: '1px solid var(--border)', padding: '20px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {profile.education && <div><strong style={{ color: 'var(--ink)' }}>Education:</strong> <span style={{ color: 'var(--ink-soft)' }}>{profile.education}</span></div>}
                {profile.career_focus && <div><strong style={{ color: 'var(--ink)' }}>Career Focus:</strong> <span style={{ color: 'var(--ink-soft)' }}>{profile.career_focus}</span></div>}
                {profile.research_interests && <div><strong style={{ color: 'var(--ink)' }}>Research Interests:</strong> <span style={{ color: 'var(--ink-soft)' }}>{profile.research_interests}</span></div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
