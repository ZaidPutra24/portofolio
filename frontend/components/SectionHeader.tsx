import React from 'react';

export interface SectionHeaderProps {
  label: string;
  title: string | React.ReactNode;
  accentTitle?: string;
  titleSuffix?: string;
  description?: string | React.ReactNode;
  align?: 'left' | 'center';
  darkBg?: boolean;
  className?: string;
}

export default function SectionHeader({
  label,
  title,
  accentTitle,
  titleSuffix,
  description,
  align = 'left',
  darkBg = false,
  className = '',
}: SectionHeaderProps) {
  const alignClass = align === 'center' ? 'text-center' : 'text-left';

  return (
    <div className={`section-header mb-12 ${alignClass} ${className}`}>
      <div className={`section-label eyebrow mb-2 ${darkBg ? '!text-slate-400' : ''}`}>
        {label}
      </div>
      <h2
        className={`section-title text-3xl md:text-5xl font-bold tracking-tight mb-4 ${
          darkBg ? 'text-white' : 'text-[var(--ink)]'
        }`}
      >
        {title}
        {accentTitle && (
          <>
            {' '}
            <span className="section-title-accent font-normal italic bg-gradient-to-r from-[var(--blue)] to-[var(--indigo)] text-transparent bg-clip-text drop-shadow-[0_0_15px_rgba(37,84,255,0.2)]">
              {accentTitle}
            </span>
          </>
        )}
        {titleSuffix && ` ${titleSuffix}`}
      </h2>
      {description && (
        <p
          className={`section-description text-sm md:text-base max-w-2xl ${
            darkBg ? 'text-slate-300' : 'text-[var(--ink-soft)]'
          } ${align === 'center' ? 'mx-auto' : ''}`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
