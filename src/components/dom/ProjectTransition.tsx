import { useLayoutEffect, useRef, useState, type KeyboardEvent, type Ref } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { portfolio } from "@/data/portfolio";

gsap.registerPlugin(ScrollTrigger);
type Project = (typeof portfolio.projects)[number];
export type ProjectLaunch = { index: number; button: HTMLElement; media: HTMLDivElement; section: HTMLElement; scroll: number; token: string; imageAppearance: { filter: string; transform: string } };

// Expand the clicked image directly to the case-study hero, then hand it over
// at identical bounds and colour so there is no overshoot or shrinking swap.
const MOTION = {
  expand: 0.65,
  handover: 0.12,
  metadataAt: 0.55,
  metadata: 0.25,
  stagger: 0.055,
} as const;

function Artwork({ project, imageRef }: { project: Project; imageRef?: Ref<HTMLImageElement> }) {
  return <img ref={imageRef} src={project.image} alt={project.title} width={1280} height={800} decoding="async" />;
}

function ProjectBody({ project: p }: { project: Project }) {
  return <div className="project-case-body">
    <section>
      <p className="ui-label text-muted-foreground">Architecture</p>
      <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">{p.details.architecture}</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">{p.details.components.map((item, index) => <article key={item.title} className="rounded-md border border-faint p-5 md:p-7">
        <p className="ui-label">{String(index + 1).padStart(2, "0")} / {item.title}</p>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">{item.text}</p>
      </article>)}</div>
    </section>
    <section>
      <p className="ui-label text-muted-foreground">How it works</p>
      <ol className="mt-8 grid gap-4 md:grid-cols-2">{p.details.workflow.map((step, index) => <li key={step} className="flex gap-5 rounded-md border border-faint p-5 md:p-7">
        <span className="ui-label text-muted-foreground">{String(index + 1).padStart(2, "0")}</span><p className="text-sm leading-relaxed text-muted-foreground md:text-base">{step}</p>
      </li>)}</ol>
    </section>
    <section>
      <p className="ui-label text-muted-foreground">Technology stack</p>
      <div className="mt-8 grid gap-8 md:grid-cols-2">{p.details.technology.map((group) => <div key={group.category}>
        <p className="ui-label text-muted-foreground">{group.category}</p>
        <div className="mt-4 flex flex-wrap gap-2">{group.items.map((item) => <span key={item} className="ui-label rounded-full border border-faint px-3 py-2">{item}</span>)}</div>
      </div>)}</div>
    </section>
  </div>;
}

