import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Skills from '@/components/Skills';
import Experience from '@/components/Experience';
import Projects from '@/components/Projects';
import Publications from '@/components/Publications';
import Achievements from '@/components/Achievements';
import Certificates from '@/components/Certificates';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <div className="portfolio-root">
      <Navbar />
      <Hero />
      <About />
      <Skills />
      <Experience />
      <Projects />
      <Publications />
      <Achievements />
      <Certificates />
      <ContactForm />
      <Footer />
    </div>
  );
}
