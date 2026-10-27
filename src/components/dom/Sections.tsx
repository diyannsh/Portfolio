import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { portfolio } from "@/data/portfolio";
import { store } from "@/lib/store";
import { Magnetic, Roll } from "./Magnetic";
import { scrollToId } from "./Nav";
import { click } from "@/lib/sound";
import Lanyard from "./Lanyard";
import LiquidChrome from "./LiquidChrome";
import { ProjectCaseStudy, type ProjectLaunch } from "./ProjectTransition";

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

function RaceSeam({ carry }: { carry: "light" | "dark" }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const section = canvas?.parentElement;
    const context = canvas?.getContext("2d");
    if (!canvas || !section || !context) return;
    let progress = 0;

    const noise = (x: number, y: number) => {
      let hash = Math.imul(x, 374761393) + Math.imul(y, 668265263);
      hash = Math.imul(hash ^ (hash >>> 13), 1274126177);
      return ((hash ^ (hash >>> 16)) >>> 0) / 4294967295;
    };
    const draw = () => {
      const width = section.clientWidth;
      const height = Math.ceil(window.innerHeight * 0.34);
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const pixelWidth = Math.max(1, Math.round(width * ratio));
      const pixelHeight = Math.max(1, Math.round(height * ratio));
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);

      const cell = 24;
      const columns = Math.ceil(width / cell);
      const rows = Math.ceil(height / cell);
      const base = carry === "light" ? "#f7fafb" : "#090a0b";
      for (let y = 0; y < rows; y += 1) {
        const depth = y / Math.max(1, rows - 1) + progress * 2;
        if (depth > 1) break;
        const solid = depth <= 0.16;
        const fade = Math.max(0, Math.min(1, 1 - (depth - 0.16) / 0.84));
        if (!solid && fade <= 0) break;
        for (let x = 0; x < columns; x += 1) {
          if (!solid && ((x + y) % 2 !== 0 || noise(x, y) > fade)) continue;
          context.fillStyle = !solid && noise(x + 101, y + 57) < 0.06 ? "#02d2e3" : base;
          context.fillRect(x * cell, y * cell, cell, cell);
        }
      }
    };
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "top top",
      onUpdate: (self) => { progress = self.progress; draw(); },
    });
    const observer = new ResizeObserver(draw);
    observer.observe(section);
    window.addEventListener("resize", draw);
    draw();
    return () => {
      trigger.kill();
      observer.disconnect();
      window.removeEventListener("resize", draw);
    };
  }, [carry]);

  return <canvas ref={ref} className={`race-seam race-seam--${carry}`} aria-hidden="true" />;
}

