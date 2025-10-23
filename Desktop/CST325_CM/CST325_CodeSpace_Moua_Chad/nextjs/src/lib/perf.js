export function mark(name) {
  if (typeof performance === 'undefined' || !performance.mark) return;
  performance.mark(`${name}-start`);
}
export function markEnd(name) {
  if (typeof performance === 'undefined' || !performance.mark) return;
  performance.mark(`${name}-end`);
  try {
    performance.measure(name, `${name}-start`, `${name}-end`);
    const [m] = performance.getEntriesByName(name);
    console.log(`[perf] ${name}: ${Math.round(m.duration)}ms`);
    performance.clearMarks(`${name}-start`);
    performance.clearMarks(`${name}-end`);
    performance.clearMeasures(name);
  } catch (e) {
  }
}
export async function wrapFetch(name, fn) {
  mark(name);
  try {
    return await fn();
  } finally {
    markEnd(name);
  }
}