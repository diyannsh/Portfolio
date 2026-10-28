import { act, cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import gsap from "gsap";
import { ProjectCaseStudy } from "./ProjectTransition";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  gsap.ticker.sleep();
});

it("preserves the clicked colours and grows to the hero without overshooting or shrinking", async () => {
  const section = document.createElement("section");
  const button = document.createElement("article");
  const media = document.createElement("div");
  const image = document.createElement("img");
  image.style.filter = "grayscale(0.8)";
  media.append(image);
  button.append(media);
  section.append(button);
  document.body.append(section);
  const bounds = (left: number, top: number, width: number, height: number) => ({
    x: left,
    y: top,
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    toJSON: () => ({}),
  });
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
    this: HTMLElement,
  ) {
    return this === media ? bounds(300, 100, 800, 500) : bounds(0, 0, 1200, 800);
  });
  const animations = vi.spyOn(gsap, "timeline");
  const view = render(
    <ProjectCaseStudy
      launch={{
        index: 0,
        button,
        media,
        section,
        scroll: 0,
        token: "transition-regression",
        imageAppearance: { filter: "none", transform: "matrix(1.05, 0, 0, 1.05, 0, 0)" },
      }}
      onClose={vi.fn()}
    />,
  );
  await act(async () => {
    await Promise.resolve();
  });
  const animation = animations.mock.results[0]!.value as gsap.core.Timeline;
  animation.pause();
  const flight = document.querySelector<HTMLElement>(".project-transition-image")!;
  const flightImage = flight.querySelector("img")!;
  expect(image.style.filter).toBe("none");
  let previousWidth = 0,
    previousHeight = 0;
  for (const time of [0, 0.1, 0.2, 0.4, 0.65, 0.77]) {
    act(() => {
      animation.time(time);
    });
    const width = parseFloat(flight.style.width),
      height = parseFloat(flight.style.height);
    expect(width).toBeGreaterThanOrEqual(previousWidth);
    expect(height).toBeGreaterThanOrEqual(previousHeight);
    expect(width).toBeLessThanOrEqual(1200);
    expect(height).toBeLessThanOrEqual(800);
    expect(Number(gsap.getProperty(flight, "scaleX"))).toBe(1);
    expect(flightImage.style.filter).toBe("none");
    previousWidth = width;
    previousHeight = height;
  }
  expect(previousWidth).toBe(1200);
  expect(previousHeight).toBe(800);
  expect(Number(gsap.getProperty(flightImage, "scaleX"))).toBe(1);
  view.unmount();
  expect(image.style.filter).toBe("grayscale(0.8)");
  expect(media.style.opacity).toBe("");
  section.remove();
});
