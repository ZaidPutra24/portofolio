'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AdminProvider, useAdmin } from '@/context/AdminContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: 'dashboard' },
  { name: 'Profile', href: '/admin/profile', icon: 'account_circle' },
  { name: 'Projects', href: '/admin/projects', icon: 'folder_open' },
  { name: 'Publications', href: '/admin/publications', icon: 'book' },
  { name: 'Experience', href: '/admin/experience', icon: 'work_outline' },
  { name: 'Skills', href: '/admin/skills', icon: 'code' },
  { name: 'Achievements', href: '/admin/achievements', icon: 'emoji_events' },
  { name: 'Certificates', href: '/admin/certificates', icon: 'verified' },
  { name: 'Messages', href: '/admin/messages', icon: 'mail' },
  { name: 'Social Links', href: '/admin/social', icon: 'share' },
  { name: 'Settings', href: '/admin/settings', icon: 'settings' },
];

function AdminNavLink({ href, onClick, className, children }: { href: string; onClick?: () => void; className?: string; children: React.ReactNode }) {
  const { confirmNavigation } = useAdmin();

  return (
    <Link
      href={href}
      onClick={(e) => {
        if (!confirmNavigation(href)) {
          e.preventDefault();
          return;
        }
        if (onClick) onClick();
      }}
      className={className}
    >
      {children}
    </Link>
  );
}

function AdminLayoutInner({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('admin_token');
    if (token) {
      setHasToken(true);
    } else {
      router.push('/admin/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  if (!mounted || !hasToken) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex items-center gap-3 text-slate-400">
          <span className="material-symbols-outlined animate-spin text-sky-500">sync</span> Checking authentication...
        </div>
      </div>
    );
  }

  const currentNav = navItems.find((item) => item.href === pathname);
  const pageTitle = currentNav ? currentNav.name : 'Dashboard';

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans antialiased">
      {/* TopNavBar */}
      <header className="bg-white text-blue-600 border-b border-slate-200 flex justify-between items-center w-full px-6 h-14 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden text-slate-600 hover:text-slate-900">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <span className="font-bold text-lg text-slate-900">Portfolio Archive</span>
          <span className="text-xs text-slate-500 hidden sm:inline">Admin / {pageTitle}</span>
        </div>
        <div className="flex items-center gap-3">
          <AdminNavLink
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-sm">open_in_new</span> View Site
          </AdminNavLink>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
            title="Sign Out"
          >
            <span className="material-symbols-outlined text-sm">logout</span> Sign Out
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SideNavBar */}
        <nav className="hidden lg:flex flex-col h-full py-4 gap-2 bg-slate-50 text-slate-700 border-r border-slate-200 w-64 flex-shrink-0 fixed inset-y-14 z-30 overflow-y-auto">
          <div className="px-5 mb-2">
            <div className="font-bold text-slate-900 text-base">Navigation</div>
            <div className="text-xs text-slate-500 mt-0.5">CMS v2.0</div>
          </div>
          <div className="flex-1 flex flex-col gap-1 px-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <AdminNavLink
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                  }`}
                >
                  <span className={`material-symbols-outlined text-lg ${isActive ? 'icon-fill' : ''}`}>{item.icon}</span>
                  <span>{item.name}</span>
                </AdminNavLink>
              );
            })}
          </div>
        </nav>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <nav className="relative flex flex-col h-full py-4 gap-2 bg-white text-slate-700 border-r border-slate-200 w-72 z-10 overflow-y-auto">
              <div className="px-5 mb-2 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-base">Navigation</div>
                  <div className="text-xs text-slate-500 mt-0.5">CMS v2.0</div>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="text-slate-500 hover:text-slate-900">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="flex-1 flex flex-col gap-1 px-3">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <AdminNavLink
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-lg ${isActive ? 'icon-fill' : ''}`}>{item.icon}</span>
                      <span>{item.name}</span>
                    </AdminNavLink>
                  );
                })}
              </div>
            </nav>
          </div>
        )}

        {/* Main Content Canvas */}
        <main className="flex-1 overflow-y-auto bg-slate-100 p-6 lg:p-10 lg:pl-72">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminProvider>
  );
}
