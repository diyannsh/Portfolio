import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToolkitSpace } from "./ToolkitSpace";

const disconnectResize = vi.fn();
const disconnectVisibility = vi.fn();

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(560);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(400);
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    setTransform: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(private callback: () => void) {}
      observe() {
        this.callback();
      }
      disconnect = disconnectResize;
    },
  );
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      disconnect = disconnectVisibility;
    },
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("Toolkit exploration", () => {
  it("rotates only during a held pointer drag and stops on release", () => {
    render(<ToolkitSpace />);
    const stage = screen.getByRole("group", { name: "Interactive toolkit constellation" });
    stage.setPointerCapture = vi.fn();
    stage.hasPointerCapture = () => false;
    const node = screen.getByRole("button", { name: "Three.js" });
    const dispatch = (type: string, x: number) => {
      const event = new MouseEvent(type, { clientX: x, clientY: 150, bubbles: true });
      Object.defineProperties(event, {
        pointerId: { value: 1 },
        pointerType: { value: "mouse" },
        isPrimary: { value: true },
      });
      fireEvent(stage, event);
    };
    const initial = node.style.transform;
    dispatch("pointermove", 100);
    expect(node.style.transform).toBe(initial);
    dispatch("pointerdown", 100);
    dispatch("pointermove", 160);
    expect(node.style.transform).not.toBe(initial);
    dispatch("pointerup", 160);
    const released = node.style.transform;
    dispatch("pointermove", 220);
    expect(node.style.transform).toBe(released);
  });

  it("allows wheel input over the orbit to scroll the page without rotating", () => {
    render(<ToolkitSpace />);
    const pageWheel = vi.fn();
    window.addEventListener("wheel", pageWheel);
    const stage = screen.getByRole("group", { name: "Interactive toolkit constellation" });
    const node = screen.getByRole("button", { name: "Three.js" });
    const initial = node.style.transform;
    const wheel = new WheelEvent("wheel", { deltaY: 80, bubbles: true, cancelable: true });
    fireEvent(stage, wheel);
    expect(wheel.defaultPrevented).toBe(false);
    expect(pageWheel).toHaveBeenCalledTimes(1);
    expect(node.style.transform).toBe(initial);
    fireEvent.wheel(screen.getByRole("heading", { name: "React" }), { deltaY: 80 });
    expect(pageWheel).toHaveBeenCalledTimes(2);
    window.removeEventListener("wheel", pageWheel);
  });

  it("filters keyboard-accessible tools and shows a selected tool's description", () => {
    render(<ToolkitSpace />);
    fireEvent.click(screen.getByRole("button", { name: "Backend" }));
    expect(screen.getByRole("button", { name: "React" })).toBeDisabled();
    const python = screen.getByRole("button", { name: "Python" });
    expect(python).toBeEnabled();
    fireEvent.click(python);
    expect(python).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByText("Data processing, automation and services behind intelligent features."),
    ).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(screen.getByRole("button", { name: "React" })).toBeEnabled();
  });

  it("supports keyboard rotation and an exact reset without changing the selection", () => {
    render(<ToolkitSpace />);
    const react = screen.getByRole("button", { name: "React" });
    const node = screen.getByRole("button", { name: "Three.js" });
    const initial = node.style.transform;
    fireEvent.keyDown(screen.getByRole("group", { name: "Interactive toolkit constellation" }), {
      key: "ArrowRight",
    });
    expect(node.style.transform).not.toBe(initial);
    expect(react).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Reset orbit" }));
    expect(node.style.transform).toBe(initial);
  });

  it("keeps rotating vertically beyond the former tilt limit and through full turns", () => {
    render(<ToolkitSpace />);
    const stage = screen.getByRole("group", { name: "Interactive toolkit constellation" });
    const node = screen.getByRole("button", { name: "Three.js" });
    for (let i = 0; i < 10; i++) fireEvent.keyDown(stage, { key: "ArrowDown" });
    const pastOldLimit = node.style.transform;
    fireEvent.keyDown(stage, { key: "ArrowDown" });
    expect(node.style.transform).not.toBe(pastOldLimit);
    for (let i = 0; i < 80; i++) fireEvent.keyDown(stage, { key: "ArrowDown" });
    const afterTurns = node.style.transform;
    fireEvent.keyDown(stage, { key: "ArrowDown" });
    expect(node.style.transform).not.toBe(afterTurns);
    expect(node.style.transform).not.toContain("NaN");
  });

  it("keeps tools explorable with reduced motion", () => {
    const original = window.matchMedia;
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      ...original(query),
      matches: true,
    }));
    render(<ToolkitSpace />);
    fireEvent.click(screen.getByRole("button", { name: "GSAP" }));
    expect(screen.getByRole("heading", { name: "GSAP" })).toBeVisible();
  });

  it("disconnects scene observers on unmount so remounts do not stack them", () => {
    for (let i = 0; i < 3; i++) {
      const view = render(<ToolkitSpace />);
      view.unmount();
    }
    expect(disconnectResize).toHaveBeenCalledTimes(3);
  });
});
