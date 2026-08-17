export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Navigate to the first-party account screen. The destination is intentionally
// carried as a query parameter so protected flows can return to their origin.
export const startLogin = (redirectPath?: string) => {
  if (typeof window === "undefined") return;
  const target = redirectPath || `${window.location.pathname}${window.location.search}`;
  const params = new URLSearchParams({ redirect: target });
  window.location.href = `/login?${params.toString()}`;
};
