export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const startLogin = (redirectPath?: string) => {
  if (typeof window === "undefined") return;
  const target = redirectPath || `${window.location.pathname}${window.location.search}`;
  window.dispatchEvent(new CustomEvent("rampage:auth", { detail: { redirect: target } }));
};
