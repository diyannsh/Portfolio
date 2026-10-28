import { useEffect, useRef, useState, type PointerEvent } from "react";
import { RotateCcw } from "lucide-react";
import { Euler, Quaternion, Vector3 } from "three";
import { portfolio } from "@/data/portfolio";
import "./ToolkitSpace.css";

const groups = ["All", "Interface", "Motion", "Backend", "Workflow"] as const;
type Group = (typeof groups)[number];
const tools: Record<string, { group: Group; description: string }> = {
  React: {
    group: "Interface",
    description: "Composable interfaces, from a single interaction to a complete application.",
  },
  "Next.js": {
    group: "Interface",
    description: "React applications with routing, server rendering and full-stack capabilities.",
  },
  TypeScript: {
    group: "Interface",
    description: "Typed JavaScript for clearer contracts and more dependable applications.",
  },
  Tailwind: {
    group: "Interface",
    description: "Responsive interfaces built with small, consistent styling utilities.",
  },
  "Three.js": {
    group: "Motion",
    description: "Interactive 3D scenes, materials and lighting in the browser.",
  },
  WebGL: {
    group: "Motion",
    description: "GPU-powered graphics and shaders for real-time visual experiences.",
  },
  GSAP: {
    group: "Motion",
    description: "Precisely timed animation, transitions and scroll-driven storytelling.",
  },
  "Framer Motion": {
    group: "Motion",
    description: "Gesture, layout and interface animation for React.",
  },
  "Node.js": {
    group: "Backend",
    description: "JavaScript on the server for APIs and application services.",
  },
  PostgreSQL: {
    group: "Backend",
    description: "Relational data, structured queries and reliable persistence.",
  },
  GraphQL: {
    group: "Backend",
    description: "Typed APIs that let an interface request the data it needs.",
  },
  Python: {
    group: "Backend",
    description: "Data processing, automation and services behind intelligent features.",
  },
  Redis: {
    group: "Backend",
    description: "Fast in-memory data for caching and application state.",
  },
  Prisma: {
    group: "Backend",
    description: "Typed database access and migrations for application data.",
  },
  Docker: {
    group: "Workflow",
    description: "Consistent containers for running and shipping applications.",
  },
  AWS: {
    group: "Workflow",
    description: "Cloud infrastructure and storage for deployed applications.",
  },
  Figma: {
    group: "Workflow",
    description: "Exploring interfaces, visual systems and interactive prototypes.",
  },
  Git: {
    group: "Workflow",
    description: "Version control to track changes and collaborate on code.",
  },
};

// A perspective-projected scene keeps the labels as accessible native buttons.
const initialOrientation = () => new Quaternion().setFromEuler(new Euler(-0.18, 0.35, 0));

