'use client';

import React, { useEffect, useState } from 'react';
import SectionHeader from '@/components/SectionHeader';

interface SocialLink {
  id: number;
  platform_name: string;
  url: string;
  is_active: boolean;
}

export default function ContactForm() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [formData, setFormData] = useState({
    sender_name: '',
    sender_email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchSocial() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      try {
        const res = await fetch(`${apiUrl}/api/v1/social`);
        if (res.ok) {
          const data = await res.json();
          setSocialLinks(data.filter((s: SocialLink) => s.is_active));
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchSocial();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: '' });

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    try {
      const res = await fetch(`${apiUrl}/api/v1/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: 'success', message: 'Message sent successfully! Thank you for reaching out.' });
        setFormData({ sender_name: '', sender_email: '', subject: '', message: '' });
      } else {
        setStatus({ type: 'error', message: data.detail || 'Failed to send message. Please try again.' });
      }
    } catch {
      setStatus({ type: 'error', message: 'Network error. Please check if backend is running.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact-outer">
      <div id="contact">
        <div className="contact-grid">
          <div>
            <SectionHeader
              label="CONTACT"
              title="Let's build something that has to"
              accentTitle="actually work."
              description="Open to full-stack roles, web projects, and select advisory work. Fastest way to reach me is email."
              darkBg={true}
            />
            <div className="status-badge">Open to new projects, 2026</div>
            <div className="social-row">
              {socialLinks.length > 0 ? (
                socialLinks.map((s) => {
                  const name = s.platform_name || '';
                  const abbr = name.length <= 3 ? name.toUpperCase() : name.slice(0, 2).toUpperCase();
                  return (
                    <a key={s.id} href={s.url} target="_blank" rel="noreferrer" aria-label={s.platform_name} title={s.platform_name}>
                      {abbr}
                    </a>
                  );
                })
              ) : (
                <>
                  <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub">GH</a>
                  <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">IN</a>
                </>
              )}
            </div>
          </div>
          <form className="contact-form" id="contactForm" onSubmit={handleSubmit}>
            {status.type && (
              <div className={`mb-4 p-3 rounded text-xs ${status.type === 'success' ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800' : 'bg-rose-950/60 text-rose-300 border border-rose-800'}`}>
                {status.message}
              </div>
            )}
            <div className="field">
              <label>Name</label>
              <input
                type="text"
                id="cName"
                placeholder="Your name"
                required
                value={formData.sender_name}
                onChange={e => setFormData({ ...formData, sender_name: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                id="cEmail"
                placeholder="you@company.com"
                required
                value={formData.sender_email}
                onChange={e => setFormData({ ...formData, sender_email: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Subject</label>
              <input
                type="text"
                id="cSubject"
                placeholder="Project inquiry / Collaboration"
                required
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Message</label>
              <textarea
                id="cMessage"
                rows={4}
                placeholder="Tell me about your project or role..."
                required
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Sending Message...' : 'Send Message →'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
