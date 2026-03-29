"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Current real mouse position
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    // Smoothly-interpolated outline position
    const outline = { x: mouse.x, y: mouse.y };

    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      // Dot follows precisely
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouse.x - 4}px, ${mouse.y - 4}px)`;
      }
    };

    const onMouseEnterInteractive = () => {
      outlineRef.current?.classList.add("hovering");
    };

    const onMouseLeaveInteractive = () => {
      outlineRef.current?.classList.remove("hovering");
    };

    // Attach hover listeners to all interactive elements currently in the DOM,
    // and observe future additions via MutationObserver.
    const INTERACTIVE = "a, button, [role='button'], input, textarea, select, label";

    const attachListeners = (root: Document | Element = document) => {
      const els = root.querySelectorAll<HTMLElement>(INTERACTIVE);
      els.forEach((el) => {
        el.addEventListener("mouseenter", onMouseEnterInteractive);
        el.addEventListener("mouseleave", onMouseLeaveInteractive);
      });
    };

    attachListeners();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            // Check if the node itself is interactive
            if (node.matches(INTERACTIVE)) {
              (node as HTMLElement).addEventListener("mouseenter", onMouseEnterInteractive);
              (node as HTMLElement).addEventListener("mouseleave", onMouseLeaveInteractive);
            }
            // Check its descendants
            attachListeners(node);
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // RAF loop for smooth outline interpolation
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const LERP_FACTOR = 0.15;

    const loop = () => {
      outline.x = lerp(outline.x, mouse.x, LERP_FACTOR);
      outline.y = lerp(outline.y, mouse.y, LERP_FACTOR);

      if (outlineRef.current) {
        const size = outlineRef.current.classList.contains("hovering") ? 56 : 36;
        outlineRef.current.style.transform = `translate(${outline.x - size / 2}px, ${outline.y - size / 2}px)`;
      }

      rafId = requestAnimationFrame(loop);
    };

    loop();

    document.addEventListener("mousemove", onMouseMove);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafId);
      observer.disconnect();

      // Clean up interactive listeners
      const els = document.querySelectorAll<HTMLElement>(INTERACTIVE);
      els.forEach((el) => {
        el.removeEventListener("mouseenter", onMouseEnterInteractive);
        el.removeEventListener("mouseleave", onMouseLeaveInteractive);
      });
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={outlineRef} className="cursor-outline" aria-hidden="true" />
    </>
  );
}