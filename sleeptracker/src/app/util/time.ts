/* Formats a Date as a local-time ISO string without a zone. */
export function toLocalIso(d: Date): string {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
}
