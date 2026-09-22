export function requireAuth(nextUrl?: string): boolean {
  const token = localStorage.getItem("access_token");

  if (token) {
    return true;
  }

  const target =
    nextUrl ||
    (
      window.location.pathname +
      window.location.search
    );

  window.location.href =
    `/accounts/login?next=${encodeURIComponent(target)}`;

  return false;
}