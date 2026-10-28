import { useLayoutEffect, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";

export type CollectionLaunch = { token: string; scroll: number; opener: HTMLElement };

/** A portal owns native scrolling while the underlying Lenis page stays frozen. */
export function useCollectionOverlay(
  rootRef: RefObject<HTMLDivElement | null>,
  launch: CollectionLaunch,
  onClose: () => void,
) {
  const closeRef = useRef(() => {});
  const onCloseRef = useRef(onClose);
  const [closing, setClosing] = useState(false);
  onCloseRef.current = onClose;

  useLayoutEffect(() => {
    const root = rootRef.current!;
    const html = document.documentElement;
    const body = document.body;
    const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
    const wasStopped = lenis?.isStopped;
    const saved = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      padding: body.style.paddingRight,
    };
    const scrollbar = window.innerWidth - html.clientWidth;
    const padding = parseFloat(getComputedStyle(body).paddingRight) || 0;
    const scrubs = ScrollTrigger.getAll().flatMap((trigger) => {
      const tween = trigger.getTween();
      return tween ? [{ tween, paused: tween.paused() }] : [];
    });
    const siblings = Array.from(body.children)
      .filter(
        (el): el is HTMLElement =>
          el instanceof HTMLElement &&
          el !== root &&
          !["SCRIPT", "STYLE", "LINK"].includes(el.tagName),
      )
      .map((el) => ({ el, inert: el.inert }));
    lenis?.stop();
    scrubs.forEach(({ tween }) => tween.pause());
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${padding + scrollbar}px`;
    siblings.forEach(({ el }) => {
      el.inert = true;
    });
    root.focus({ preventScroll: true });
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let exiting = false;
    let requested = false;
    const entrance = gsap.fromTo(
      root,
      { opacity: 0 },
      { opacity: 1, duration: reduced ? 0.1 : 0.45, ease: "power2.out" },
    );
    let exit: gsap.core.Tween | undefined;
    const dismiss = () => {
      if (exiting) return;
      exiting = true;
      setClosing(true);
      entrance.kill();
      exit = gsap.to(root, {
        opacity: 0,
        duration: reduced ? 0.1 : 0.25,
        onComplete: () => onCloseRef.current(),
      });
    };
    const popstate = () => {
      if (history.state?.certificateCollection !== launch.token) dismiss();
    };
    closeRef.current = () => {
      if (requested || exiting) return;
      requested = true;
      if (history.state?.certificateCollection === launch.token) history.back();
      else dismiss();
    };
    window.addEventListener("popstate", popstate);
    return () => {
      entrance.kill();
      exit?.kill();
      window.removeEventListener("popstate", popstate);
      closeRef.current = () => {};
      html.style.overflow = saved.htmlOverflow;
      body.style.overflow = saved.bodyOverflow;
      body.style.paddingRight = saved.padding;
      siblings.forEach(({ el, inert }) => {
        el.inert = inert;
      });
      ScrollTrigger.refresh();
      window.scrollTo(0, launch.scroll);
      lenis?.scrollTo(launch.scroll, { immediate: true, force: true });
      scrubs.forEach(({ tween, paused }) => {
        if (!paused) tween.resume();
      });
      if (!wasStopped) lenis?.start();
      if (launch.opener.isConnected) launch.opener.focus({ preventScroll: true });
    };
  }, [launch, rootRef]);

  const keydown = (event: KeyboardEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (event.key === "Escape") {
      event.preventDefault();
      closeRef.current();
      return;
    }
    if (
      closing &&
      [" ", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"].includes(event.key)
    )
      event.preventDefault();
    if (event.key !== "Tab") return;
    const root = rootRef.current!;
    const items = Array.from(
      root.querySelectorAll<HTMLElement>(
        'a[href], button:not(:disabled), input, select, [tabindex="0"]',
      ),
    ).filter(
      (el) =>
        !el.closest('[aria-hidden="true"]') &&
        getComputedStyle(el).visibility !== "hidden" &&
        el.getClientRects().length,
    );
    const first = items[0],
      last = items.at(-1);
    if (!first) event.preventDefault();
    else if (
      event.shiftKey &&
      (document.activeElement === first || document.activeElement === root)
    ) {
      event.preventDefault();
      last?.focus();
    } else if (
      !event.shiftKey &&
      (document.activeElement === last || document.activeElement === root)
    ) {
      event.preventDefault();
      first.focus();
    }
  };
  return { close: () => closeRef.current(), closing, keydown };
}
