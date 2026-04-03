/**
 * Robustly parse JSON from an LLM response.
 * Handles markdown fences, trailing commas, unescaped newlines in strings,
 * and other common LLM quirks.
 */
export function parseJsonFromLLM<T>(raw: string): T {
  // Try direct parse first
  try {
    return JSON.parse(raw);
  } catch {
    // Continue with cleanup
  }

  // Remove markdown code fences
  let cleaned = raw
    .replace(/^```(?:json)?\s*\n?/gm, "")
    .replace(/\n?```\s*$/gm, "")
    .trim();

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

  if (
    firstBracket === -1 ||
    (firstBrace !== -1 && firstBrace < firstBracket)
  ) {
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
  } catch {
    // Continue with more aggressive fixes
  }

  // Fix unescaped newlines inside JSON string values
  // Replace literal newlines inside strings with \\n
  cleaned = fixNewlinesInJsonStrings(cleaned);

  // Remove trailing commas again after fix
  cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Last resort: try to extract individual file objects with regex
    console.error(
      "[parseJsonFromLLM] Final parse failed:",
      e instanceof Error ? e.message : String(e)
    );
    console.error(
      "[parseJsonFromLLM] First 500 chars of cleaned:",
      cleaned.slice(0, 500)
    );
    throw new Error(
      `Failed to parse JSON from LLM response: ${e instanceof Error ? e.message : String(e)}`
    );
  }
}

/**
 * Fix unescaped newlines inside JSON string values.
 * LLMs often output multi-line strings without proper escaping.
 */
function fixNewlinesInJsonStrings(json: string): string {
  let result = "";
  let inString = false;
  let escaped = false;

  for (let i = 0; i < json.length; i++) {
    const ch = json[i];

    if (escaped) {
      result += ch;
      escaped = false;
      continue;
    }

    if (ch === "\\") {
      result += ch;
      escaped = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      result += ch;
      continue;
    }

    if (inString && ch === "\n") {
      result += "\\n";
      continue;
    }

    if (inString && ch === "\r") {
      result += "\\r";
      continue;
    }

    if (inString && ch === "\t") {
      result += "\\t";
      continue;
    }

    result += ch;
  }

  return result;
}
