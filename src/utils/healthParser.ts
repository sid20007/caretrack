export interface HealthReading {
  bp?: string;
  sugar?: number;
  taken?: boolean;
}

// "BP 130/85 Sugar 145 Taken yes" → { bp: "130/85", sugar: 145, taken: true }
// order and casing don't matter, partial readings are fine
export function parseHealthReading(text: string): HealthReading | null {
  const t = text.trim();

  const bp = extractBP(t);
  const sugar = extractSugar(t);
  const taken = extractTaken(t);

  if (!bp && sugar === undefined && taken === undefined) return null;

  const reading: HealthReading = {};
  if (bp) reading.bp = bp;
  if (sugar !== undefined) reading.sugar = sugar;
  if (taken !== undefined) reading.taken = taken;

  return reading;
}

function extractBP(text: string): string | undefined {
  const match = text.match(/\bbp\s+(\d{2,3}\s*\/\s*\d{2,3})\b/i);
  return match ? match[1].replace(/\s/g, "") : undefined;
}

function extractSugar(text: string): number | undefined {
  const match = text.match(/\bsugar\s+(\d{2,4})\b/i);
  return match ? parseInt(match[1], 10) : undefined;
}

function extractTaken(text: string): boolean | undefined {
  const match = text.match(/\btaken\s+(yes|no|y|n)\b/i);
  if (!match) return undefined;
  return ["yes", "y"].includes(match[1].toLowerCase());
}
