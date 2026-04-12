import { type RefObject, useEffect, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

export function useScrollReveal(ref: RefObject<Element | null>): boolean {
  const reducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      setIsVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, reducedMotion]);

  return isVisible;
}
