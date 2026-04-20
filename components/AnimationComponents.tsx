"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  Variants,
} from "framer-motion";

// ---------------------------------------------------------------------------
// Shared viewport config
// ---------------------------------------------------------------------------
const VIEWPORT = { once: true, margin: "-50px" };

// ---------------------------------------------------------------------------
// 1. FadeInView – fades in and slides up on viewport entry
// ---------------------------------------------------------------------------
interface FadeInViewProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export function FadeInView({
  children,
  className,
  delay = 0,
  duration = 0.7,
}: FadeInViewProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// 2. SlideInLeft – slides in from the left on viewport entry
// ---------------------------------------------------------------------------
interface SlideInLeftProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export function SlideInLeft({
  children,
  className,
  delay = 0,
  duration = 0.7,
}: SlideInLeftProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: -60 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={VIEWPORT}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// 3. SlideInRight – slides in from the right on viewport entry
// ---------------------------------------------------------------------------
interface SlideInRightProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export function SlideInRight({
  children,
  className,
  delay = 0,
  duration = 0.7,
}: SlideInRightProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: 60 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={VIEWPORT}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// 4. ScaleInView – scales in from 0.85 on viewport entry
// ---------------------------------------------------------------------------
interface ScaleInViewProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export function ScaleInView({
  children,
  className,
  delay = 0,
  duration = 0.6,
}: ScaleInViewProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={VIEWPORT}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// 5. StaggerContainer – staggers children animations
// ---------------------------------------------------------------------------
interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  initialDelay?: number;
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.12,
  initialDelay = 0,
}: StaggerContainerProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: initialDelay,
        staggerChildren: staggerDelay,
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// 6. StaggerItem – child item for StaggerContainer, slides up with fade
// ---------------------------------------------------------------------------
interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// 7. CountUpNumber – animated counter from 0 to `end`
// ---------------------------------------------------------------------------
interface CountUpNumberProps {
  end: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

export function CountUpNumber({
  end,
  duration = 2000,
  suffix = "",
  className,
}: CountUpNumberProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!inView || hasStarted.current) return;
    hasStarted.current = true;

    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * end));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [inView, end, duration]);

  return (
    <span ref={ref} className={className}>
      {count}
      {suffix}
    </span>
  );
}

// ---------------------------------------------------------------------------
// 8. FloatingElement – continuously floats up and down
// ---------------------------------------------------------------------------
interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
  yRange?: number;
  duration?: number;
}

export function FloatingElement({
  children,
  className,
  yRange = 18,
  duration = 4,
}: FloatingElementProps) {
  return (
    <motion.div
      className={className}
      animate={{ y: [-yRange / 2, yRange / 2, -yRange / 2] }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// 9. GlowPulse – pulsing glow effect
// ---------------------------------------------------------------------------
interface GlowPulseProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  duration?: number;
}

export function GlowPulse({
  children,
  className,
  color = "rgba(0,210,141,0.6)",
  duration = 2.5,
}: GlowPulseProps) {
  const dimColor = color.replace(/[\d.]+\)$/, "0.2)");

  return (
    <motion.div
      className={className}
      animate={{
        boxShadow: [
          `0 0 10px ${dimColor}`,
          `0 0 30px ${color}, 0 0 60px ${dimColor}`,
          `0 0 10px ${dimColor}`,
        ],
        opacity: [0.85, 1, 0.85],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// 10. TextReveal – reveals text word by word from left
// ---------------------------------------------------------------------------
interface TextRevealProps {
  children: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
  staggerDelay?: number;
}

export function TextReveal({
  children,
  className,
  wordClassName,
  delay = 0,
  staggerDelay = 0.08,
}: TextRevealProps) {
  const words = children.split(" ");

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: delay,
        staggerChildren: staggerDelay,
      },
    },
  };

  const wordVariants: Variants = {
    hidden: { opacity: 0, x: -20, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <motion.span
      className={className}
      style={{ display: "inline-flex", flexWrap: "wrap", gap: "0.25em" }}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={wordVariants}
          className={wordClassName}
          style={{ display: "inline-block" }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}