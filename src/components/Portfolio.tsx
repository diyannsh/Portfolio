import { useCallback, useEffect, useState } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Intro } from "./dom/Intro";
import { Nav, scrollToId } from "./dom/Nav";
import { About, Contact, ExperienceSection, Hero, Projects, Skills } from "./dom/Sections";
import { store } from "@/lib/store";
import { setSound, click } from "@/lib/sound";

gsap.registerPlugin(ScrollTrigger);

const storyChapters = [
  { id: "home", label: "Opening" },
  { id: "about", label: "About" },
  { id: "skills", label: "Toolkit" },
  { id: "projects", label: "Selected work" },
  { id: "experience", label: "Journey" },
  { id: "contact", label: "Contact" },
];

function StoryRail({ show }: { show: boolean }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const updateTone = (id: string) => {
      document.documentElement.dataset["storyTone"] = ["skills", "experience", "contact"].includes(id) ? "dark" : "light";
    };
    const current = storyChapters.reduce((latest, chapter, index) => {
      const section = document.getElementById(chapter.id);
      return section && section.getBoundingClientRect().top <= window.innerHeight * 0.55 ? index : latest;
    }, 0);
    setActive(current);
    updateTone(storyChapters[current]?.id ?? "home");

    const triggers = storyChapters.flatMap((chapter, index) => {
      const section = document.getElementById(chapter.id);
      if (!section) return [];
      return [ScrollTrigger.create({
        trigger: section,
        start: "top 55%",
        end: "bottom 45%",
        onEnter: () => { setActive(index); updateTone(chapter.id); },
        onEnterBack: () => { setActive(index); updateTone(chapter.id); },
      })];
    });
    return () => {
      triggers.forEach((trigger) => trigger.kill());
      delete document.documentElement.dataset["storyTone"];
    };
  }, []);

  if (!show) return null;

  return (
    <>
      <aside aria-label="Portfolio story chapters" className="story-rail fixed right-5 top-1/2 z-[55] hidden -translate-y-1/2 flex-col items-end gap-3 lg:flex">
        <span className="ui-label mb-2 text-muted-foreground">{String(active + 1).padStart(2, "0")} / {String(storyChapters.length).padStart(2, "0")}</span>
        {storyChapters.map((chapter, index) => (
          <button
            key={chapter.id}
            onClick={() => scrollToId(chapter.id)}
            aria-current={active === index ? "step" : undefined}
            aria-label={`Go to ${chapter.label}`}
            className={`group flex items-center gap-3 transition-all duration-300 ${active === index ? "text-foreground" : "text-muted-foreground/50 hover:text-foreground"}`}
          >
            <span className={`ui-label transition-all duration-300 ${active === index ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>{chapter.label}</span>
            <span className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${active === index ? "scale-150 bg-foreground" : "bg-current"}`} />
          </button>
        ))}
      </aside>
      <div aria-live="polite" className="story-rail fixed inset-x-5 bottom-[4.5rem] z-[55] lg:hidden">
        <div className="mb-2 flex justify-between ui-label text-muted-foreground">
          <span>{String(active + 1).padStart(2, "0")} / {String(storyChapters.length).padStart(2, "0")}</span>
          <span>{storyChapters[active]?.label}</span>
        </div>
        <div className="flex gap-1.5">
          {storyChapters.map((chapter, index) => (
            <button
              key={chapter.id}
              onClick={() => scrollToId(chapter.id)}
              aria-label={`Go to ${chapter.label}`}
              aria-current={active === index ? "step" : undefined}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${active === index ? "bg-foreground" : "bg-foreground/20"}`}
            />
          ))}
        </div>
      </div>
    </>
  );
}

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
    <div className={`race-hud fixed inset-x-0 bottom-0 z-50 flex items-center justify-between px-5 py-5 md:px-8 pointer-events-none transition-opacity duration-1000 ${show ? "opacity-100" : "opacity-0"}`}>
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

  // Pointer input for the skill cloud and scene, independent of cursor styling.
  useEffect(() => {
    const move = (event: PointerEvent) => {
      store.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      store.mouse.y = 1 - (event.clientY / window.innerHeight) * 2;
      store.mouse.active = true;
    };
    const leave = () => { store.mouse.active = false; };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("blur", leave);
    document.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("blur", leave);
      document.removeEventListener("pointerleave", leave);
    };
  }, []);

  useEffect(() => {
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

  useEffect(() => {
    if (!ready || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const hero = document.getElementById("home");
    const about = document.getElementById("about");
    const skills = document.getElementById("skills");
    if (!hero || !about || !skills) return;

    const transitions = [
      { outgoing: hero, incoming: about },
      { outgoing: about, incoming: skills },
    ].map(({ outgoing, incoming }) =>
      gsap.fromTo(
        outgoing,
        { scale: 1, filter: "brightness(1)", borderRadius: "0px" },
        {
          scale: 0.9,
          filter: "brightness(0.45)",
          borderRadius: "24px",
          transformOrigin: "center center",
          ease: "none",
          scrollTrigger: {
            trigger: incoming,
            start: "top bottom",
            end: "top top",
            scrub: 1,
          },
        },
      ),
    );

    return () => {
      transitions.forEach((transition) => {
        transition.scrollTrigger?.kill();
        transition.kill();
      });
    };
  }, [ready]);

  const onDone = useCallback(() => {
    setReady(true);
    (window as any).__lenis?.start();
    setTimeout(() => ScrollTrigger.refresh(), 100);
  }, []);

  return (
    <>
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
      <Intro onDone={onDone} />
      <Nav show={ready} />
      <StoryRail show={ready} />
      <main className="relative z-10">
        <div className="story-stack">
          <div className="story-stack__chapter story-stack__chapter--hero">
            <Hero show={ready} />
          </div>
          <div className="story-stack__chapter story-stack__chapter--about">
            <div className="relative h-full bg-gradient-to-b from-transparent via-background/70 to-background">
              <About />
            </div>
          </div>
          <div className="story-stack__chapter story-stack__chapter--skills">
            <Skills />
          </div>
        </div>
        <div className="relative bg-background">
          <Projects />
          <ExperienceSection />
          <Contact />
        </div>
      </main>
      <Hud show={ready} />
    </>
  );
}
