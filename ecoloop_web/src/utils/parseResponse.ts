/**
 * Safe response parsing utilities.
 * Prevents crashes on unexpected backend responses.
 * Logs warnings in dev mode to help debug contract drift.
 */

function warnDev(expected: string, val: unknown, context?: string) {
  if (import.meta.env.DEV) {
    console.warn(
      `[EcoLoop] Expected ${expected}${context ? ` for "${context}"` : ''}, got ${typeof val}:`,
      val
    );
  }
}

export function safeNumber(val: unknown, fallback = 0, context?: string): number {
  if (typeof val === 'number' && !isNaN(val)) return val;
  if (val !== undefined && val !== null) warnDev('number', val, context);
  return fallback;
}

export function safeString(val: unknown, fallback = '', context?: string): string {
  if (typeof val === 'string') return val;
  if (val !== undefined && val !== null) warnDev('string', val, context);
  return fallback;
}

export function safeArray<T>(val: unknown, fallback: T[] = [], context?: string): T[] {
  if (Array.isArray(val)) return val;
  if (val !== undefined && val !== null) warnDev('array', val, context);
  return fallback;
}

export function safeRecord(
  val: unknown,
  fallback: Record<string, number> = {},
  context?: string
): Record<string, number> {
  if (val && typeof val === 'object' && !Array.isArray(val)) return val as Record<string, number>;
  if (val !== undefined && val !== null) warnDev('object', val, context);
  return fallback;
}
