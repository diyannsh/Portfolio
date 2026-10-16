import { useCallback, useEffect, useState } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Experience } from "./canvas/Experience";
import { Intro } from "./dom/Intro";
import { Cursor } from "./dom/Cursor";
import { Nav } from "./dom/Nav";
import { About, Contact, ExperienceSection, Hero, Projects, Skills } from "./dom/Sections";
import { portfolio } from "@/data/portfolio";
import { store } from "@/lib/store";
import { setSound, click } from "@/lib/sound";

gsap.registerPlugin(ScrollTrigger);

function Hud({ show }: { show: boolean }) {
  const [pct, setPct] = useState(0);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = setInterval(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setPct(max > 0 ? Math.round((store.scroll / max) * 100) : 0);
    }, 100);
    return () => clearInterval(id);
  }, []);
  return (
    <div className={`fixed inset-x-0 bottom-0 z-50 flex items-center justify-between px-5 py-5 md:px-8 pointer-events-none transition-opacity duration-1000 ${show ? "opacity-100" : "opacity-0"}`}>
      <span className="ui-label text-muted-foreground tabular-nums">{String(pct).padStart(3, "0")}%</span>
      <button
        onClick={() => { const n = !on; setOn(n); setSound(n); click(); }}
        className="pointer-events-auto ui-label flex items-center gap-2 text-muted-foreground hover:text-foreground"
        aria-label="Toggle sound"
      >
        <span className="flex h-3 items-end gap-[2px]">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="w-[2px] bg-current transition-all" style={{ height: on ? `${4 + ((i * 5) % 9)}px` : "2px" }} />
          ))}
        </span>
        Sound {on ? "on" : "off"}
      </button>
    </div>
  );
}

export function Portfolio() {
  const [ready, setReady] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    setMobile(window.innerWidth < 768);
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    (window as any).__lenis = lenis;
    lenis.stop();
    lenis.on("scroll", (e: Lenis) => {
      store.scroll = e.scroll;
      store.velocity = e.velocity;
      ScrollTrigger.update();
    });
    const raf = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(raf); lenis.destroy(); };
  }, []);

  const onDone = useCallback(() => {
    setReady(true);
    (window as any).__lenis?.start();
    setTimeout(() => ScrollTrigger.refresh(), 100);
  }, []);

  return (
    <>
      <Experience photo={portfolio.photo} mobile={mobile} />
      <div className="grain" />
      <svg className="absolute h-0 w-0" aria-hidden>
        <filter id="rgb-shift">
          <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
          <feOffset in="r" dx="-6" result="r2" />
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
          <feOffset in="b" dx="6" result="b2" />
          <feBlend in="r2" in2="g" mode="screen" result="rg" />
          <feBlend in="rg" in2="b2" mode="screen" />
        </filter>
        <filter id="wave">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.04" numOctaves="2" seed="3">
            <animate attributeName="baseFrequency" dur="6s" values="0.012 0.04;0.02 0.06;0.012 0.04" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" scale="22" />
        </filter>
      </svg>
      <Cursor />
      <Intro onDone={onDone} />
      <Nav show={ready} />
      <main className="relative z-10">
        <Hero show={ready} />
        <div className="relative bg-gradient-to-b from-transparent via-background/70 to-background">
          <About />
        </div>
        <div className="relative bg-background">
          <Skills />
          <Projects />
          <ExperienceSection />
          <Contact />
        </div>
      </main>
      <Hud show={ready} />
    </>
  );
}
