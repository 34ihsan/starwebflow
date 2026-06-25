'use client';

import { useState, useEffect } from 'react';

export function useSectionTracker(sectionIds: string[]) {
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [timeOnPage, setTimeOnPage] = useState<number>(0);

  useEffect(() => {
    // Track total time spent on page
    const timer = setInterval(() => {
      setTimeOnPage(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 } // Trigger when 50% of the section is visible
    );

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sectionIds]);

  return { activeSection, timeOnPage };
}