/* ---------- HERO ---------- */
export function Hero({ show }: { show: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const trackPointer = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    event.currentTarget.style.setProperty("--hero-pointer-x", `${x * 100}%`);
    event.currentTarget.style.setProperty("--hero-pointer-y", `${y * 100}%`);
  };
  const resetPointer = (event: ReactPointerEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty("--hero-pointer-x", "50%");
    event.currentTarget.style.setProperty("--hero-pointer-y", "50%");
  };
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

  const featuredProject = portfolio.projects[0];
  const lastName = portfolio.name.split(" ").at(-1) ?? portfolio.name;
  return (
    <section
      id="home"
      ref={ref}
      onPointerMove={trackPointer}
      onPointerLeave={resetPointer}
      className="hero-section group relative min-h-[100svh] overflow-hidden"
    >
      <LiquidChrome
        color="#02d2e3"
        speed={0.16}
        amplitude={0.22}
        detail={3}
        thickness={0.8}
        interactive
        style={{ position: "absolute", inset: 0, zIndex: 0, opacity: 0.28 }}
      />
      <div className="hero-photo" aria-hidden="true">
        <img src={portfolio.photo} alt="" />
      </div>
      <div className="hero-copy">
        <div className="hero-masthead">
          <span className="hero-index">{portfolio.heroWord}</span>
          <span className="hero-masthead__rule" />
          <span className="hero-index">{portfolio.location}</span>
        </div>

        <div className="hero-core">
          <div className="hero-identity">
            <p className={`hero-kicker hs ${show ? "" : "invisible"}`}>{portfolio.name}</p>
            <h1 className={`htitle hero-name ${show ? "" : "invisible"}`}>
              {portfolio.firstName.split("").map((c, i) => (
                <span key={i} className="hw inline-block">{c}</span>
              ))}
              <span className="hero-name__last">
                {lastName.split("").map((c, i) => (
                  <span key={i} className="hw inline-block">{c}</span>
                ))}
              </span>
            </h1>
            <p className={`hs hero-role ${show ? "" : "invisible"}`}>
              <span>{portfolio.role.bold}</span> <em>{portfolio.role.italic}</em>
            </p>
            <div className={`hs hero-meta ${show ? "" : "invisible"}`}>
              {portfolio.aboutMeta.map((item) => (
                <p key={item.label}><span>{item.label}</span><b>{item.value}</b></p>
              ))}
            </div>
          </div>

          {featuredProject && (
            <aside className={`hs hero-feature ${show ? "" : "invisible"}`} aria-label="Featured project">
              <p className="hero-feature__eyebrow">Selected work · {featuredProject.year}</p>
              <div className="hero-feature__image"><img src={featuredProject.image} alt="" /></div>
              <h2>{featuredProject.title}</h2>
              <p>{featuredProject.description}</p>
              <div className="hero-feature__stack">
                {featuredProject.stack.map((item) => <span key={item}>{item}</span>)}
              </div>
            </aside>
          )}
        </div>

        <div className={`hero-actions hs ${show ? "" : "invisible"}`}>
          <p>Scroll to explore <span aria-hidden="true">↓</span></p>
          <Magnetic>
            <button onClick={() => scrollToId("contact")} className="race-button">
              <Roll text="Contact" /><span aria-hidden="true">↗</span>
            </button>
          </Magnetic>
          <div className="hero-socials">
            {portfolio.socials.map((social) => <a key={social.label} href={social.href} target="_blank" rel="noreferrer">{social.label}</a>)}
          </div>
        </div>
      </div>
      <div className="hero-bottom-type" aria-hidden="true">{portfolio.heroWord}</div>
    </section>
  );
}

