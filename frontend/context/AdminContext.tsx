'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface AdminContextType {
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
  confirmNavigation: (url: string) => boolean;
}

const AdminContext = createContext<AdminContextType>({
  isDirty: false,
  setIsDirty: () => {},
  confirmNavigation: () => true,
});

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isDirty, setIsDirty] = useState(false);
  const pathname = usePathname();

  // Reset dirty state on route change
  useEffect(() => {
    setIsDirty(false);
  }, [pathname]);

  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes.\nAre you sure you want to leave?';
      return e.returnValue;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  const confirmNavigation = () => {
    if (isDirty) {
      const confirmed = window.confirm('You have unsaved changes.\nAre you sure you want to leave?');
      if (!confirmed) {
        return false;
      }
    }
    return true;
  };

  return (
    <AdminContext.Provider value={{ isDirty, setIsDirty, confirmNavigation }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
