import { useRef, useState } from 'react';
import type { CSSProperties, MouseEventHandler } from 'react';

export function useMouseTilt<T extends HTMLElement>(maxDegrees = 8) {
  const ref = useRef<T>(null);
  const [style, setStyle] = useState<CSSProperties>({
    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
    transition: 'transform 180ms ease-out',
    transformStyle: 'preserve-3d',
  });

  const onMouseMove: MouseEventHandler<T> = (event) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    const rotateY = Math.max(-maxDegrees, Math.min(maxDegrees, x * maxDegrees * 2));
    const rotateX = Math.max(-maxDegrees, Math.min(maxDegrees, -y * maxDegrees * 2));

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      transition: 'transform 80ms ease-out',
      transformStyle: 'preserve-3d',
    });
  };

  const onMouseLeave: MouseEventHandler<T> = () => {
    setStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
      transition: 'transform 220ms ease-out',
      transformStyle: 'preserve-3d',
    });
  };

  return { ref, style, onMouseMove, onMouseLeave };
}
