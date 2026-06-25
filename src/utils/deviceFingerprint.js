/**
 * ─────────────────────────────────────────────────────────────────────────
 *  deviceFingerprint.js — identifies "this browser" across logins
 *
 *  There is no real hardware device ID available to a website. This is a
 *  random UUID generated once and stored in localStorage. As long as the
 *  browser's storage isn't cleared, the same fingerprint is sent on every
 *  login, which is what lets the backend recognize "I've seen this device
 *  before" and apply a block if an admin has disallowed it.
 *
 *  Caveats (worth knowing, not bugs):
 *    - Clearing browser data / localStorage → new fingerprint → looks like
 *      a "new device" on next login.
 *    - Private/incognito windows often don't persist localStorage across
 *      sessions → same effect.
 *    - A different browser on the same physical computer → different
 *      fingerprint (each browser is tracked separately, which matches how
 *      "block this device" is expected to behave — per browser, not per PC).
 * ─────────────────────────────────────────────────────────────────────────
 */
const STORAGE_KEY = 'abuki_device_fingerprint';

export function getDeviceFingerprint() {
  try {
    let fp = localStorage.getItem(STORAGE_KEY);
    if (!fp) {
      fp = (crypto?.randomUUID?.() || `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`);
      localStorage.setItem(STORAGE_KEY, fp);
    }
    return fp;
  } catch {
    // localStorage unavailable (e.g. some privacy modes) — fall back to a
    // session-only value so login still works, just without device memory.
    return `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}
