import { useState, useEffect, useRef } from "react";

export function useCountUp(target, duration = 600) {
  const [value, setValue] = useState(target);
  const prev = useRef(target);

  useEffect(() => {
    if (prev.current === target) return;
    const start = prev.current;
    const diff = target - start;
    const startTime = performance.now();

    const frame = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setValue(start + diff * ease);
      if (t < 1) requestAnimationFrame(frame);
      else {
        setValue(target);
        prev.current = target;
      }
    };

    requestAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

export function formatRub(n) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n) + " ₽";
}
