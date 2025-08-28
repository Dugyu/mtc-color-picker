/**
 * Busy-loop: block current thread for `ms` milliseconds.
 * - Blocks the event loop, so no other tasks can run.
 * - Use only in blocking scenarios.
 * @param ms milliseconds
 */
export function sleep(ms: number) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    // Intentionally do nothing
  }
}
