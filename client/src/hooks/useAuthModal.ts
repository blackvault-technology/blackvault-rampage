import { useEffect, useState } from "react";

export function useAuthModal() {
  const [open, setOpen] = useState(false);
  const [redirect, setRedirect] = useState("/learn");

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ redirect?: string }>).detail;
      setRedirect(detail?.redirect || "/learn");
      setOpen(true);
    };

    window.addEventListener("rampage:auth", handler);
    return () => window.removeEventListener("rampage:auth", handler);
  }, []);

  return { open, setOpen, redirect };
}
