import { NextRequest } from "next/server";
import { getRun, addListener, removeListener } from "@/lib/store";
import type { PipelineEvent } from "@/lib/types";

export const dynamic = "force-dynamic";

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
