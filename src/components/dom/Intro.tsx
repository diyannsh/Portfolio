import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { finishIntro, store } from "@/lib/store";
import { portfolio } from "@/data/portfolio";

export function Intro({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(0);
  const [gone, setGone] = useState(false);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const q = gsap.utils.selector(root);
    const counter = { v: 0 };
    gsap.to(counter, { v: 100, duration: 2.2, ease: "power2.inOut", onUpdate: () => setPct(Math.round(counter.v)) });

    const end = () => {
      store.portrait = 0;
      finishIntro();
      gsap.to(store, { portrait: 1, duration: reduce ? 0 : 3.2, ease: "expo.out" });
      gsap.to(store, { stars: 1, duration: reduce ? 0 : 2.5, ease: "power2.out" });
      onDone();
    };

    if (reduce) {
      setGone(true);
      end();
      return;
    }

    const t = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.current = t;
    
    // Initial setup to guarantee no overlap
    t.set(q(".bar"), { width: 14, height: 6, borderRadius: 999, opacity: 0, rotate: 0 })
      .set(q(".dot"), { opacity: 0, scale: 0 })
      .set(q(".n1"), { opacity: 1 })
      .set(q(".n2"), { opacity: 0 }) // Hide the second word's container completely
      
      .to(q(".spot"), { opacity: 1, duration: 1.2, ease: "power2.out" })
      .to(q(".bar"), { opacity: 1, duration: 0.8, ease: "power2.out" }, "-=0.6")
      .to(q(".bar"), { width: 8, height: 56, rotate: -75, duration: 0.7, ease: "power3.inOut" })
      .to(q(".bar"), { rotate: 0, y: -18, duration: 1.6, ease: "elastic.out(1.1, 0.28)" })
      .to(q(".dot"), { opacity: 1, scale: 1, y: 30, duration: 0.6, ease: "back.out(3)" }, "-=1.1")
      .to([q(".bar"), q(".dot")], { scaleY: 0, scaleX: 3, opacity: 0, duration: 0.25, ease: "power4.in" }, "+=0.2")
      .fromTo(q(".flash"), { opacity: 0, scale: 0.2 }, { opacity: 1, scale: 1.4, duration: 0.15, ease: "power2.out" })
      .to(q(".flash"), { opacity: 0, duration: 0.6, ease: "power2.out" })
      
      // First word enters
      .fromTo(q(".n1 span"), { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1, stagger: 0.04 }, "-=0.55")
      // First word exits
      .to(q(".n1 span"), { rotateX: 90, opacity: 0, duration: 0.35, stagger: 0.03, ease: "power3.in" }, "+=0.5")
      
      // CRITICAL FIX: Hide the first word container entirely, show the second word container
      .set(q(".n1"), { opacity: 0 })
      .set(q(".n2"), { opacity: 1 })
      
      // Second word enters (forced to wait until after the .set commands)
      .fromTo(q(".n2 span"), { rotateX: -90, opacity: 0 }, { rotateX: 0, opacity: 1, duration: 0.6, stagger: 0.035 }, "+=0.1")
      
      .to(store, { stars: 0.6, duration: 1.2, ease: "power2.out" }, "+=0.1")
      .to(q(".n2"), { y: "26vh", scale: 0.92, duration: 1.1, ease: "power3.inOut" }, "<")
      .to(q(".spot"), { opacity: 0, duration: 1 }, "<")
      .add(end, "-=0.3")
      .to(root.current, { opacity: 0, duration: 0.5, onComplete: () => setGone(true) });

    return () => {
      t.kill();
    };
  }, [onDone]);

  const skip = () => {
    if (!tl.current) return;
    tl.current.progress(1);
  };

  if (gone) return null;
  return (
    <div ref={root} onClick={skip} className="fixed inset-0 z-[80] overflow-hidden cursor-pointer bg-transparent">
      <div className="spot pointer-events-none absolute inset-0 spotlight opacity-0" />
      <div className="absolute inset-0 grid place-items-center">
        <div className="bar glow absolute" />
        <div className="dot glow absolute h-3.5 w-3.5 rounded-full" />
        <div className="flash glow absolute h-40 w-40 rounded-full opacity-0 blur-2xl" />
        
        {/* Removed chrome-text from the h1 parent, kept it on spans */}
        <h1 className="n1 absolute flex overflow-hidden pb-2 text-[clamp(2.5rem,16vw,11rem)]" style={{ perspective: 600 }}>
          {portfolio.firstName.split("").map((c, i) => (
            <span key={i} className="inline-block chrome-text opacity-0">{c === " " ? "\u00A0" : c}</span>
          ))}
        </h1>
        
        <h1 className="n2 absolute flex text-[clamp(2.5rem,16vw,11rem)]" style={{ perspective: 600 }}>
          {portfolio.heroWord.split("").map((c, i) => (
            <span key={i} className="inline-block chrome-text opacity-0">{c === " " ? "\u00A0" : c}</span>
          ))}
        </h1>
      </div>
      <div className="absolute bottom-6 left-6 ui-label text-muted-foreground tabular-nums">{String(pct).padStart(3, "0")}%</div>
      <div className="absolute bottom-6 right-6 ui-label text-muted-foreground">Click to skip</div>
    </div>
  );
}
