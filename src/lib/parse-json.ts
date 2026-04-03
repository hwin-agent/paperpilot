/**
 * Robustly parse JSON from an LLM response.
 * Handles markdown fences, trailing commas, and other common LLM quirks.
 */
export function parseJsonFromLLM<T>(raw: string): T {
  // Try direct parse first
  try {
    return JSON.parse(raw);
  } catch {
    // Continue with cleanup
  }

  // Remove markdown code fences
  let cleaned = raw.replace(/^```(?:json)?\s*\n?/gm, "").replace(/\n?```\s*$/gm, "").trim();

  // Try again
  try {
    return JSON.parse(cleaned);
  } catch {
    // Continue
  }

  // Find the first { or [ and the last matching } or ]
  const firstBrace = cleaned.indexOf("{");
  const firstBracket = cleaned.indexOf("[");
  let start: number;
  let endChar: string;

  if (firstBrace === -1 && firstBracket === -1) {
    throw new Error("No JSON object or array found in response");
  }

  if (firstBracket === -1 || (firstBrace !== -1 && firstBrace < firstBracket)) {
    start = firstBrace;
    endChar = "}";
  } else {
    start = firstBracket;
    endChar = "]";
  }

  const lastEnd = cleaned.lastIndexOf(endChar);
  if (lastEnd <= start) {
    throw new Error("Malformed JSON in response");
  }

  cleaned = cleaned.slice(start, lastEnd + 1);

  // Remove trailing commas before ] or }
  cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error(
      `Failed to parse JSON from LLM response: ${e instanceof Error ? e.message : String(e)}`
    );
  }
}
