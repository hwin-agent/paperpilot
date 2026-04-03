"use client";

import { useState, useRef, useCallback } from "react";
import type {
  PipelineEvent,
  PipelineStage,
  AlgorithmExtraction,
  ImplementationPlan,
  GeneratedFile,
  ValidationResult,
} from "@/lib/types";
import { PipelineStages } from "@/components/pipeline-stages";
import { ExtractionPanel } from "@/components/extraction-panel";
import { PlanPanel } from "@/components/plan-panel";
import { CodeViewer } from "@/components/code-viewer";
import { ValidationTable } from "@/components/validation-table";
import { OutputPackage } from "@/components/output-package";

export default function PipelinePage() {
  const [url, setUrl] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [currentStage, setCurrentStage] = useState<PipelineStage>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [paperTitle, setPaperTitle] = useState("");
  const [paperAuthors, setPaperAuthors] = useState<string[]>([]);
  const [paperAbstract, setPaperAbstract] = useState("");
  const [extraction, setExtraction] = useState<AlgorithmExtraction | null>(
    null
  );
  const [plan, setPlan] = useState<ImplementationPlan | null>(null);
  const [files, setFiles] = useState<GeneratedFile[]>([]);
  const [validation, setValidation] = useState<ValidationResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [completedStages, setCompletedStages] = useState<Set<PipelineStage>>(
    new Set()
  );

  const abortRef = useRef<AbortController | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!url.trim() || isRunning) return;

      // Reset state
      setIsRunning(true);
      setCurrentStage("fetching");
      setStatusMessage("Starting pipeline...");
      setError(null);
      setPaperTitle("");
      setPaperAuthors([]);
      setPaperAbstract("");
      setExtraction(null);
      setPlan(null);
      setFiles([]);
      setValidation([]);
      setCompletedStages(new Set());

      try {
        // Start pipeline
        const res = await fetch("/api/pipeline/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ arxivUrl: url.trim() }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to start pipeline");
        }
        const { runId } = await res.json();

        // Connect to SSE stream
        abortRef.current = new AbortController();
        const eventSource = await fetch(
          `/api/pipeline/stream?runId=${runId}`,
          { signal: abortRef.current.signal }
        );

        if (!eventSource.body) {
          throw new Error("No stream body");
        }

        const reader = eventSource.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let lastStage: PipelineStage = "fetching";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const event: PipelineEvent = JSON.parse(line.slice(6));

              // Track completed stages
              if (event.stage !== lastStage && lastStage !== "idle") {
                setCompletedStages((prev) => new Set([...prev, lastStage]));
              }
              lastStage = event.stage;

              setCurrentStage(event.stage);
              if (event.message) setStatusMessage(event.message);

              // Handle stage-specific data
              if (event.stage === "fetching" && event.data) {
                if (event.data.title)
                  setPaperTitle(event.data.title as string);
                if (event.data.authors)
                  setPaperAuthors(event.data.authors as string[]);
                if (event.data.abstract)
                  setPaperAbstract(event.data.abstract as string);
              }

              if (event.stage === "extracting" && event.data?.algorithmName) {
                setExtraction(event.data as unknown as AlgorithmExtraction);
              }

              if (event.stage === "planning" && event.data?.files) {
                setPlan(event.data as unknown as ImplementationPlan);
              }

              if (event.stage === "implementing" && event.data?.content) {
                const file = event.data as unknown as GeneratedFile;
                setFiles((prev) => {
                  const existing = prev.findIndex(
                    (f) => f.filename === file.filename
                  );
                  if (existing >= 0) {
                    const updated = [...prev];
                    updated[existing] = file;
                    return updated;
                  }
                  return [...prev, file];
                });
              }

              if (event.stage === "validating" && event.data?.results) {
                setValidation(
                  event.data.results as unknown as ValidationResult[]
                );
              }

              if (event.stage === "complete") {
                setCompletedStages(
                  new Set([
                    "fetching",
                    "reading",
                    "extracting",
                    "planning",
                    "implementing",
                    "validating",
                    "complete",
                  ])
                );
                setIsRunning(false);
              }

              if (event.stage === "error") {
                setError(event.message || "An error occurred");
                setIsRunning(false);
              }
            } catch {
              // Skip malformed events
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
        setIsRunning(false);
      }
    },
    [url, isRunning]
  );

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: "#FAF8F5" }}
    >
      {/* Header */}
      <header
        className="px-6 py-4 flex items-center gap-4"
        style={{ borderBottom: "1px solid #D5CEC5" }}
      >
        <a
          href="/"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.25rem",
            color: "#1A1A2E",
            textDecoration: "none",
          }}
        >
          PaperPilot
        </a>
        <span style={{ color: "#D5CEC5" }}>|</span>
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.85rem",
            color: "#9B9498",
          }}
        >
          arXiv Paper → Working Code
        </span>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste an arXiv URL… (e.g. https://arxiv.org/abs/2301.12345)"
            disabled={isRunning}
            className="flex-1 transition-colors outline-none"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #D5CEC5",
              borderRadius: "6px",
              padding: "12px 16px",
              fontFamily: "var(--font-sans)",
              fontSize: "1rem",
              color: "#1A1A2E",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "#C8432B")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = "#D5CEC5")
            }
          />
          <button
            type="submit"
            disabled={isRunning || !url.trim()}
            className="transition-colors flex-shrink-0"
            style={{
              backgroundColor: isRunning ? "#9B9498" : "#C8432B",
              color: "#fff",
              fontFamily: "var(--font-sans)",
              fontWeight: 600,
              fontSize: "0.95rem",
              padding: "12px 28px",
              borderRadius: "6px",
              border: "none",
              cursor: isRunning ? "not-allowed" : "pointer",
            }}
          >
            {isRunning ? "Processing..." : "Implement"}
          </button>
        </form>

        {/* Pipeline Stages */}
        {currentStage !== "idle" && (
          <div className="mt-8">
            <PipelineStages
              currentStage={currentStage}
              completedStages={completedStages}
            />
          </div>
        )}

        {/* Status Message */}
        {statusMessage && currentStage !== "idle" && (
          <div className="mt-4 flex items-center gap-2">
            {isRunning && (
              <span
                className="inline-block animate-pulse"
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#C8432B",
                }}
              />
            )}
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.9rem",
                color: "#6B6570",
              }}
            >
              {statusMessage}
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="mt-6 p-4"
            style={{
              backgroundColor: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: "6px",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.9rem",
                color: "#991B1B",
              }}
            >
              {error}
            </p>
          </div>
        )}

        {/* Paper Info */}
        {paperTitle && (
          <div
            className="mt-6 p-6"
            style={{
              backgroundColor: "#F2EDE7",
              border: "1px solid #D5CEC5",
              borderRadius: "6px",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.35rem",
                color: "#1A1A2E",
                lineHeight: "1.3",
              }}
            >
              {paperTitle}
            </h3>
            {paperAuthors.length > 0 && (
              <p
                className="mt-2"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  color: "#6B6570",
                }}
              >
                {paperAuthors.join(", ")}
              </p>
            )}
            {paperAbstract && (
              <p
                className="mt-3"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.9rem",
                  color: "#6B6570",
                  lineHeight: "1.6",
                }}
              >
                {paperAbstract.length > 300
                  ? paperAbstract.slice(0, 300) + "..."
                  : paperAbstract}
              </p>
            )}
          </div>
        )}

        {/* Extraction Panel */}
        {extraction && (
          <div className="mt-6">
            <ExtractionPanel extraction={extraction} />
          </div>
        )}

        {/* Plan Panel */}
        {plan && (
          <div className="mt-6">
            <PlanPanel plan={plan} />
          </div>
        )}

        {/* Code Viewer */}
        {files.length > 0 && (
          <div className="mt-6">
            <CodeViewer files={files} />
          </div>
        )}

        {/* Validation Table */}
        {validation.length > 0 && (
          <div className="mt-6">
            <ValidationTable results={validation} />
          </div>
        )}

        {/* Output Package (when complete) */}
        {currentStage === "complete" && files.length > 0 && (
          <div className="mt-6">
            <OutputPackage files={files} paperTitle={paperTitle} />
          </div>
        )}
      </div>
    </main>
  );
}
