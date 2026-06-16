/**
 * Edge-safe shared-passcode auth.
 *
 * The whole hub is gated by a single group passcode (APP_PASSCODE). On a
 * correct passcode we set an httpOnly cookie holding an HMAC token derived from
 * AUTH_SECRET. Both the login action (Node) and the middleware (Edge) recompute
 * and compare that token, so no session store is needed. These helpers use the
 * Web Crypto API only, so they run in both runtimes.
 */

export const AUTH_COOKIE = "betri_auth";
export const AUTH_MAX_AGE = 60 * 60 * 24 * 60; // 60 days

const TOKEN_MESSAGE = "betri-hub-authenticated-v1";

async function hmacHex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function expectedToken(): Promise<string> {
  const secret = process.env.AUTH_SECRET ?? "betri-dev-secret";
  return hmacHex(secret, TOKEN_MESSAGE);
}

export async function isValidToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const expected = await expectedToken();
  if (token.length !== expected.length) return false;
  // Constant-time comparison.
  let diff = 0;
  for (let i = 0; i < token.length; i++) {
    diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
