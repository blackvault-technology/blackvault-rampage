import { useState } from "react";

export function useProgress() {
  const [done, setDone] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("rampage-completed") || "[]") as string[];
    } catch {
      return [];
    }
  });

  const mark = (id: string) => {
    const next = done.includes(id) ? done : [...done, id];
    setDone(next);
    localStorage.setItem("rampage-completed", JSON.stringify(next));
  };

  return { done, mark };
}
