/** Checks an HTTP Basic Auth header against the expected password. Username is ignored. */
export function isAuthorized(header: string | null, password: string): boolean {
  if (!header || !header.startsWith('Basic ')) return false;
  let decoded: string;
  try {
    decoded = atob(header.slice('Basic '.length).trim());
  } catch {
    return false;
  }
  const separator = decoded.indexOf(':');
  if (separator === -1) return false;
  return safeEqual(decoded.slice(separator + 1), password);
}

/** Constant-time-ish comparison so the check doesn't leak length/prefix timing. */
function safeEqual(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let i = 0; i < length; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}
