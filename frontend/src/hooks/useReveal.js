import { useEffect, useRef } from 'react';

export function useReveal(threshold = 0.1) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold, rootMargin: '0px 0px -50px 0px' }
    );

    const revealElements = element.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-fade');
    revealElements.forEach((el) => observer.observe(el));

    // Also observe the container itself if it has reveal class
    if (element.classList.contains('reveal') || 
        element.classList.contains('reveal-left') || 
        element.classList.contains('reveal-right') ||
        element.classList.contains('reveal-scale') ||
        element.classList.contains('reveal-fade')) {
      observer.observe(element);
    }

    return () => {
      revealElements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [threshold]);

  return ref;
}

export function usePageReveal() {
  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-fade');
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    revealElements.forEach((el) => observer.observe(el));

    return () => {
      revealElements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);
}
