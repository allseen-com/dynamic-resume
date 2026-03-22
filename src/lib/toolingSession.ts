/** HttpOnly cookie set after successful unlock; value must match TOOLING_SESSION_VALUE. */
export const TOOLING_COOKIE_NAME = "resume_tooling_session";

export function isToolingProtectionEnabled(): boolean {
  const token = process.env.TOOLING_UNLOCK_TOKEN;
  const session = process.env.TOOLING_SESSION_VALUE;
  return Boolean(token && token.length > 0 && session && session.length > 0);
}

export function hasValidToolingCookie(cookieValue: string | undefined): boolean {
  if (!isToolingProtectionEnabled()) return true;
  return cookieValue === process.env.TOOLING_SESSION_VALUE;
}
