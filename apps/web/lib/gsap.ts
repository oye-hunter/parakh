import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

export function smoothScrollTo(
  target: string | HTMLElement,
  options?: { offsetY?: number; duration?: number; onComplete?: () => void }
) {
  if (typeof window === 'undefined') return;

  const targetEl = typeof target === 'string' ? document.querySelector(target) : target;
  if (!targetEl && typeof target === 'string' && target.startsWith('#') && target !== '#') return;

  const defaultOffset = typeof window !== 'undefined' && window.innerWidth < 820 ? 80 : 72;
  const offsetY = options?.offsetY ?? defaultOffset;
  const duration = options?.duration ?? 0.85;

  gsap.to(window, {
    duration,
    scrollTo: {
      y: target,
      offsetY,
      autoKill: true,
    },
    ease: 'power3.inOut',
    onComplete: options?.onComplete,
  });
}

export { gsap, ScrollTrigger, ScrollToPlugin };

