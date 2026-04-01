"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (glowRef.current) {
        glowRef.current.style.left = `${e.clientX}px`;
        glowRef.current.style.top = `${e.clientY}px`;
      }
    };

    const onMouseEnterInteractive = () => {
      glowRef.current?.classList.add("hovering");
    };

    const onMouseLeaveInteractive = () => {
      glowRef.current?.classList.remove("hovering");
    };

    const INTERACTIVE = "a, button, [role='button'], input, textarea, select, label";

    const attachListeners = (root: Document | Element = document) => {
      root.querySelectorAll<HTMLElement>(INTERACTIVE).forEach((el) => {
        el.addEventListener("mouseenter", onMouseEnterInteractive);
        el.addEventListener("mouseleave", onMouseLeaveInteractive);
      });
    };

    attachListeners();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            if (node.matches(INTERACTIVE)) {
              (node as HTMLElement).addEventListener("mouseenter", onMouseEnterInteractive);
              (node as HTMLElement).addEventListener("mouseleave", onMouseLeaveInteractive);
            }
            attachListeners(node);
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    document.addEventListener("mousemove", onMouseMove);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      observer.disconnect();
      document.querySelectorAll<HTMLElement>(INTERACTIVE).forEach((el) => {
        el.removeEventListener("mouseenter", onMouseEnterInteractive);
        el.removeEventListener("mouseleave", onMouseLeaveInteractive);
      });
    };
  }, []);

  return <div ref={glowRef} className="cursor-glow" aria-hidden="true" />;
}
