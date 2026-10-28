import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Award,
  Grid2X2,
  List,
  X,
} from "lucide-react";
import { certificates, type Certificate } from "@/data/certificates";
import { useCollectionOverlay, type CollectionLaunch } from "./useCollectionOverlay";
import "./Certificates.css";

const previewEntries: Certificate[] = [
  {
    id: "preview-1",
    title: "A space for milestones.",
    issuer: "Certificate collection",
    date: "Coming soon",
    category: "Preview",
  },
  {
    id: "preview-2",
    title: "Always learning.",
    issuer: "Certificate collection",
    date: "Coming soon",
    category: "Preview",
  },
  {
    id: "preview-3",
    title: "More to explore.",
    issuer: "Certificate collection",
    date: "Coming soon",
    category: "Preview",
  },
];

function CertificateArtwork({
  certificate,
  preview = false,
}: {
  certificate: Certificate;
  preview?: boolean;
}) {
  return certificate.image ? (
    <img
      src={certificate.image}
      alt={`${certificate.title} — ${certificate.issuer}`}
      loading="lazy"
      decoding="async"
    />
  ) : (
    <div className="certificate-placeholder">
      <span className="ui-label">{preview ? "Collection preview" : certificate.issuer}</span>
      <Award size={52} strokeWidth={1} aria-hidden="true" />
      <p>{certificate.title}</p>
      <span className="ui-label">{preview ? "Certificates coming soon" : certificate.date}</span>
    </div>
  );
}

export function Certificates() {
  const [launch, setLaunch] = useState<CollectionLaunch | null>(null);
  const guard = useRef(false);
  const featured = useMemo(() => {
    const pinned = certificates.filter((item) => item.pinned);
    return (pinned.length ? pinned : certificates).slice(0, 2);
  }, []);
  const open = (opener: HTMLElement) => {
    if (guard.current) return;
    guard.current = true;
    const token = `certificates-${Date.now()}`;
    const scroll = window.scrollY;
    history.pushState({ ...history.state, certificateCollection: token }, "", location.href);
    setLaunch({ token, scroll, opener });
  };
  return (
    <section id="certificates" className="certificates-section">
      <div className="certificates-intro">
        <p className="ui-label">
          <span>04</span> — Learning & milestones
        </p>
        <h2 className="chrome-text">CERTIFICATES</h2>
        <p>A growing collection of the courses, challenges and experiences behind the work.</p>
        <button
          type="button"
          className="certificates-open"
          onClick={(event) => open(event.currentTarget)}
        >
          <span>Explore the collection</span>
          <span className="ui-label">{String(certificates.length).padStart(2, "0")}</span>
          <ArrowUpRight size={20} aria-hidden="true" />
        </button>
      </div>
      <div className="certificates-pinned">
        {(featured.length ? featured : previewEntries.slice(0, 2)).map((item, index) => (
          <button
            type="button"
            className="certificate-pinned"
            key={item.id}
            style={{ "--certificate-ratio": item.aspectRatio ?? 1.414 } as CSSProperties}
            onClick={(event) => open(event.currentTarget)}
            aria-label={
              featured.length
                ? `Explore certificates, including ${item.title}`
                : "Preview the certificate collection"
            }
          >
            <div className="certificate-pinned-art">
              <CertificateArtwork certificate={item} preview={!featured.length} />
            </div>
            <div className="certificate-pinned-caption">
              <span className="ui-label">
                {featured.length ? "Pinned" : "Coming soon"} / 0{index + 1}
              </span>
              <ArrowUpRight size={17} aria-hidden="true" />
            </div>
            {featured.length > 0 && (
              <>
                <h3>{item.title}</h3>
                <p>
                  {item.issuer} · {item.date}
                </p>
              </>
            )}
          </button>
        ))}
      </div>
      {launch && (
        <CertificateCollection
          launch={launch}
          onClose={() => {
            guard.current = false;
            setLaunch(null);
          }}
        />
      )}
    </section>
  );
}

