import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export function Reveal({
  children,
  className,
  delay = 0,
  y = 16,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={reduced ? undefined : { duration: 0.42, delay, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function MotionBar({ value, className = "" }: { value: number; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.i
      className={className}
      initial={reduced ? { width: `${value}%` } : { width: 0 }}
      whileInView={{ width: `${value}%` }}
      viewport={{ once: true }}
      transition={reduced ? undefined : { duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
      aria-hidden="true"
    />
  );
}
