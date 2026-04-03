"use client";

import type { AlgorithmExtraction } from "@/lib/types";

interface Props {
  extraction: AlgorithmExtraction;
}

export function ExtractionPanel({ extraction }: Props) {
  return (
    <div
      style={{
        backgroundColor: "#F2EDE7",
        border: "1px solid #D5CEC5",
        borderRadius: "6px",
        padding: "24px",
      }}
    >
      <h3
        style={{
          fontFamily: "var(--font-sans)",
          fontWeight: 600,
          fontSize: "0.75rem",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          color: "#C8432B",
          marginBottom: "16px",
        }}
      >
        Algorithm Extraction
      </h3>

      <div className="grid grid-cols-2 gap-6">
        {/* Left column */}
        <div>
          <h4
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.2rem",
              color: "#1A1A2E",
            }}
          >
            {extraction.algorithmName}
          </h4>
          <p
            className="mt-2"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.9rem",
              color: "#6B6570",
              lineHeight: "1.6",
            }}
          >
            {extraction.description}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "#9B9498",
                  marginBottom: "4px",
                }}
              >
                Inputs
              </p>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  color: "#1A1A2E",
                }}
              >
                {extraction.inputs}
              </p>
            </div>
            <div>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "#9B9498",
                  marginBottom: "4px",
                }}
              >
                Outputs
              </p>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  color: "#1A1A2E",
                }}
              >
                {extraction.outputs}
              </p>
            </div>
          </div>

          {extraction.keyParameters.length > 0 && (
            <div className="mt-4">
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "#9B9498",
                  marginBottom: "6px",
                }}
              >
                Key Parameters
              </p>
              <div className="flex flex-wrap gap-2">
                {extraction.keyParameters.map((p) => (
                  <span
                    key={p.name}
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.8rem",
                      color: "#1A1A2E",
                      backgroundColor: "#FAF8F5",
                      border: "1px solid #D5CEC5",
                      borderRadius: "4px",
                      padding: "2px 8px",
                    }}
                    title={p.description}
                  >
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column - Core Steps */}
        <div>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 600,
              fontSize: "0.7rem",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "#9B9498",
              marginBottom: "8px",
            }}
          >
            Core Steps
          </p>
          <ol className="space-y-2">
            {extraction.coreSteps.map((step, i) => (
              <li
                key={i}
                className="flex gap-3"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  color: "#1A1A2E",
                  lineHeight: "1.5",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.75rem",
                    color: "#9B9498",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
