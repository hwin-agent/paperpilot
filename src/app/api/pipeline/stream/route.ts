import { NextRequest } from "next/server";
import { getRun, addListener, removeListener, createRun } from "@/lib/store";
import { executePipeline } from "@/lib/pipeline";
import type { PipelineEvent } from "@/lib/types";
import { parseArxivId } from "@/lib/arxiv";
import { v4 as uuid } from "uuid";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes max for Vercel Pro

export async function GET(req: NextRequest) {
  const runId = req.nextUrl.searchParams.get("runId");
  if (!runId) {
    return new Response("runId is required", { status: 400 });
  }

  const run = getRun(runId);
  if (!run) {
    return new Response("Run not found", { status: 404 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send any events that already happened
      for (const event of run.events) {
        const data = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(data));
      }

      // If already complete or errored, close
      if (run.status === "complete" || run.status === "error") {
        controller.close();
        return;
      }

      // Listen for new events
      const listener = (event: PipelineEvent) => {
        try {
          const data = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(data));
          if (event.stage === "complete" || event.stage === "error") {
            controller.close();
          }
        } catch {
          // Stream closed
          removeListener(runId, listener);
        }
      };

      addListener(runId, listener);

      // Cleanup on cancel
      req.signal.addEventListener("abort", () => {
        removeListener(runId, listener);
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

/**
 * POST to create a run AND stream results in one request.
 * This keeps the serverless function alive for the full pipeline.
 */
export async function POST(req: NextRequest) {
  let body: { arxivUrl: string };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const { arxivUrl } = body;
  if (!arxivUrl || typeof arxivUrl !== "string") {
    return new Response("arxivUrl is required", { status: 400 });
  }

  if (
    !process.env.GLM_API_KEY &&
    !process.env.OPENAI_API_KEY
  ) {
    return new Response(
      JSON.stringify({ error: "No LLM API key configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const arxivId = parseArxivId(arxivUrl);
  if (!arxivId) {
    return new Response("Invalid arXiv URL", { status: 400 });
  }

  const runId = uuid();
  createRun(runId, arxivUrl);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send the runId first
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ stage: "init", data: { runId } })}\n\n`)
      );

      // Listen for events and forward to stream
      const listener = (event: PipelineEvent) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
          );
          if (event.stage === "complete" || event.stage === "error") {
            controller.close();
          }
        } catch {
          // Stream closed
        }
      };

      addListener(runId, listener);

      req.signal.addEventListener("abort", () => {
        removeListener(runId, listener);
      });

      // Execute pipeline — this keeps the function alive
      try {
        await executePipeline(runId, arxivUrl);
      } catch (err) {
        // Error is already emitted by executePipeline
      } finally {
        removeListener(runId, listener);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