/* ---------- ABOUT ---------- */
export function About() {
  const ref = useRef<HTMLElement>(null);
  const [lanyardSize, setLanyardSize] = useState(0.34);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    const updateSize = () => setLanyardSize(desktop.matches ? 0.58 : 0.34);
    updateSize();
    desktop.addEventListener("change", updateSize);
    return () => desktop.removeEventListener("change", updateSize);
  }, []);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".about-word", { opacity: 0.15 }, {
        opacity: 1,
        stagger: 0.1,
        ease: "none",
        scrollTrigger: { trigger: ".about-copy", start: "top 80%", end: "bottom 45%", scrub: true },
      });
      gsap.fromTo(".about-meta", { y: 40, opacity: 0 }, {
        y: 0,
        opacity: 1,
        stagger: 0.12,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".about-meta", start: "top 90%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={ref} className="race-paddock relative h-[100svh] min-h-[38rem] w-full overflow-hidden">
      <Lanyard
        frontImage={portfolio.photo}
        size={lanyardSize}
        anchor="right"
        intro={false}
        style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}
      />
      <div className="relative z-10 flex h-full items-center px-5 py-24 md:px-8">
        <div className="w-[52%] max-w-2xl sm:w-[58%] md:w-1/2">
          <Label n="01" text="About" />
          <p className="about-copy text-[clamp(1.25rem,4vw,3rem)] font-medium leading-[1.15] tracking-tight">
            {portfolio.about.split(" ").map((word, i) => (
              <span key={i} className="about-word">{word} </span>
            ))}
          </p>
          <dl className="about-meta mt-8 max-w-md space-y-3">
            {portfolio.aboutMeta.map((item) => (
              <div key={item.label} className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-b border-faint pb-3">
                <dt className="ui-label text-muted-foreground">{item.label}</dt>
                <dd className="text-sm">{item.value}</dd>
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
    <div ref={ref} className="tag-sphere relative mx-auto aspect-square w-full max-w-[560px]">
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
    <section id="skills" className="race-season relative">
      <RaceSeam carry="light" />
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Label n="02" text="Skills" />
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <SplitHeading text="TOOLKIT" className="text-[clamp(3rem,18vw,9rem)]" />
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
export function Projects() {
  const sec = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const openingRef = useRef(false);
  const [launch, setLaunch] = useState<ProjectLaunch | null>(null);

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

  const openProject = (index: number, sourceCard: HTMLElement) => {
    if (launch || openingRef.current) return;
    const media = sourceCard.firstElementChild;
    const section = sec.current;
    if (!(media instanceof HTMLDivElement) || !section) return;
    openingRef.current = true;
    click();
    const token = `project-${index}-${Date.now()}`;
    const scroll = (window as any).__lenis?.scroll ?? window.scrollY;
    history.pushState({ ...history.state, portfolioProjectTransition: token }, "", location.href);
    setLaunch({ index, button: sourceCard, media, section, scroll, token });
  };

  return (
    <section id="projects" ref={sec} className="race-projects relative overflow-hidden py-24 md:flex md:h-screen md:items-center md:py-0">
      <RaceSeam carry="dark" />
      <div ref={track} className="projects-track flex flex-col gap-10 px-5 md:flex-row md:items-center md:gap-12 md:px-[8vw]">
        <div className="shrink-0 md:w-[32vw]">
          <Label n="03" text="Selected work" />
          <SplitHeading text="PROJECTS" className="text-[clamp(3rem,18vw,8rem)]" />
          <p className="mt-6 max-w-sm text-muted-foreground">Scroll to explore. Click any piece to open its case study.</p>
        </div>
        {portfolio.projects.map((p, i) => (
          <article key={p.title} tabIndex={0} role="button" aria-label={`Open ${p.title} case study`} onKeyDown={(event) => { if (event.target === event.currentTarget && ["Enter", " "].includes(event.key)) { event.preventDefault(); openProject(i, event.currentTarget); } }} onClick={(event) => openProject(i, event.currentTarget)} className="group relative shrink-0 md:w-[48vw]">
            <div className="overflow-hidden rounded-lg border border-faint">
              <img src={p.image} alt={p.title} loading="lazy" width={1280} height={800} className="rgb-hover aspect-[16/10] w-full object-cover" />
            </div>
            <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
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
      {launch && <ProjectCaseStudy launch={launch} onClose={() => { openingRef.current = false; setLaunch(null); }} />}
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
    <section id="experience" ref={ref} className="race-timeline relative px-5 py-32 md:px-8 md:py-48">
      <RaceSeam carry="light" />
      <div className="mx-auto max-w-5xl">
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
    <section id="contact" className="race-footer relative isolate flex min-h-screen flex-col justify-between overflow-hidden px-5 pt-32 md:px-8">
      <div className="spotlight pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative mx-auto w-full max-w-7xl">
        <Label n="05" text="Contact" />
        <Magnetic strength={0.15}><SplitHeading text="LET'S TALK" className="text-[clamp(2.5rem,19vw,14rem)]" /></Magnetic>
        <button onClick={copy} className="race-email mt-10 block max-w-full break-all text-[clamp(1rem,4vw,3rem)] font-medium tracking-tight underline decoration-faint underline-offset-8 transition-colors hover:decoration-foreground">
          {portfolio.email}
        </button>
        <div className="mt-12 flex flex-wrap gap-3">
          {portfolio.socials.map((s) => (
            <Magnetic key={s.label}>
              <a href={s.href} target="_blank" rel="noreferrer" className="race-social ui-label block rounded-full border border-faint px-6 py-4 transition-colors">
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
      <div className={`race-toast fixed bottom-20 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-foreground px-5 py-3 ui-label text-background transition-all duration-500 ${toast ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
        Email copied to clipboard
      </div>
    </section>
  );
}
