'use client';

import React, { useEffect, useState } from 'react';

export default function Footer() {
  const [fullName, setFullName] = useState('ZAID HELSINKI');

  useEffect(() => {
    async function fetchProfile() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      try {
        const res = await fetch(`${apiUrl}/api/v1/profile`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.full_name) {
            setFullName(data.full_name.toUpperCase());
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    }
    fetchProfile();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer>
      <div className="f-copy mono">© {new Date().getFullYear()} {fullName}. BUILT WITH INTENT.</div>
      <div className="back-top" onClick={scrollToTop}>Back to top ↑</div>
    </footer>
  );
}
