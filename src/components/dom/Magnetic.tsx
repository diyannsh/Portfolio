import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";

export function Magnetic({ children, strength = 0.35, className = "" }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => { xTo(0); yTo(0); };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); };
  }, [strength]);
  return <div ref={ref} className={`inline-block ${className}`}>{children}</div>;
}

export function Roll({ text }: { text: string }) {
  return (
    <span className="roll" aria-label={text}>
      {text.split("").map((c, i) => (
        <span key={i} data-c={c} style={{ transitionDelay: `${i * 18}ms` }} aria-hidden>
          {c === " " ? "\u00a0" : c}
        </span>
      ))}
    </span>
  );
}
