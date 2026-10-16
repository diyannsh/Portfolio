import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { store } from "@/lib/store";

export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const dx = gsap.quickTo(dot.current, "x", { duration: 0.08 });
    const dy = gsap.quickTo(dot.current, "y", { duration: 0.08 });
    const rx = gsap.quickTo(ring.current, "x", { duration: 0.5, ease: "power3" });
    const ry = gsap.quickTo(ring.current, "y", { duration: 0.5, ease: "power3" });
    const move = (e: PointerEvent) => {
      store.mouse.active = true;
      store.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      store.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      if (!fine) return;
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
      const t = (e.target as HTMLElement).closest?.("[data-cursor], a, button") as HTMLElement | null;
      const l = t?.dataset["cursor"] ?? "";
      setLabel(l);
      gsap.to(ring.current, { scale: t ? (l ? 2.6 : 1.8) : 1, duration: 0.3 });
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] hidden mix-blend-difference [@media(pointer:fine)]:block">
      <div ref={dot} className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-foreground" />
      <div ref={ring} className="absolute -left-5 -top-5 grid h-10 w-10 place-items-center rounded-full border border-foreground">
        <span className="text-[5px] font-bold tracking-[0.2em] text-foreground">{label}</span>
      </div>
    </div>
  );
}
