import { NextRequest, NextResponse } from "next/server";
import { getRun } from "@/lib/store";

export async function GET(req: NextRequest) {
  const runId = req.nextUrl.searchParams.get("runId");
  if (!runId) {
    return NextResponse.json({ error: "runId is required" }, { status: 400 });
  }

  const run = getRun(runId);
  if (!run) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: run.id,
    status: run.status,
    stage: run.stage,
    paperMetadata: run.paperMetadata,
    extraction: run.extraction,
    plan: run.plan,
    files: run.files,
    validation: run.validation,
    error: run.error,
  });
}