export function ToolkitSpace() {
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const nodes = useRef<Array<HTMLButtonElement | null>>([]);
  const [group, setGroup] = useState<Group>("All");
  const [selected, setSelected] = useState("React");
  const scene = useRef({
    orientation: initialOrientation(),
    group: "All" as Group,
    selected: "React",
    draw: () => {},
  });
  const drag = useRef({ id: -1, x: 0, y: 0, moved: false });

  useEffect(() => {
    Object.assign(scene.current, { group, selected });
    scene.current.draw();
  }, [group, selected]);

  useEffect(() => {
    const el = stage.current;
    const surface = canvas.current;
    const ctx = surface?.getContext("2d");
    if (!el || !surface || !ctx) return;
    const state = scene.current;
    let width = 1,
      height = 1;
    const points = portfolio.skills.map((_, i) => {
      const y = 1 - (i / (portfolio.skills.length - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const angle = i * Math.PI * (3 - Math.sqrt(5));
      return [Math.cos(angle) * radius, y * 0.88, Math.sin(angle) * radius] as const;
    });
    const projected = new Vector3();
    const project = (x: number, y: number, z: number) => {
      projected.set(x, y, z).applyQuaternion(state.orientation);
      const { x: x1, y: y1, z: z2 } = projected;
      const perspective = 3.8 / (3.8 - z2);
      const radius = Math.min(width * 0.33, height * 0.38);
      return {
        x: width / 2 + x1 * radius * perspective,
        y: height / 2 + y1 * radius * perspective,
        z: z2,
        scale: perspective,
      };
    };
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      // Deterministic stars: no random hydration differences or per-frame allocation.
      for (let i = 0; i < 62; i++) {
        const star = project(Math.sin(i * 12.9) * 2.3, Math.cos(i * 7.3) * 1.8, Math.sin(i * 3.7));
        ctx.fillStyle = `rgba(161,220,225,${0.12 + (i % 4) * 0.07})`;
        ctx.fillRect(star.x, star.y, i % 7 === 0 ? 2 : 1, i % 7 === 0 ? 2 : 1);
      }
      for (let ring = 0; ring < 3; ring++) {
        ctx.beginPath();
        for (let step = 0; step <= 96; step++) {
          const angle = (step / 96) * Math.PI * 2;
          const c = Math.cos(angle) * 1.13,
            s = Math.sin(angle) * 1.13;
          const p =
            ring === 0 ? project(c, s, 0) : ring === 1 ? project(c, 0, s) : project(0, c, s);
          if (step === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = "rgba(2,210,227,0.15)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      const center = project(0, 0, 0);
      points.forEach((point, i) => {
        const node = nodes.current[i];
        const name = portfolio.skills[i]!;
        if (!node) return;
        const p = project(...point);
        const matches = state.group === "All" || tools[name]?.group === state.group;
        const active = name === state.selected;
        node.style.transform = `translate(-50%, -50%) translate(${p.x}px, ${p.y}px) scale(${Math.min(1.16, Math.max(0.78, p.scale))})`;
        node.style.opacity = matches ? String(active ? 1 : 0.48 + ((p.z + 1) / 2) * 0.52) : "0.12";
        node.style.zIndex = String(active ? 30 : Math.round((p.z + 2) * 6));
        if (matches && (active || state.group !== "All")) {
          ctx.beginPath();
          ctx.moveTo(center.x, center.y);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = active ? "rgba(2,210,227,0.42)" : "rgba(2,210,227,0.12)";
          ctx.stroke();
        }
      });
    };
    state.draw = draw;
    const resize = new ResizeObserver(() => {
      width = el.clientWidth;
      height = el.clientHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      surface.width = Math.round(width * ratio);
      surface.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw();
    });
    resize.observe(el);
    return () => {
      resize.disconnect();
      state.draw = () => {};
    };
  }, []);

  const rotate = (dx: number, dy: number, roll = 0) => {
    // Accumulate screen-space rotation without Euler angle limits or gimbal lock.
    const axis = new Vector3(-dy, dx, roll);
    const distance = axis.length();
    if (!distance) return;
    const rotation = new Quaternion().setFromAxisAngle(
      axis.divideScalar(distance),
      distance * 0.008,
    );
    scene.current.orientation.premultiply(rotation).normalize();
    scene.current.draw();
  };
  const move = (event: PointerEvent<HTMLDivElement>) => {
    const gesture = drag.current;
    if (gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x,
      dy = event.clientY - gesture.y;
    if (!gesture.moved && Math.abs(dx) + Math.abs(dy) < 7) return;
    // Leave vertical swipes to the page on touch screens.
    if (!gesture.moved && event.pointerType === "touch" && Math.abs(dy) > Math.abs(dx)) {
      gesture.id = -1;
      return;
    }
    gesture.moved = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    const bounds = event.currentTarget.getBoundingClientRect();
    const radius = Math.max(1, Math.min(bounds.width, bounds.height) / 2);
    const x = (gesture.x - bounds.left - bounds.width / 2) / radius;
    const y = (gesture.y - bounds.top - bounds.height / 2) / radius;
    // Dragging around the edge also rolls the constellation about the viewing axis.
    rotate(dx, dy, (x * dy - y * dx) * 0.5);
    gesture.x = event.clientX;
    gesture.y = event.clientY;
    scene.current.draw();
  };
  const release = (event: PointerEvent<HTMLDivElement>) => {
    if (drag.current.id !== event.pointerId) return;
    drag.current.id = -1;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const detail = tools[selected];
  return (
    <div className="toolkit-space">
      <div className="toolkit-filters" role="group" aria-label="Filter toolkit">
        {groups.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={group === item}
            onClick={() => {
              setGroup(item);
              if (item !== "All" && tools[selected]?.group !== item)
                setSelected(
                  portfolio.skills.find((name) => tools[name]?.group === item) ?? selected,
                );
            }}
          >
            {item}
          </button>
        ))}
      </div>
      <div
        ref={stage}
        className="toolkit-stage"
        tabIndex={0}
        role="group"
        aria-label="Interactive toolkit constellation"
        aria-describedby="toolkit-instructions"
        onPointerDown={(event) => {
          if (!event.isPrimary || event.button !== 0) return;
          drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
        }}
        onPointerMove={move}
        onPointerUp={release}
        onPointerCancel={release}
        onLostPointerCapture={() => {
          drag.current.id = -1;
        }}
        onClickCapture={(event) => {
          if (drag.current.moved) {
            event.preventDefault();
            event.stopPropagation();
            drag.current.moved = false;
          }
        }}
        onKeyDown={(event) => {
          if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
          event.preventDefault();
          event.stopPropagation();
          const direction = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -20 : 20;
          const horizontal = event.key === "ArrowLeft" || event.key === "ArrowRight";
          rotate(horizontal ? direction : 0, horizontal ? 0 : direction);
        }}
      >
        <canvas ref={canvas} aria-hidden="true" />
        <div className="toolkit-core" aria-hidden="true">
          <span />
          <span />
        </div>
        {portfolio.skills.map((name, index) => {
          const matches = group === "All" || tools[name]?.group === group;
          return (
            <button
              key={name}
              ref={(node) => {
                nodes.current[index] = node;
              }}
              type="button"
              className="toolkit-node"
              aria-pressed={selected === name}
              aria-controls="toolkit-detail"
              tabIndex={matches ? 0 : -1}
              disabled={!matches}
              onClick={() => setSelected(name)}
            >
              <span aria-hidden="true" />
              {name}
            </button>
          );
        })}
        <span className="toolkit-coordinate" aria-hidden="true">
          STACK / {String(portfolio.skills.length).padStart(2, "0")} NODES
        </span>
      </div>
      <div className="toolkit-toolbar">
        <p id="toolkit-instructions">
          Hold and drag to orbit · Click to explore
          <span className="sr-only">. Use arrow keys to rotate and Tab to reach each tool.</span>
        </p>
        <div>
          <button
            type="button"
            aria-label="Reset orbit"
            onClick={() => {
              scene.current.orientation.copy(initialOrientation());
              scene.current.draw();
            }}
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
      <div id="toolkit-detail" className="toolkit-detail" aria-live="polite" aria-atomic="true">
        <div>
          <span>{detail?.group ?? "Toolkit"}</span>
          <h3>{selected}</h3>
        </div>
        <p>{detail?.description ?? "Part of my development toolkit."}</p>
      </div>
    </div>
  );
}
