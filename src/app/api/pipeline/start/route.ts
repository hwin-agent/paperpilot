import { NextRequest, NextResponse } from "next/server";
import { runPipeline } from "@/lib/pipeline";

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

    const runId = await runPipeline(arxivUrl);

    return NextResponse.json({ runId });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
