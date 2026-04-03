"use client";

import type { ImplementationPlan } from "@/lib/types";

interface Props {
  plan: ImplementationPlan;
}

export function PlanPanel({ plan }: Props) {
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
        Implementation Plan
      </h3>

      <div className="grid grid-cols-3 gap-6">
        {/* File Structure */}
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
            Module Structure
          </p>
          <div className="space-y-1">
            {plan.files.map((f) => (
              <div key={f.filename} className="flex items-start gap-2">
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.8rem",
                    color: "#1A1A2E",
                  }}
                >
                  {f.filename}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.75rem",
                    color: "#9B9498",
                    marginTop: "1px",
                  }}
                >
                  — {f.description}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Functions */}
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
            Key Functions
          </p>
          <div className="space-y-2">
            {plan.functions.slice(0, 6).map((f) => (
              <div key={f.name}>
                <code
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.75rem",
                    color: "#C8432B",
                  }}
                >
                  {f.signature.length > 50
                    ? f.signature.slice(0, 50) + "..."
                    : f.signature}
                </code>
              </div>
            ))}
          </div>
        </div>

        {/* Dependencies + Rationale */}
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
            Dependencies
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {plan.dependencies.map((d) => (
              <span
                key={d}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  color: "#1A1A2E",
                  backgroundColor: "#FAF8F5",
                  border: "1px solid #D5CEC5",
                  borderRadius: "4px",
                  padding: "2px 8px",
                }}
              >
                {d}
              </span>
            ))}
          </div>
          {plan.rationale && (
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.8rem",
                color: "#6B6570",
                lineHeight: "1.5",
                fontStyle: "italic",
              }}
            >
              {plan.rationale}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
