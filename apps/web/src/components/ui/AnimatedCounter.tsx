"use client";

import { useEffect, useState, useRef } from "react";

export default function AnimatedCounter({ end, duration = 2.5 }: { end: number, duration?: number }) {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // easeOutExpo
    const easeOut = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    const animate = (time: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = time;
      }
      const progress = (time - startTimeRef.current) / (duration * 1000);
      
      if (progress < 1) {
        const currentCount = Math.floor(easeOut(progress) * end);
        if (currentCount !== countRef.current) {
          countRef.current = currentCount;
          setCount(currentCount);
        }
        requestRef.current = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [end, duration]);

  return <span>{count}</span>;
}
