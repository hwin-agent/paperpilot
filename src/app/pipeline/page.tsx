"use client";

import { useState, useRef, useCallback, useEffect } from "react";
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
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isRunning) {
      setElapsed(0);
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  // Auto-scroll to bottom when new content appears
  useEffect(() => {
    if (isRunning || currentStage === "complete") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [extraction, plan, files, validation, currentStage, isRunning, statusMessage]);

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
        // Combined start + stream endpoint (keeps serverless function alive)
        abortRef.current = new AbortController();
        const eventSource = await fetch("/api/pipeline/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ arxivUrl: url.trim() }),
          signal: abortRef.current.signal,
        });

        if (!eventSource.ok) {
          let errMsg = "Failed to start pipeline";
          try {
            const data = await eventSource.json();
            errMsg = data.error || errMsg;
          } catch { /* ignore */ }
          throw new Error(errMsg);
        }

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

        {/* Example papers */}
        {currentStage === "idle" && (
          <div className="mt-3 flex items-center gap-2">
            <span
              className="text-[#9B9498]"
              style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem" }}
            >
              Try an example:
            </span>
            {[
              {
                label: "Attention Is All You Need",
                url: "https://arxiv.org/abs/1706.03762",
              },
              {
                label: "K-Means++ Clustering",
                url: "https://arxiv.org/abs/2301.10838",
              },
              {
                label: "PageRank Algorithm",
                url: "https://arxiv.org/abs/0805.3322",
              },
            ].map((ex) => (
              <button
                key={ex.label}
                type="button"
                onClick={() => setUrl(ex.url)}
                className="text-[#C8432B] hover:text-[#A83520] underline transition-colors border-none bg-transparent cursor-pointer"
                style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem" }}
              >
                {ex.label}
              </button>
            ))}
          </div>
        )}

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
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
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
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.8rem",
                color: "#9B9498",
              }}
            >
              {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
            </span>
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
            <div className="flex items-center justify-between">
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.9rem",
                  color: "#991B1B",
                }}
              >
                {error}
              </p>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setCurrentStage("idle");
                  setIsRunning(false);
                }}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.8rem",
                  color: "#991B1B",
                  background: "transparent",
                  border: "1px solid #FECACA",
                  borderRadius: "4px",
                  padding: "4px 12px",
                  cursor: "pointer",
                  flexShrink: 0,
                  marginLeft: "12px",
                }}
              >
                Try Again
              </button>
            </div>
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
          <div className="mt-6 animate-fade-in">
            <ExtractionPanel extraction={extraction} />
          </div>
        )}

        {/* Plan Panel */}
        {plan && (
          <div className="mt-6 animate-fade-in">
            <PlanPanel plan={plan} />
          </div>
        )}

        {/* Code Viewer */}
        {files.length > 0 && (
          <div className="mt-6 animate-fade-in">
            <CodeViewer files={files} />
          </div>
        )}

        {/* Validation Table */}
        {validation.length > 0 && (
          <div className="mt-6 animate-fade-in">
            <ValidationTable results={validation} />
          </div>
        )}

        {/* Output Package (when complete) */}
        {currentStage === "complete" && files.length > 0 && (
          <div className="mt-6 animate-fade-in">
            <OutputPackage files={files} paperTitle={paperTitle} />
          </div>
        )}

        {/* New Run button after completion */}
        {currentStage === "complete" && (
          <div className="mt-8 flex justify-center animate-fade-in">
            <button
              type="button"
              onClick={() => {
                setUrl("");
                setCurrentStage("idle");
                setStatusMessage("");
                setError(null);
                setPaperTitle("");
                setPaperAuthors([]);
                setPaperAbstract("");
                setExtraction(null);
                setPlan(null);
                setFiles([]);
                setValidation([]);
                setCompletedStages(new Set());
                setElapsed(0);
              }}
              className="transition-colors"
              style={{
                backgroundColor: "transparent",
                color: "#C8432B",
                fontFamily: "var(--font-sans)",
                fontWeight: 600,
                fontSize: "0.95rem",
                padding: "12px 28px",
                borderRadius: "6px",
                border: "1px solid #C8432B",
                cursor: "pointer",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#C8432B";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#C8432B";
              }}
            >
              Try Another Paper
            </button>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={bottomRef} className="h-8" />
      </div>
    </main>
  );
}
