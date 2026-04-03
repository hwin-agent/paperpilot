import { NextRequest, NextResponse } from "next/server";
import { parseArxivId } from "@/lib/arxiv";

/**
 * Simple validation endpoint — the actual pipeline runs via POST /api/pipeline/stream.
 * Kept for backward compatibility and URL validation.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { arxivUrl } = body as { arxivUrl: string };

    if (!arxivUrl || typeof arxivUrl !== "string") {
      return NextResponse.json(
        { error: "arxivUrl is required" },
        { status: 400 }
      );
    }

    const arxivId = parseArxivId(arxivUrl);
    if (!arxivId) {
      return NextResponse.json(
        { error: "Invalid arXiv URL" },
        { status: 400 }
      );
    }

    return NextResponse.json({ valid: true, arxivId });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
