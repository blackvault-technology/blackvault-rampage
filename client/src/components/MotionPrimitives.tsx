import { motion, useReducedMotion } from "framer-motion";
import type { HTMLAttributes, ReactNode } from "react";

const ease = [0.23, 1, 0.32, 1] as const;

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
      transition={reduced ? undefined : { duration: 0.42, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : "hidden"}
      whileInView={reduced ? undefined : "visible"}
      viewport={{ once: true, amount: 0.1 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: reduced ? 0 : 0.055, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={{
        hidden: reduced ? {} : { opacity: 0, y: 12 },
        visible: reduced ? {} : { opacity: 1, y: 0, transition: { duration: 0.34, ease } },
      }}
    >
      {children}
    </motion.div>
  );
}

type PressableProps = Pick<HTMLAttributes<HTMLDivElement>, "id" | "role" | "tabIndex" | "aria-label" | "aria-describedby" | "onClick" | "onFocus" | "onBlur"> & { className?: string; children: ReactNode };

export function Pressable({ children, className = "", ...props }: PressableProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={`motion-pressable ${className}`}
      whileHover={reduced ? undefined : { y: -2 }}
      whileTap={reduced ? undefined : { scale: 0.985 }}
      transition={{ duration: 0.16, ease }}
      {...props}
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
      transition={reduced ? undefined : { duration: 0.55, ease }}
      aria-hidden="true"
    />
  );
}
