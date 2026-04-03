import type { PaperMetadata } from "./types";

/**
 * Parse an arXiv URL to extract the paper ID.
 * Supports formats:
 *   https://arxiv.org/abs/2301.12345
 *   https://arxiv.org/pdf/2301.12345
 *   https://arxiv.org/abs/2301.12345v2
 *   2301.12345
 */
export function parseArxivId(url: string): string | null {
  // Direct ID
  if (/^\d{4}\.\d{4,5}(v\d+)?$/.test(url.trim())) {
    return url.trim().replace(/v\d+$/, "");
  }

  const match = url.match(
    /arxiv\.org\/(?:abs|pdf|html)\/(\d{4}\.\d{4,5})(?:v\d+)?/
  );
  return match ? match[1] : null;
}

/**
 * Fetch paper metadata from the arXiv API.
 */
export async function fetchPaperMetadata(
  arxivId: string
): Promise<PaperMetadata> {
  const apiUrl = `https://export.arxiv.org/api/query?id_list=${arxivId}`;
  let response: Response | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    response = await fetch(apiUrl, {
      headers: { "User-Agent": "PaperPilot/1.0 (hackathon project)" },
    });
    if (response.ok) break;
    if ((response.status === 429 || response.status === 503) && attempt < 2) {
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
      continue;
    }
    throw new Error(`arXiv API returned ${response.status}`);
  }
  if (!response || !response.ok) {
    throw new Error("arXiv API request failed after retries");
  }

  const xml = await response.text();

  // Simple XML parsing (no external dep needed)
  const getTag = (tag: string, text: string): string => {
    const match = text.match(
      new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`)
    );
    return match ? match[1].trim() : "";
  };

  const entry = xml.match(/<entry>([\s\S]*?)<\/entry>/);
  if (!entry) {
    throw new Error("Paper not found on arXiv");
  }

  const entryText = entry[1];
  const title = getTag("title", entryText).replace(/\s+/g, " ");
  const abstract = getTag("summary", entryText).replace(/\s+/g, " ");

  // Extract authors
  const authorMatches = entryText.matchAll(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>[\s\S]*?<\/author>/g);
  const authors: string[] = [];
  for (const m of authorMatches) {
    authors.push(m[1].trim());
  }

  return { title, authors, abstract, arxivId };
}

/**
 * Download and extract text from an arXiv paper PDF.
 */
export async function fetchPaperText(arxivId: string): Promise<string> {
  // Try HTML version first (cleaner text)
  try {
    const htmlUrl = `https://arxiv.org/html/${arxivId}v1`;
    const htmlResponse = await fetch(htmlUrl, {
      headers: { "User-Agent": "PaperPilot/1.0 (hackathon project)" },
    });
    if (htmlResponse.ok) {
      const html = await htmlResponse.text();
      // Strip HTML tags for plain text
      const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (text.length > 2000) {
        return text.slice(0, 150000); // Limit to ~150K chars
      }
    }
  } catch {
    // Fall through to PDF
  }

  // Fallback: download PDF and parse (with retry for 503)
  const pdfUrl = `https://arxiv.org/pdf/${arxivId}`;
  let pdfResponse: Response | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    pdfResponse = await fetch(pdfUrl, {
      headers: { "User-Agent": "PaperPilot/1.0 (hackathon project)" },
    });
    if (pdfResponse.ok) break;
    if ((pdfResponse.status === 429 || pdfResponse.status === 503) && attempt < 2) {
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
      continue;
    }
    throw new Error(`Failed to download PDF: ${pdfResponse.status}`);
  }
  if (!pdfResponse || !pdfResponse.ok) {
    throw new Error("PDF download failed after retries");
  }

  const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());

  // Dynamic import for pdf-parse v1 (server-only)
  const pdfParse = (await import("pdf-parse")).default;
  const parsed = await pdfParse(pdfBuffer);

  return parsed.text.slice(0, 150000); // Limit context
}
