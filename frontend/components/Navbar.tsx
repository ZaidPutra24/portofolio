'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'About', href: '#about' },
  { name: 'Skills', href: '#skills' },
  { name: 'Experience', href: '#experience' },
  { name: 'Work', href: '#work' },
  { name: 'Publications', href: '#publications' },
  { name: 'Achievements', href: '#achievements' },
  { name: 'Certificates', href: '#certificates' },
];

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [activeHash, setActiveHash] = useState('#about');
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const spansRef = useRef<{ [key: string]: HTMLSpanElement | null }>({});
  const navLinksRef = useRef<HTMLDivElement | null>(null);
  const isClickScrolling = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updateIndicator = () => {
      if (!isHome || !activeHash) {
        setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
        return;
      }
      const activeSpan = spansRef.current[activeHash];
      const navLinksEl = navLinksRef.current;
      if (activeSpan && navLinksEl) {
        const spanRect = activeSpan.getBoundingClientRect();
        const navRect = navLinksEl.getBoundingClientRect();
        setIndicatorStyle({
          left: spanRect.left - navRect.left,
          width: spanRect.width,
          opacity: 1,
        });
      }
    };

    updateIndicator();
    const timer = setTimeout(updateIndicator, 50);
    window.addEventListener('resize', updateIndicator);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [activeHash, isHome]);

  useEffect(() => {
    if (!isHome) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.12 });

    const sections = document.querySelectorAll('.portfolio-root section');
    sections.forEach(sec => observer.observe(sec));

    return () => {
      observer.disconnect();
    };
  }, [isHome]);

  useEffect(() => {
    if (!isHome) return;

    const sectionIds = [...navItems.map(item => item.href), '#contact-outer'];
    const sections = sectionIds.map(href => document.querySelector(href)).filter(Boolean);

    const handleScroll = () => {
      if (isClickScrolling.current) return;

      const scrollPos = window.scrollY + 200;
      for (const section of sections) {
        if (section) {
          const top = (section as HTMLElement).offsetTop;
          const height = (section as HTMLElement).offsetHeight;
          const id = section.getAttribute('id');
          if (scrollPos >= top && scrollPos < top + height) {
            if (id === 'contact-outer') {
              setActiveHash('');
            } else {
              setActiveHash(`#${id}`);
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!isHome) {
      return; // allow standard navigation to /#about
    }
    e.preventDefault();
    isClickScrolling.current = true;
    setActiveHash(href);
    const targetEl = document.querySelector(href);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      isClickScrolling.current = false;
    }, 800);
  };

  const handleContactClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isHome) {
      window.location.href = '/#contact';
      return;
    }
    e.preventDefault();
    isClickScrolling.current = true;
    setActiveHash('');
    const contactEl = document.querySelector('#contact-outer') || document.querySelector('#contact');
    if (contactEl) {
      contactEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      isClickScrolling.current = false;
    }, 800);
  };

  return (
    <nav id="nav">
      <div className="brand"><span></span>Portofolio</div>
      <div className="nav-links" id="navLinks" ref={navLinksRef}>
        {navItems.map((item) => {
          const itemHref = isHome ? item.href : `/${item.href}`;
          return (
            <a
              key={item.href}
              href={itemHref}
              onClick={(e) => handleClick(e, item.href)}
              className={isHome && activeHash === item.href ? 'active' : ''}
            >
              <span ref={el => { spansRef.current[item.href] = el; }}>{item.name}</span>
            </a>
          );
        })}
        <div
          className="nav-indicator"
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
            opacity: indicatorStyle.opacity,
          }}
        />
      </div>
      <a href={isHome ? "#contact" : "/#contact"} onClick={handleContactClick} className="nav-cta">Contact →</a>
    </nav>
  );
}
