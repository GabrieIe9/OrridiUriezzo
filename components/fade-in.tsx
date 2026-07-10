'use client';

import {useEffect, useRef, useState, type ReactNode} from 'react';

type FadeInProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function FadeIn({children, className = '', delay = 0}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || !('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {rootMargin: '0px 0px -8% 0px', threshold: 0.12}
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`fade-in ${visible ? 'is-visible' : ''} ${className}`}
      style={{transitionDelay: `${delay}ms`}}
    >
      {children}
    </div>
  );
}
