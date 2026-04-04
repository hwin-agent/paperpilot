/**
 * Robustly parse JSON from an LLM response.
 * Handles markdown fences, trailing commas, unescaped newlines in strings,
 * and other common LLM quirks.
 */
export function parseJsonFromLLM<T>(raw: string): T {
  if (!raw || raw.trim().length === 0) {
    throw new Error("Empty LLM response — nothing to parse");
  }

  // Try direct parse first
  try {
    return JSON.parse(raw);
  } catch {
    // Continue with cleanup
  }

  // Remove markdown code fences (various formats GLM may use)
  let cleaned = raw
    .replace(/^```(?:json|JSON|js|javascript)?\s*\n?/gm, "")
    .replace(/\n?```\s*$/gm, "")
    .trim();

  // Try again
  try {
    return JSON.parse(cleaned);
  } catch {
    // Continue
  }

  // Remove any BOM or zero-width characters
  cleaned = cleaned.replace(/[\uFEFF\u200B\u200C\u200D\u00A0]/g, "");

  // Find the first { or [ and the last matching } or ]
  // Use balanced bracket matching for reliability
  const jsonStr = extractBalancedJson(cleaned);
  if (!jsonStr) {
    throw new Error(
      `No JSON object or array found in response. First 200 chars: ${cleaned.slice(0, 200)}`
    );
  }

  cleaned = jsonStr;

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
  } catch {
    // Continue with even more aggressive fixes
  }

  // Try replacing single quotes with double quotes (common GLM quirk)
  const singleQuoteFix = cleaned
    .replace(/'/g, '"')
    .replace(/,\s*([}\]])/g, "$1");
  try {
    return JSON.parse(singleQuoteFix);
  } catch {
    // Continue
  }

  // Try removing control characters that might break parsing
  const controlCharFix = cleaned
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/,\s*([}\]])/g, "$1");
  try {
    return JSON.parse(controlCharFix);
  } catch {
    // Continue
  }

  // Try fixing incomplete JSON by closing open brackets/braces
  const completedJson = tryCompleteJson(cleaned);
  if (completedJson) {
    try {
      return JSON.parse(completedJson);
    } catch {
      // Continue
    }
  }

  // Final attempt: fix newlines again on control-char-cleaned version
  const finalAttempt = fixNewlinesInJsonStrings(controlCharFix);
  try {
    return JSON.parse(finalAttempt);
  } catch (e) {
    console.error(
      "[parseJsonFromLLM] All parse attempts failed:",
      e instanceof Error ? e.message : String(e)
    );
    console.error(
      "[parseJsonFromLLM] Raw response length:",
      raw.length,
      "First 500 chars of cleaned:",
      cleaned.slice(0, 500)
    );
    console.error(
      "[parseJsonFromLLM] Last 200 chars of cleaned:",
      cleaned.slice(-200)
    );
    throw new Error(
      `Failed to parse JSON from LLM response: ${e instanceof Error ? e.message : String(e)}`
    );
  }
}

/**
 * Extract a balanced JSON object or array from a string.
 * Uses bracket counting to find the correct end, handling strings properly.
 */
function extractBalancedJson(text: string): string | null {
  const firstBrace = text.indexOf("{");
  const firstBracket = text.indexOf("[");

  let start: number;
  let openChar: string;
  let closeChar: string;

  if (firstBrace === -1 && firstBracket === -1) return null;

  if (
    firstBracket === -1 ||
    (firstBrace !== -1 && firstBrace < firstBracket)
  ) {
    start = firstBrace;
    openChar = "{";
    closeChar = "}";
  } else {
    start = firstBracket;
    openChar = "[";
    closeChar = "]";
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (ch === "\\") {
      escaped = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (ch === openChar) depth++;
    else if (ch === closeChar) {
      depth--;
      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }

  // If we didn't find balanced brackets, fall back to last occurrence
  const lastEnd = text.lastIndexOf(closeChar);
  if (lastEnd > start) {
    return text.slice(start, lastEnd + 1);
  }

  return null;
}

/**
 * Try to complete truncated JSON by closing open brackets/braces.
 */
function tryCompleteJson(text: string): string | null {
  // Count unclosed braces and brackets (outside strings)
  let inString = false;
  let escaped = false;
  const stack: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (ch === "{") stack.push("}");
    else if (ch === "[") stack.push("]");
    else if (ch === "}" || ch === "]") stack.pop();
  }

  if (stack.length === 0) return null;

  // If we were in a string, close it first
  let completion = text;
  if (inString) {
    completion += '"';
  }

  // Remove any trailing partial key-value pair
  completion = completion.replace(/,\s*"[^"]*"?\s*:?\s*$/, "");

  // Close all open brackets
  while (stack.length > 0) {
    completion += stack.pop();
  }

  return completion;
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
