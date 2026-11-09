'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook bersama untuk mengelola state sidebar (isCollapsed & isMobileOpen)
 * Menyimpan preferensi isCollapsed ke localStorage agar konsisten di seluruh halaman & role
 * Default isCollapsed = false (Sidebar selalu terbuka lebar secara default)
 */
export function useSidebarState() {
  const [isCollapsed, setIsCollapsedState] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sidebar_collapsed');
      if (saved !== null) {
        setIsCollapsedState(saved === 'true');
      } else {
        // Default: Terbuka (lebar normal)
        setIsCollapsedState(false);
      }
    } catch {
      // Fallback jika localStorage tidak tersedia
      setIsCollapsedState(false);
    }
  }, []);

  const setIsCollapsed = useCallback((val: boolean) => {
    setIsCollapsedState(val);
    try {
      localStorage.setItem('sidebar_collapsed', String(val));
    } catch {
      // Ignore
    }
  }, []);

  return {
    isCollapsed,
    setIsCollapsed,
    isMobileOpen,
    setIsMobileOpen,
  };
}
