/**
 * Centralized configuration reader.
 * Throws at startup if a required secret is missing in production.
 * NEVER falls back to a hardcoded string in production.
 */
export function getJwtSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        '[FATAL] JWT secret is not configured. Set NEXTAUTH_SECRET or JWT_SECRET environment variable.'
      );
    }
    // Development-only fallback — clearly labelled, never production
    console.warn(
      '[WARN] JWT secret not set. Using insecure dev-only fallback. Set NEXTAUTH_SECRET for production.'
    );
    return 'starwebflow-dev-only-secret-do-not-use-in-production';
  }

  return secret;
}