export function ProjectCaseStudy({ launch, onClose }: { launch: ProjectLaunch; onClose: () => void }) {
  const project = portfolio.projects[launch.index]!;
  const rootRef = useRef<HTMLDivElement>(null);
  const environmentRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const flightRef = useRef<HTMLDivElement>(null);
  const flightImageRef = useRef<HTMLImageElement>(null);
  const metadataRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const requestedRef = useRef(false);
  const requestCloseRef = useRef<() => void>(() => {});
  const onCloseRef = useRef(onClose);
  const [phase, setPhase] = useState<"opening" | "open" | "closing">("opening");
  onCloseRef.current = onClose;

  useLayoutEffect(() => {
    const root = rootRef.current!;
    const media = mediaRef.current!;
    const flight = flightRef.current!;
    const environment = environmentRef.current!;
    const metadata = metadataRef.current!;
    const metadataItems = Array.from(metadata.children);
    const copy = copyRef.current!;
    const close = closeRef.current!;
    const html = document.documentElement;
    const body = document.body;
    const lenis = (window as any).__lenis;
    const wasStopped = lenis?.isStopped;
    const sourceImage = launch.media.querySelector("img");
    const sourceStyles = sourceImage ? { filter: sourceImage.style.filter, transform: sourceImage.style.transform, transition: sourceImage.style.transition } : null;
    // Keep the clicked frame visible while the portal images decode, even after hover leaves.
    if (sourceImage) {
      sourceImage.style.transition = "none";
      sourceImage.style.filter = launch.imageAppearance.filter;
      sourceImage.style.transform = launch.imageAppearance.transform;
    }
    const saved = { htmlOverflow: html.style.overflow, bodyOverflow: body.style.overflow, padding: body.style.paddingRight, mediaOpacity: launch.media.style.opacity };
    const scrollbar = window.innerWidth - html.clientWidth;
    const padding = parseFloat(getComputedStyle(body).paddingRight) || 0;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scrub = ScrollTrigger.getAll().find((trigger) => trigger.trigger === launch.section)?.getTween();
    const wasPaused = scrub?.paused();
    scrub?.pause();
    lenis?.stop();
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (scrollbar) body.style.paddingRight = `${padding + scrollbar}px`;
    const siblings = Array.from(body.children).filter((element): element is HTMLElement => element instanceof HTMLElement && element !== root && !["SCRIPT", "STYLE", "LINK"].includes(element.tagName)).map((element) => ({ element, inert: element.inert }));
    siblings.forEach(({ element }) => { element.inert = true; });
    root.focus({ preventScroll: true });

    let disposed = false;
    let started = false;
    let closing = false;
    let closeFade: gsap.core.Tween | null = null;
    let source = launch.media.getBoundingClientRect();
    let target = media.getBoundingClientRect();
    // This snapshot was taken in the click handler, while hover was still active.
    gsap.set(flightImageRef.current, { ...launch.imageAppearance, transformOrigin: "50% 50%" });
    const imageScale = Number(gsap.getProperty(flightImageRef.current, "scaleX")) || 1;
    gsap.set([environment, media, ...metadataItems, copy, close, flight], { autoAlpha: 0 });
    const placeFlight = () => {
      gsap.set(flight, { left: source.left, top: source.top, width: source.width, height: source.height, x: 0, y: 0, scale: 1, transformOrigin: "50% 50%" });
    };
    placeFlight();
    const timeline = gsap.timeline({ paused: true, onComplete: () => setPhase("open"), onReverseComplete: () => onCloseRef.current() });
    if (reduced) {
      timeline.fromTo(environment, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1, immediateRender: false }, 0);
      timeline.fromTo([media, ...metadataItems, copy, close], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.12, immediateRender: false }, 0.02);
      timeline.fromTo(flight, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.1, immediateRender: false }, 0);
    } else {
      timeline.fromTo(flight, {
        left: () => source.left, top: () => source.top, width: () => source.width, height: () => source.height,
      }, {
        left: () => target.left, top: () => target.top, width: () => target.width, height: () => target.height,
        borderRadius: 0, borderWidth: 0,
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 100% 100%, 0 100%)",
        duration: MOTION.expand, ease: "power3.inOut", immediateRender: false,
      }, 0);
      timeline.fromTo(flightImageRef.current, { scale: imageScale, filter: launch.imageAppearance.filter }, { scale: 1, filter: "none", duration: MOTION.expand, ease: "power3.inOut", immediateRender: false }, 0);
      timeline.fromTo(environment, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: "power2.inOut", immediateRender: false }, 0);
      timeline.set(media, { autoAlpha: 1 }, MOTION.expand);
      timeline.fromTo(flight, { autoAlpha: 1 }, { autoAlpha: 0, duration: MOTION.handover, ease: "none", immediateRender: false }, MOTION.expand);
      timeline.fromTo(metadataItems, { y: 4, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: MOTION.metadata, stagger: MOTION.stagger, ease: "power2.out", immediateRender: false }, MOTION.metadataAt);
      timeline.fromTo(copy, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, immediateRender: false }, 0.52);
      timeline.fromTo(close, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, immediateRender: false }, 0.34);
    }

    const playReverse = () => {
      if (closing) return;
      closing = true;
      requestedRef.current = true;
      setPhase("closing");
      if (!started || timeline.time() === 0) { onCloseRef.current(); return; }
      if (root.scrollTop > 2) {
        // Reading further down never forces a jump back to the intro.
        timeline.pause();
        closeFade = gsap.to(root, { opacity: 0, duration: reduced ? 0.12 : 0.4, ease: "power2.inOut", onComplete: () => onCloseRef.current() });
      } else {
        timeline.reverse();
      }
    };
    requestCloseRef.current = () => {
      if (requestedRef.current) return;
      requestedRef.current = true;
      if (history.state?.portfolioProjectTransition === launch.token) history.back();
      else playReverse();
    };
    const resize = () => {
      ScrollTrigger.refresh();
      source = launch.media.getBoundingClientRect();
      const bounds = media.getBoundingClientRect();
      target = new DOMRect(bounds.left, bounds.top + root.scrollTop, bounds.width, bounds.height);
      // Function-valued endpoints are re-evaluated at the same visual progress.
      const time = timeline.time();
      const reversed = timeline.reversed();
      placeFlight();
      timeline.invalidate().time(time).reversed(reversed);
    };
    window.addEventListener("popstate", playReverse);
    window.addEventListener("resize", resize);
    const decode = (image: HTMLImageElement) => image.decode?.().catch(() => undefined) ?? Promise.resolve();
    void Promise.all([decode(imageRef.current!), decode(flightImageRef.current!)]).then(() => {
      if (disposed || requestedRef.current) return;
      gsap.set(flight, { autoAlpha: 1 });
      launch.media.style.opacity = "0";
      started = true;
      timeline.play();
    });

    return () => {
      disposed = true;
      timeline.kill();
      closeFade?.kill();
      window.removeEventListener("popstate", playReverse);
      window.removeEventListener("resize", resize);
      requestCloseRef.current = () => {};
      if (sourceImage && sourceStyles) Object.assign(sourceImage.style, sourceStyles);
      launch.media.style.opacity = saved.mediaOpacity;
      html.style.overflow = saved.htmlOverflow;
      body.style.overflow = saved.bodyOverflow;
      body.style.paddingRight = saved.padding;
      siblings.forEach(({ element, inert }) => { element.inert = inert; });
      window.scrollTo(0, launch.scroll);
      lenis?.scrollTo(launch.scroll, { immediate: true, force: true });
      ScrollTrigger.refresh();
      if (scrub && !wasPaused) scrub.resume();
      if (!wasStopped) lenis?.start();
      if (launch.button.isConnected) launch.button.focus({ preventScroll: true });
    };
  }, [launch]);

  const keydown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); requestCloseRef.current(); }
    else if ([" ", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"].includes(event.key)) {
      if (phase !== "open" || requestedRef.current) event.preventDefault();
      event.stopPropagation();
    } else if (event.key === "Tab") {
      const items = Array.from(rootRef.current!.querySelectorAll<HTMLElement>("a[href], button")).filter((element) => getComputedStyle(element).visibility !== "hidden" && element.getClientRects().length);
      const first = items[0], last = items[items.length - 1];
      if (!first) event.preventDefault();
      else if (event.shiftKey && [first, rootRef.current].includes(document.activeElement as HTMLElement)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  };

  return createPortal(<div ref={rootRef} className={`race-project-overlay project-case ${phase === "open" ? "overflow-y-auto" : "overflow-hidden"}`} tabIndex={-1} role="dialog" aria-modal="true" aria-label={`${project.title} case study`} data-phase={phase} data-lenis-prevent onKeyDown={keydown} onWheel={(event) => { event.stopPropagation(); }} onTouchMove={(event) => { event.stopPropagation(); }}>
    <div ref={environmentRef} className="project-case-backdrop" />
    <div className="relative">
      <div ref={mediaRef} className="project-case-media"><Artwork project={project} imageRef={imageRef} /></div>
      <div className="mx-auto max-w-5xl px-5 py-16 md:px-8">
        <div ref={metadataRef}>
          <p className="ui-label text-muted-foreground">Case study {String(launch.index + 1).padStart(2, "0")} &middot; {project.year}</p>
          <h2 className="chrome-text mt-4 text-[clamp(3rem,14vw,8rem)]">{project.title.toUpperCase()}</h2>
          <p className="mt-8 max-w-2xl text-xl text-muted-foreground">{project.description}</p>
          <div className="mt-8 flex flex-wrap gap-2">{project.stack.map((item) => <span key={item} className="ui-label rounded-full border border-faint px-3 py-1.5">{item}</span>)}</div>
          <div className="mt-10 flex gap-6"><a href={project.live} target="_blank" rel="noreferrer" className="ui-label underline underline-offset-4">Live site &#8599;</a><a href={project.github} target="_blank" rel="noreferrer" className="ui-label underline underline-offset-4">GitHub &#8599;</a></div>
        </div>
        <div ref={copyRef} className="relative"><ProjectBody project={project} /></div>
      </div>
    </div>
    <div ref={flightRef} className="project-transition-image" aria-hidden="true"><Artwork project={project} imageRef={flightImageRef} /></div>
    <button ref={closeRef} className="project-case-close ui-label" onClick={() => requestCloseRef.current()}>Close &#10005;</button>
  </div>, document.body);
}