export function CertificateCollection({
  launch,
  onClose,
  items = certificates,
}: {
  launch: CollectionLaunch;
  onClose: () => void;
  items?: Certificate[];
}) {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const cards = useRef(new Map<string, HTMLElement>());
  const drawRef = useRef(() => {});
  const moveToRef = useRef((_index: number) => {});
  const [mode, setMode] = useState<"gallery" | "list">("gallery");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [active, setActive] = useState(0);
  const preview = items.length === 0;
  const entries = useMemo(
    () =>
      preview
        ? previewEntries
        : [...items]
            .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)))
            .filter(
              (item) =>
                (category === "All" || item.category === category) &&
                `${item.title} ${item.issuer} ${item.category}`
                  .toLowerCase()
                  .includes(query.toLowerCase().trim()),
            ),
    [items, category, query, preview],
  );
  const categories = useMemo(
    () => ["All", ...new Set(items.map((item) => item.category))],
    [items],
  );
  const overlay = useCollectionOverlay(root, launch, onClose);
  const current = entries[Math.min(active, Math.max(0, entries.length - 1))];

  useLayoutEffect(() => {
    const scroller = root.current!;
    scroller.scrollTop = 0;
    setActive(0);
    if (mode !== "gallery" || !stage.current || !entries.length) return;
    const viewport = stage.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = preference.matches;
    let progress = 0,
      destination = 0,
      frame = 0,
      last = 0;
    let width = viewport.clientWidth,
      height = viewport.clientHeight;
    let step = Math.max(1, height * 0.85);
    let lastActive = 0;
    const draw = () => {
      cards.current.forEach((card, id) => {
        const index = entries.findIndex((item) => item.id === id);
        if (index < 0) return;
        // Earlier certificates sit at the upper-left; later ones follow below-right.
        const distance = progress - index;
        const depth = Math.abs(distance);
        const x = reduced ? 0 : -Math.sin(distance * 0.95) * width * (width < 768 ? 0.75 : 0.38);
        const y = reduced ? -distance * height * 0.85 : -distance * Math.min(150, height * 0.18);
        const z = reduced ? 0 : -depth * 330;
        card.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px) rotateY(${reduced ? 0 : distance * 30}deg) rotateZ(${reduced ? 0 : distance * 3}deg)`;
        card.style.opacity = String(Math.max(0, 1 - depth * (reduced ? 1 : 0.28)));
        card.style.visibility = depth > 2.8 ? "hidden" : "visible";
        card.style.zIndex = String(100 - Math.round(depth * 10));
        card.style.pointerEvents = depth < 0.5 ? "auto" : "none";
      });
      viewport.style.setProperty("--collection-progress", String(progress));
      const nextActive = Math.max(0, Math.min(entries.length - 1, Math.round(progress)));
      if (nextActive !== lastActive) {
        lastActive = nextActive;
        setActive(nextActive);
      }
    };
    drawRef.current = draw;
    const tick = (now: number) => {
      frame = 0;
      const delta = Math.min(50, now - last || 16);
      last = now;
      progress = reduced
        ? destination
        : progress + (destination - progress) * (1 - Math.exp(-delta / 85));
      if (Math.abs(destination - progress) < 0.001) progress = destination;
      draw();
      if (progress !== destination) frame = requestAnimationFrame(tick);
    };
    const scroll = () => {
      destination = Math.max(0, Math.min(entries.length - 1 + 0.3, scroller.scrollTop / step));
      if (!frame) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };
    moveToRef.current = (index) =>
      scroller.scrollTo({
        top: Math.max(0, Math.min(entries.length - 1, index)) * step,
        behavior: reduced ? "instant" : "smooth",
      });
    const resize = new ResizeObserver(() => {
      width = viewport.clientWidth;
      height = viewport.clientHeight;
      step = Math.max(1, height * 0.85);
      scroller.scrollTop = destination * step;
      draw();
    });
    const changePreference = () => {
      reduced = preference.matches;
      scroll();
    };
    resize.observe(viewport);
    scroller.addEventListener("scroll", scroll, { passive: true });
    preference.addEventListener("change", changePreference);
    draw();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      scroller.removeEventListener("scroll", scroll);
      preference.removeEventListener("change", changePreference);
      drawRef.current = () => {};
      moveToRef.current = () => {};
    };
  }, [entries, mode]);

  useLayoutEffect(() => {
    drawRef.current();
  }, [active, entries, mode]);
  const firstVisible = Math.max(0, active - 3);
  const visible = entries.slice(firstVisible, active + 4);
  const fileLink = (item: Certificate) => item.file || item.image;
  return createPortal(
    <div
      ref={root}
      className={`certificate-collection ${overlay.closing ? "is-closing" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Certificate collection"
      tabIndex={-1}
      data-lenis-prevent
      onKeyDown={overlay.keydown}
      onWheel={(event) => event.stopPropagation()}
      onTouchMove={(event) => event.stopPropagation()}
    >
      <header className="collection-header">
        <div>
          <span className="ui-label">
            Learning archive / {preview ? "Preview" : String(items.length).padStart(2, "0")}
          </span>
          <h2>
            Certificates<span>.</span>
          </h2>
        </div>
        <div className="collection-header-actions">
          <div className="collection-modes" role="group" aria-label="Collection view">
            <button
              type="button"
              aria-pressed={mode === "gallery"}
              onClick={() => setMode("gallery")}
              aria-label="Gallery view"
            >
              <Grid2X2 size={16} />
              <span>Gallery</span>
            </button>
            <button
              type="button"
              aria-pressed={mode === "list"}
              onClick={() => setMode("list")}
              aria-label="List view"
            >
              <List size={16} />
              <span>List</span>
            </button>
          </div>
          <button type="button" onClick={overlay.close} className="collection-close">
            Close <X size={16} />
          </button>
        </div>
      </header>
      {!preview && (
        <div className="collection-filters">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search certificates"
            placeholder="Search certificates"
          />
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Certificate category"
          >
            {categories.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
          <span className="ui-label">{entries.length} found</span>
        </div>
      )}
      {entries.length === 0 ? (
        <div className="collection-empty">
          <Award size={48} strokeWidth={1} />
          <h3>No matching certificates.</h3>
          <p>Try another title, issuer or category.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("All");
            }}
          >
            Clear filters
          </button>
        </div>
      ) : mode === "gallery" ? (
        <div
          className="collection-runway"
          style={{ height: `${100 + (Math.max(0, entries.length - 1) + 0.3) * 85}dvh` }}
        >
          <div className="collection-stage" ref={stage}>
            <div className="collection-atmosphere" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            <div className="collection-spatial-cards" aria-label="Certificates in the collection">
              {visible.map((item, offset) => {
                const index = firstVisible + offset;
                return (
                  <article
                    key={item.id}
                    ref={(element) => {
                      if (element) cards.current.set(item.id, element);
                      else cards.current.delete(item.id);
                    }}
                    className="collection-float-card"
                    style={{ "--certificate-ratio": item.aspectRatio ?? 1.414 } as CSSProperties}
                    aria-hidden={index !== active}
                  >
                    <CertificateArtwork certificate={item} preview={preview} />
                    <div className="collection-card-caption">
                      <span className="ui-label">{preview ? "Preview" : item.issuer}</span>
                      <span className="ui-label">{item.date}</span>
                    </div>
                  </article>
                );
              })}
            </div>
            {current && (
              <aside className="collection-context" aria-live="polite" aria-atomic="true">
                <p className="ui-label">
                  {String(active + 1).padStart(2, "0")} / {String(entries.length).padStart(2, "0")}
                  {current.pinned ? " · Pinned" : ""}
                </p>
                <span className="collection-category ui-label">{current.category}</span>
                <h3>{current.title}</h3>
                <p>
                  {preview
                    ? "This is a preview of the collection. Certificates will appear here once added."
                    : `${current.issuer} · ${current.date}`}
                </p>
                {current.description && (
                  <p className="collection-description">{current.description}</p>
                )}
                {!preview && (
                  <div className="collection-links">
                    {fileLink(current) && (
                      <a href={fileLink(current)} target="_blank" rel="noreferrer">
                        View certificate <ArrowUpRight size={15} />
                      </a>
                    )}
                    {current.verificationUrl && (
                      <a href={current.verificationUrl} target="_blank" rel="noreferrer">
                        Verify credential <ArrowUpRight size={15} />
                      </a>
                    )}
                  </div>
                )}
              </aside>
            )}
            <footer className="collection-controls">
              <span className="ui-label">
                <ArrowDown size={14} /> Scroll to explore
              </span>
              <div>
                <button
                  type="button"
                  aria-label="Previous certificate"
                  disabled={active === 0}
                  onClick={() => moveToRef.current(active - 1)}
                >
                  <ArrowLeft size={19} />
                </button>
                <button
                  type="button"
                  aria-label="Next certificate"
                  disabled={active === entries.length - 1}
                  onClick={() => moveToRef.current(active + 1)}
                >
                  <ArrowRight size={19} />
                </button>
              </div>
            </footer>
          </div>
        </div>
      ) : (
        <div className="collection-list">
          {preview && (
            <p className="collection-preview-note">
              Collection preview — your certificates will appear here once added.
            </p>
          )}
          {entries.map((item) => (
            <article className="collection-list-card" key={item.id}>
              <CertificateArtwork certificate={item} preview={preview} />
              <div>
                <p className="ui-label">
                  {item.category}
                  {item.pinned ? " · Pinned" : ""}
                </p>
                <h3>{item.title}</h3>
                <p>
                  {item.issuer} · {item.date}
                </p>
                <div className="collection-links">
                  {fileLink(item) && (
                    <a href={fileLink(item)} target="_blank" rel="noreferrer">
                      View certificate <ArrowUpRight size={15} />
                    </a>
                  )}
                  {item.verificationUrl && (
                    <a href={item.verificationUrl} target="_blank" rel="noreferrer">
                      Verify <ArrowUpRight size={15} />
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>,
    document.body,
  );
}
