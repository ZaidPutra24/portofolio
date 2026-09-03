/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { getImageUrl } from '@/lib/utils';

export default function Hero() {
  const [profile, setProfile] = useState({
    full_name: 'Zaid Helsinki',
    headline: "I'm Zaid Helsinki, a full-stack web developer & AI engineer working across ML infrastructure, APIs, and product design. I turn prototypes into robust systems.",
    cv_url: '',
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

  useEffect(() => {
    let animId: number;
    let cleanup: (() => void) | undefined;
    let timer: NodeJS.Timeout;

    const init = () => {
      const mount = document.getElementById('heroCanvas');
      if (!mount || !(window as any).THREE) return false;

      const THREE = (window as any).THREE;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const w = mount.clientWidth || 400, h = mount.clientHeight || 480;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
      camera.position.z = 9;

      const canvasTest = document.createElement('canvas');
      const gl = canvasTest.getContext('webgl') || canvasTest.getContext('experimental-webgl');
      if (!gl) return true;

      let renderer: any;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        return true;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h);
      mount.innerHTML = '';
      mount.appendChild(renderer.domElement);

      const N = 70;
      const positions = new Float32Array(N * 3);
      const nodes: any[] = [];
      for (let i = 0; i < N; i++) {
        const p = new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 5
        );
        nodes.push(p);
        positions[i * 3] = p.x;
        positions[i * 3 + 1] = p.y;
        positions[i * 3 + 2] = p.z;
      }

      const ptsGeo = new THREE.BufferGeometry();
      ptsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const ptsMat = new THREE.PointsMaterial({ color: 0x2554ff, size: 0.08, transparent: true, opacity: 0.9 });
      const points = new THREE.Points(ptsGeo, ptsMat);
      scene.add(points);

      const lineVerts: number[] = [];
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          if (nodes[i].distanceTo(nodes[j]) < 2.1) {
            lineVerts.push(nodes[i].x, nodes[i].y, nodes[i].z, nodes[j].x, nodes[j].y, nodes[j].z);
          }
        }
      }
      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lineVerts), 3));
      const lineMat = new THREE.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.18 });
      const lines = new THREE.LineSegments(lineGeo, lineMat);
      scene.add(lines);

      const group = new THREE.Group();
      group.add(points);
      group.add(lines);
      scene.add(group);

      let mx = 0, my = 0;
      const handleMouseMove = (e: MouseEvent) => {
        const r = mount.getBoundingClientRect();
        mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        my = ((e.clientY - r.top) / r.height - 0.5) * 2;
      };
      mount.addEventListener('mousemove', handleMouseMove);

      function animate() {
        animId = requestAnimationFrame(animate);
        if (!reduce) {
          group.rotation.y += 0.0018;
          group.rotation.x += 0.0004;
        }
        group.rotation.y += (mx * 0.3 - group.rotation.y) * 0.02;
        group.rotation.x += (-my * 0.2 - group.rotation.x) * 0.02;
        renderer.render(scene, camera);
      }
      animate();

      const handleResize = () => {
        if (!mount) return;
        const nw = mount.clientWidth, nh = mount.clientHeight;
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
      };
      window.addEventListener('resize', handleResize);

      cleanup = () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', handleResize);
        mount.removeEventListener('mousemove', handleMouseMove);
        renderer.dispose();
      };

      return true;
    };

    if (!init()) {
      let attempts = 0;
      timer = setInterval(() => {
        attempts++;
        if (init() || attempts > 30) {
          clearInterval(timer);
        }
      }, 150);
    }

    return () => {
      clearInterval(timer);
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <section id="hero">
      <div className="wrap hero-grid">
        <div>
          <div className="eyebrow">Available for select engagements</div>
          <h1 style={{ marginTop: '18px' }}>
            Building systems<br />
            that <em>learn,</em> reason<br />
            &amp; ship to production.
          </h1>
          <p className="hero-sub">
            {profile.headline || `I'm ${profile.full_name}, a full-stack web developer & AI engineer working across ML infrastructure, APIs, and product design. I turn prototypes into robust systems.`}
          </p>
          <div className="hero-cta">
            <a href="#work" className="btn btn-primary">View Selected Work</a>
            <a href="#about" className="btn btn-ghost">About Me</a>
            {profile.cv_url && (
              <a href={getImageUrl(profile.cv_url)} target="_blank" rel="noreferrer" className="btn btn-ghost">Download CV</a>
            )}
          </div>
          <div className="hero-meta">
            <div><div className="num">15+</div><div className="lbl">Projects Built</div></div>
            <div><div className="num">3</div><div className="lbl">Publications</div></div>
            <div><div className="num">99%</div><div className="lbl">Client Satisfaction</div></div>
          </div>
        </div>
        <div className="hero-canvas-wrap">
          <div className="hero-tag mono">render :: latent_field</div>
          <div id="heroCanvas" style={{ width: '100%', height: '100%' }}></div>
        </div>
      </div>
    </section>
  );
}
