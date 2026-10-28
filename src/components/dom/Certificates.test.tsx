import { useState } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CertificateCollection } from "./Certificates";
import type { Certificate } from "@/data/certificates";
import type { CollectionLaunch } from "./useCollectionOverlay";

vi.mock("gsap", () => ({
  default: {
    fromTo: vi.fn(() => ({ kill: vi.fn() })),
    to: vi.fn((_target, vars) => {
      vars.onComplete?.();
      return { kill: vi.fn() };
    }),
  },
}));
vi.mock("gsap/ScrollTrigger", () => ({ ScrollTrigger: { getAll: () => [], refresh: vi.fn() } }));

const items: Certificate[] = [
  {
    id: "one",
    title: "Interface course",
    issuer: "Example Academy",
    date: "2026",
    category: "Courses",
    image: "/one.webp",
    file: "/one.pdf",
    pinned: true,
  },
  {
    id: "two",
    title: "Hackathon participation",
    issuer: "Example Event",
    date: "2026",
    category: "Hackathons",
    image: "/two.webp",
    verificationUrl: "https://example.com/verify",
  },
];
const lenis = { isStopped: false, stop: vi.fn(), start: vi.fn(), scrollTo: vi.fn() };
const unorderedItems = [items[1]!, items[0]!];
let frame: FrameRequestCallback | undefined;

function Harness() {
  const [launch, setLaunch] = useState<CollectionLaunch | null>(null);
  return (
    <>
      <button
        onClick={(event) =>
          setLaunch({ token: "test-collection", scroll: 845, opener: event.currentTarget })
        }
      >
        Open certificates
      </button>
      {launch && (
        <CertificateCollection
          launch={launch}
          items={unorderedItems}
          onClose={() => setLaunch(null)}
        />
      )}
    </>
  );
}

beforeEach(() => {
  Object.defineProperty(window, "__lenis", { configurable: true, value: lenis });
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    frame = callback;
    return 1;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(1200);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(800);
  const originalMatchMedia = window.matchMedia;
  vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
    ...originalMatchMedia(query),
    matches: true,
  }));
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(private callback: () => void) {}
      observe() {
        this.callback();
      }
      disconnect() {}
    },
  );
});

afterEach(() => {
  cleanup();
  delete (window as Window & { __lenis?: unknown }).__lenis;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  frame = undefined;
});

describe("Certificate collection", () => {
  it("isolates native scrolling and restores the exact home position and focus through five cycles", () => {
    render(<Harness />);
    const opener = screen.getByRole("button", { name: "Open certificates" });
    const pageWheel = vi.fn();
    window.addEventListener("wheel", pageWheel);
    for (let cycle = 1; cycle <= 5; cycle++) {
      fireEvent.click(opener);
      const dialog = screen.getByRole("dialog", { name: "Certificate collection" });
      expect(screen.getByRole("heading", { name: "Interface course" })).toBeInTheDocument();
      expect(document.documentElement.style.overflow).toBe("hidden");
      expect(document.body.style.overflow).toBe("hidden");
      expect(lenis.stop).toHaveBeenCalledTimes(cycle);
      const scrollCalls = vi.mocked(window.scrollTo).mock.calls.length;
      const wheel = new WheelEvent("wheel", { deltaY: 100, bubbles: true, cancelable: true });
      fireEvent(dialog, wheel);
      expect(wheel.defaultPrevented).toBe(false);
      expect(pageWheel).not.toHaveBeenCalled();
      dialog.scrollTop = 680;
      fireEvent.scroll(dialog);
      act(() => {
        frame?.(performance.now() + 16);
      });
      expect(window.scrollTo).toHaveBeenCalledTimes(scrollCalls);
      expect(screen.getByRole("heading", { name: "Hackathon participation" })).toBeInTheDocument();
      fireEvent.keyDown(dialog, { key: "Escape" });
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(document.body.style.overflow).toBe("");
      expect(document.documentElement.style.overflow).toBe("");
      expect(window.scrollTo).toHaveBeenLastCalledWith(0, 845);
      expect(lenis.scrollTo).toHaveBeenLastCalledWith(845, { immediate: true, force: true });
      expect(lenis.start).toHaveBeenCalledTimes(cycle);
      expect(document.activeElement).toBe(opener);
    }
    window.removeEventListener("wheel", pageWheel);
  });

  it("finds certificates by title or category and exposes PDF and verification links in list view", () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Open certificates" }));
    fireEvent.click(screen.getByRole("button", { name: "List view" }));
    expect(screen.getAllByRole("link", { name: "View certificate" })).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Verify" })).toHaveAttribute(
      "href",
      "https://example.com/verify",
    );
    fireEvent.change(screen.getByRole("searchbox", { name: "Search certificates" }), {
      target: { value: "missing" },
    });
    expect(screen.getByText("No matching certificates.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Certificate category" }), {
      target: { value: "Courses" },
    });
    expect(screen.getByRole("heading", { name: "Interface course" })).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Hackathon participation" }),
    ).not.toBeInTheDocument();
  });
});
