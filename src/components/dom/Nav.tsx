import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { portfolio } from "@/data/portfolio";
import { Roll } from "./Magnetic";
import { click } from "@/lib/sound";

export function scrollToId(id: string) {
  const el = document.getElementById(id.toLowerCase());
  const lenis = (window as any).__lenis;
  if (el && lenis) lenis.scrollTo(el, { duration: 1.6 });
  else el?.scrollIntoView({ behavior: "smooth" });
}

export function Nav({ show }: { show: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isScrolled = false;
    const update = () => {
      const next = window.scrollY > window.innerHeight * 0.55;
      if (next !== isScrolled) {
        isScrolled = next;
        setScrolled(next);
      }
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    if (!open || !menu.current) return;
    gsap.fromTo(menu.current.querySelectorAll("li"), { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.06, duration: 0.8, ease: "expo.out" });
  }, [open]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1280px)");
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  const go = (id: string) => { click(); setOpen(false); scrollToId(id); };

  return (
    <>
      <header className={`race-nav fixed inset-x-0 top-0 z-50 grid grid-cols-[1fr_auto] items-center px-5 py-5 md:px-8 transition-opacity duration-1000 xl:grid-cols-[1fr_auto_1fr] ${show ? "opacity-100" : "opacity-0"}`}>
        <button
          onClick={() => go("home")}
          aria-hidden={scrolled}
          tabIndex={scrolled ? -1 : 0}
          className={`race-nav__brand ui-label font-extrabold transition-opacity duration-300 ${scrolled ? "pointer-events-none opacity-0" : "opacity-100"}`}
        >
          <Roll text={portfolio.name} />
        </button>
        <nav aria-label="Main navigation" className="race-nav__links hidden gap-4 xl:flex xl:gap-7">
          {portfolio.nav.map((n) => (
            <button key={n} onClick={() => go(n)} className="ui-label transition-colors"><Roll text={n} /></button>
          ))}
        </nav>
        <button onClick={() => setOpen((o) => !o)} className="race-nav__toggle ui-label flex xl:hidden" aria-expanded={open} aria-label={open ? "Close navigation" : "Open navigation"}>
          <span>{open ? "Close" : "Menu"}</span>
          <i aria-hidden="true" />
        </button>
      </header>
      {open && (
        <div ref={menu} className="fixed inset-0 z-40 flex flex-col justify-center bg-background px-5 sm:px-6 xl:hidden">
          <ul className="space-y-2">
            {portfolio.nav.map((n, i) => (
              <li key={n} className="overflow-hidden">
                <button onClick={() => go(n)} className="chrome-text flex max-w-full flex-wrap items-baseline gap-3 text-[clamp(2.25rem,12vw,3.75rem)]">
                  <span className="ui-label text-muted-foreground font-sans">0{i + 1}</span>{n}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
