import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { portfolio } from "@/data/portfolio";
import { store } from "@/lib/store";
import { Magnetic, Roll } from "./Magnetic";
import { scrollToId } from "./Nav";
import { click } from "@/lib/sound";

gsap.registerPlugin(ScrollTrigger);

/* ---------- shared reveal ---------- */
function SplitHeading({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current!.querySelectorAll(".ch"), { yPercent: 110 }, {
        yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.03,
        scrollTrigger: { trigger: ref.current, start: "top 85%" },
      });
    });
    return () => ctx.revert();
  }, []);
  return (
    <h2 ref={ref} className={`chrome-text flex flex-wrap overflow-hidden pb-[0.08em] ${className}`}>
      {text.split("").map((c, i) => (
        <span key={i} className="ch inline-block chrome-text">{c === " " ? "\u00a0" : c}</span>
      ))}
    </h2>
  );
}

function Label({ n, text }: { n: string; text: string }) {
  return <p className="ui-label mb-6 text-muted-foreground"><span className="text-foreground">{n}</span> — {text}</p>;
}

/* ---------- HERO ---------- */
export function Hero({ show }: { show: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!show) return;
    const q = gsap.utils.selector(ref);
    gsap.fromTo(q(".hw"), { yPercent: 105 }, { yPercent: 0, stagger: 0.035, duration: 1.2, ease: "expo.out" });
    gsap.fromTo(q(".hs"), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 0.5, stagger: 0.1, ease: "power3.out" });
    const st = ScrollTrigger.create({
      trigger: ref.current, start: "top top", end: "bottom top", scrub: true,
      onUpdate: (s) => { store.heroProgress = s.progress; },
    });
    gsap.to(q(".htitle"), { yPercent: -40, opacity: 0, ease: "none", scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom top", scrub: true } });
    return () => st.kill();
  }, [show]);

  return (
    <section id="home" ref={ref} className="relative h-[100svh]">
      <div className="absolute inset-x-0 bottom-[11vh] px-4 md:px-8">
        <h1 className={`htitle chrome-text flex justify-center overflow-hidden pb-[0.06em] text-[17vw] md:text-[13.5vw] ${show ? "" : "invisible"}`}>
          {portfolio.heroWord.split("").map((c, i) => <span key={i} className="hw inline-block chrome-text">{c}</span>)}
        </h1>
        <div className={`mx-auto mt-3 flex max-w-[86vw] items-end justify-between ${show ? "" : "invisible"}`}>
          <p className="hs text-sm md:text-lg">
            <span className="font-bold">{portfolio.role.bold}</span>{" "}
            <span className="italic font-light text-muted-foreground">{portfolio.role.italic}</span>
          </p>
          <div className="hs flex items-center gap-5">
            <div className="hidden h-8 w-5 justify-center rounded-full border border-faint pt-1.5 md:flex">
              <span className="h-1.5 w-0.5 rounded bg-foreground" style={{ animation: "scrolldot 1.6s infinite" }} />
            </div>
            <Magnetic>
              <button onClick={() => scrollToId("contact")} className="ui-label rounded-full border border-faint px-4 py-2 hover:bg-foreground hover:text-background transition-colors">
                <Roll text="Contact" />
              </button>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- ABOUT ---------- */
export function About() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".w", { opacity: 0.15 }, {
        opacity: 1, stagger: 0.1, ease: "none",
        scrollTrigger: { trigger: ".stmt", start: "top 80%", end: "bottom 45%", scrub: true },
      });
      gsap.fromTo(".fade", { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.12, duration: 1, ease: "power3.out", scrollTrigger: { trigger: ".fade", start: "top 90%" } });
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <section id="about" ref={ref} className="relative mx-auto max-w-7xl px-5 py-32 md:px-8 md:py-48">
      <Label n="01" text="About" />
      <div className="grid gap-14 md:grid-cols-[1fr_320px] md:items-start">
        <p className="stmt text-3xl font-medium leading-[1.15] tracking-tight md:text-5xl">
          {portfolio.about.split(" ").map((w, i) => <span key={i} className="w">{w} </span>)}
        </p>
        <div className="fade">
          <div className="overflow-hidden rounded-lg border border-faint" data-cursor="HELLO">
            <img src={portfolio.photo} alt={portfolio.name} loading="lazy" width={768} height={1024} className="distort aspect-[3/4] w-full object-cover grayscale" />
          </div>
          <dl className="mt-6 space-y-3">
            {portfolio.aboutMeta.map((m) => (
              <div key={m.label} className="fade flex justify-between border-b border-faint pb-3">
                <dt className="ui-label text-muted-foreground">{m.label}</dt>
                <dd className="text-sm">{m.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

/* ---------- SKILLS ---------- */
function TagSphere() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const items = Array.from(ref.current!.children) as HTMLElement[];
    const n = items.length;
    const pts = items.map((_, i) => {
      const phi = Math.acos(-1 + (2 * i + 1) / n);
      const th = Math.sqrt(n * Math.PI) * phi;
      return [Math.cos(th) * Math.sin(phi), Math.sin(th) * Math.sin(phi), Math.cos(phi)] as [number, number, number];
    });
    let ax = 0.2, ay = 0.3, vx = 0.002, vy = 0.003, raf = 0;
    const R = () => Math.min(ref.current!.clientWidth, 520) / 2.3;
    const tick = () => {
      vx += (store.mouse.y * 0.012 - vx) * 0.05;
      vy += (store.mouse.x * 0.012 + 0.002 - vy) * 0.05;
      ax += vx; ay += vy;
      const r = R();
      const cx = Math.cos(ax), sx = Math.sin(ax), cy = Math.cos(ay), sy = Math.sin(ay);
      pts.forEach(([x, y, z], i) => {
        const y1 = y * cx - z * sx, z1 = y * sx + z * cx;
        const x2 = x * cy + z1 * sy, z2 = -x * sy + z1 * cy;
        const s = (z2 + 2) / 3;
        items[i]!.style.transform = `translate(-50%,-50%) translate3d(${x2 * r}px, ${y1 * r}px, 0) scale(${s})`;
        items[i]!.style.opacity = String(0.2 + 0.8 * ((z2 + 1) / 2));
        items[i]!.style.zIndex = String(Math.round(z2 * 100));
      });
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div ref={ref} className="relative mx-auto aspect-square w-full max-w-[560px]" data-cursor="SPIN">
      {portfolio.skills.map((s) => (
        <span key={s} className="absolute left-1/2 top-1/2 whitespace-nowrap rounded-full border border-faint bg-background/60 px-3 py-1.5 text-xs font-semibold tracking-wide backdrop-blur md:text-sm">{s}</span>
      ))}
    </div>
  );
}

function Marquee() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let x = 0, raf = 0;
    const tick = () => {
      const el = ref.current!;
      const speed = 0.6 + Math.min(Math.abs(store.velocity) * 0.15, 12);
      x -= speed * Math.sign(store.velocity || 1);
      const w = el.scrollWidth / 2;
      if (x <= -w) x += w;
      if (x > 0) x -= w;
      el.style.transform = `translate3d(${x}px,0,0) skewX(${Math.max(-12, Math.min(12, -store.velocity * 0.4))}deg)`;
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, []);
  const row = portfolio.skills.join(" — ") + " — ";
  return (
    <div className="overflow-hidden border-y border-faint py-6">
      <div ref={ref} className="flex w-max whitespace-nowrap">
        <span className="outline-text pr-8 text-[14vw] leading-none md:text-[9vw]">{row}</span>
        <span className="outline-text pr-8 text-[14vw] leading-none md:text-[9vw]">{row}</span>
      </div>
    </div>
  );
}

export function Skills() {
  return (
    <section id="skills" className="relative py-32 md:py-40">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Label n="02" text="Skills" />
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <SplitHeading text="TOOLKIT" className="text-[18vw] md:text-[9vw]" />
            <p className="mt-6 max-w-md text-muted-foreground">Move your cursor to steer the cloud. A stack chosen for speed, craft and scale — from pixels on the GPU to queries in the database.</p>
          </div>
          <TagSphere />
        </div>
      </div>
      <div className="mt-20"><Marquee /></div>
    </section>
  );
}

/* ---------- PROJECTS ---------- */
type Project = (typeof portfolio.projects)[number];

function CaseStudy({ p, i, onClose }: { p: Project; i: number; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    (window as any).__lenis?.stop();
    const q = gsap.utils.selector(ref);
    gsap.fromTo(ref.current, { clipPath: "inset(30% 20% 30% 20% round 12px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 1, ease: "expo.inOut" });
    gsap.fromTo(q(".cs"), { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, delay: 0.5, duration: 0.9, ease: "expo.out" });
    const esc = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", esc);
    return () => { window.removeEventListener("keydown", esc); (window as any).__lenis?.start(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const close = () => gsap.to(ref.current, { clipPath: "inset(50% 50% 50% 50% round 12px)", duration: 0.7, ease: "expo.in", onComplete: onClose });
  return (
    <div ref={ref} className="fixed inset-0 z-[70] overflow-y-auto bg-background" data-lenis-prevent>
      <img src={p.image} alt={p.title} className="h-[60vh] w-full object-cover" />
      <div className="mx-auto max-w-5xl px-5 py-16 md:px-8">
        <p className="cs ui-label text-muted-foreground">Case study {String(i + 1).padStart(2, "0")} · {p.year}</p>
        <h3 className="cs chrome-text mt-4 text-[14vw] md:text-[8vw]">{p.title.toUpperCase()}</h3>
        <p className="cs mt-8 max-w-2xl text-xl text-muted-foreground">{p.description}</p>
        <div className="cs mt-8 flex flex-wrap gap-2">{p.stack.map((s) => <span key={s} className="ui-label rounded-full border border-faint px-3 py-1.5">{s}</span>)}</div>
        <div className="cs mt-10 flex gap-6">
          <a href={p.live} target="_blank" rel="noreferrer" className="ui-label underline underline-offset-4">Live site ↗</a>
          <a href={p.github} target="_blank" rel="noreferrer" className="ui-label underline underline-offset-4">GitHub ↗</a>
        </div>
      </div>
      <button onClick={close} className="ui-label fixed right-6 top-6 rounded-full border border-faint bg-background px-4 py-2" data-cursor="CLOSE">Close ✕</button>
    </div>
  );
}

export function Projects() {
  const sec = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      const el = track.current!;
      gsap.to(el, {
        x: () => -(el.scrollWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: { trigger: sec.current, start: "top top", end: () => `+=${el.scrollWidth - window.innerWidth}`, pin: true, scrub: 1, invalidateOnRefresh: true },
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section id="projects" ref={sec} className="relative overflow-hidden py-24 md:flex md:h-screen md:items-center md:py-0">
      <div ref={track} className="flex flex-col gap-10 px-5 md:flex-row md:items-center md:gap-12 md:px-[8vw]">
        <div className="shrink-0 md:w-[32vw]">
          <Label n="03" text="Selected work" />
          <SplitHeading text="PROJECTS" className="text-[18vw] md:text-[8vw]" />
          <p className="mt-6 max-w-sm text-muted-foreground">Scroll to explore. Click any piece to open its case study.</p>
        </div>
        {portfolio.projects.map((p, i) => (
          <article key={p.title} onClick={() => { click(); setOpen(i); }} data-cursor="VIEW" className="group relative shrink-0 md:w-[48vw]">
            <div className="overflow-hidden rounded-lg border border-faint">
              <img src={p.image} alt={p.title} loading="lazy" width={1280} height={800} className="rgb-hover aspect-[16/10] w-full object-cover" />
            </div>
            <div className="mt-5 flex items-start justify-between gap-4">
              <div className="flex items-baseline gap-4">
                <span className="ui-label text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="font-display text-2xl tracking-tight md:text-4xl">{p.title}</h3>
              </div>
              <div className="flex gap-4" onClick={(e) => e.stopPropagation()}>
                <a href={p.live} target="_blank" rel="noreferrer" className="ui-label hover:text-foreground text-muted-foreground"><Roll text="Live" /></a>
                <a href={p.github} target="_blank" rel="noreferrer" className="ui-label hover:text-foreground text-muted-foreground"><Roll text="GitHub" /></a>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">{p.stack.map((s) => <span key={s} className="ui-label rounded-full border border-faint px-2.5 py-1 text-muted-foreground">{s}</span>)}</div>
          </article>
        ))}
        <div className="hidden w-[8vw] shrink-0 md:block" />
      </div>
      {open !== null && <CaseStudy p={portfolio.projects[open]!} i={open} onClose={() => setOpen(null)} />}
    </section>
  );
}

/* ---------- EXPERIENCE ---------- */
export function ExperienceSection() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".tl-line", { strokeDashoffset: 1000 }, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: ".tl", start: "top 70%", end: "bottom 60%", scrub: true } });
      gsap.utils.toArray<HTMLElement>(".tl-item").forEach((el) => {
        gsap.fromTo(el, { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 85%" } });
      });
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <section id="experience" ref={ref} className="relative mx-auto max-w-5xl px-5 py-32 md:px-8 md:py-48">
      <Label n="04" text="Experience" />
      <SplitHeading text="JOURNEY" className="text-[18vw] md:text-[9vw]" />
      <div className="tl relative mt-16 pl-10 md:pl-16">
        <svg className="absolute left-2 top-0 h-full w-2 md:left-5" preserveAspectRatio="none" viewBox="0 0 2 1000">
          <line x1="1" y1="0" x2="1" y2="1000" className="stroke-faint" strokeWidth="2" />
          <line x1="1" y1="0" x2="1" y2="1000" className="tl-line stroke-foreground" strokeWidth="2" strokeDasharray="1000" />
        </svg>
        {portfolio.experience.map((e) => (
          <div key={e.role} className="tl-item relative border-b border-faint py-10">
            <span className="absolute -left-[34px] top-12 h-2.5 w-2.5 rounded-full bg-foreground md:-left-[49px]" />
            <p className="ui-label text-muted-foreground">{e.period}</p>
            <h3 className="mt-3 font-display text-2xl tracking-tight md:text-4xl">{e.role}</h3>
            <p className="mt-1 italic text-muted-foreground">{e.company}</p>
            <p className="mt-4 max-w-xl text-muted-foreground">{e.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- CONTACT ---------- */
function Clock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const f = () => setT(new Date().toLocaleTimeString("en-IN", { timeZone: portfolio.timezone, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
    f();
    const id = setInterval(f, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums">{t} IST</span>;
}

export function Contact() {
  const [toast, setToast] = useState(false);
  const copy = async () => {
    click();
    try { await navigator.clipboard.writeText(portfolio.email); } catch { /* ignore */ }
    setToast(true);
    setTimeout(() => setToast(false), 2000);
  };
  return (
    <section id="contact" className="relative flex min-h-screen flex-col justify-between px-5 pt-32 md:px-8">
      <div className="spotlight pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative mx-auto w-full max-w-7xl">
        <Label n="05" text="Contact" />
        <Magnetic strength={0.15}><SplitHeading text="LET'S TALK" className="text-[19vw] md:text-[14vw]" /></Magnetic>
        <button onClick={copy} data-cursor="COPY" className="mt-10 block text-2xl font-medium tracking-tight underline decoration-faint underline-offset-8 transition-colors hover:decoration-foreground md:text-5xl">
          {portfolio.email}
        </button>
        <div className="mt-12 flex flex-wrap gap-3">
          {portfolio.socials.map((s) => (
            <Magnetic key={s.label}>
              <a href={s.href} target="_blank" rel="noreferrer" className="ui-label block rounded-full border border-faint px-6 py-4 transition-colors hover:bg-foreground hover:text-background">
                <Roll text={s.label} />
              </a>
            </Magnetic>
          ))}
        </div>
      </div>
      <footer className="relative mx-auto mt-24 flex w-full max-w-7xl flex-wrap justify-between gap-4 border-t border-faint py-6 ui-label text-muted-foreground">
        <span>Local time — <Clock /></span>
        <span>© 2026 {portfolio.name}</span>
      </footer>
      <div className={`fixed bottom-20 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-foreground px-5 py-3 ui-label text-background transition-all duration-500 ${toast ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
        Email copied to clipboard
      </div>
    </section>
  );
}
