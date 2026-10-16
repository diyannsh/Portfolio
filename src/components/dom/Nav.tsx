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
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !menu.current) return;
    gsap.fromTo(menu.current.querySelectorAll("li"), { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.06, duration: 0.8, ease: "expo.out" });
  }, [open]);

  const go = (id: string) => { click(); setOpen(false); scrollToId(id); };

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-5 md:px-8 transition-opacity duration-1000 ${show ? "opacity-100" : "opacity-0"}`}>
        <button onClick={() => go("home")} className="ui-label font-extrabold text-foreground"><Roll text={portfolio.name} /></button>
        <nav className="hidden gap-7 md:flex">
          {portfolio.nav.map((n) => (
            <button key={n} onClick={() => go(n)} className="ui-label text-muted-foreground hover:text-foreground transition-colors"><Roll text={n} /></button>
          ))}
        </nav>
        <button onClick={() => setOpen((o) => !o)} className="ui-label md:hidden text-foreground">{open ? "Close" : "Menu"}</button>
      </header>
      {open && (
        <div ref={menu} className="fixed inset-0 z-40 flex flex-col justify-center bg-background px-6 md:hidden">
          <ul className="space-y-2">
            {portfolio.nav.map((n, i) => (
              <li key={n} className="overflow-hidden">
                <button onClick={() => go(n)} className="chrome-text text-6xl flex items-baseline gap-3">
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
