"use client";

import type { ValidationResult } from "@/lib/types";

interface Props {
  results: ValidationResult[];
}

export function ValidationTable({ results }: Props) {
  const matchCount = results.filter((r) => r.status === "match").length;
  const total = results.length;

  return (
    <div
      style={{
        backgroundColor: "#F2EDE7",
        border: "1px solid #D5CEC5",
        borderRadius: "6px",
        padding: "24px",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
            fontSize: "0.75rem",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "#C8432B",
          }}
        >
          Validation Results
        </h3>
        <span
          className="animate-count"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.85rem",
            color: matchCount === total ? "#2D6A4F" : "#D4785C",
            fontWeight: 600,
          }}
        >
          {matchCount}/{total} metrics validated
        </span>
      </div>

      <table className="w-full">
        <thead>
          <tr
            style={{
              borderBottom: "1px solid #D5CEC5",
            }}
          >
            {["Metric", "Paper Reports", "PaperPilot Output", "Status"].map(
              (h) => (
                <th
                  key={h}
                  className="text-left py-2 pr-4"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 600,
                    fontSize: "0.7rem",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    color: "#9B9498",
                  }}
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {results.map((result, i) => (
            <tr
              key={result.metric}
              style={{
                backgroundColor: i % 2 === 0 ? "transparent" : "#FAF8F5",
                animation: `fadeInUp 0.4s ease-out ${i * 0.1}s both`,
              }}
            >
              <td
                className="py-3 pr-4"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.9rem",
                  color: "#1A1A2E",
                  fontWeight: 600,
                }}
              >
                {result.metric}
              </td>
              <td
                className="py-3 pr-4"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.85rem",
                  color: "#1A1A2E",
                }}
              >
                {result.paperValue}
              </td>
              <td
                className="py-3 pr-4"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.85rem",
                  color: "#1A1A2E",
                }}
              >
                {result.implementationValue}
              </td>
              <td className="py-3">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1"
                  style={{
                    borderRadius: "4px",
                    fontFamily: "var(--font-sans)",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    animation: `popIn 0.35s ease-out ${i * 0.15 + 0.2}s both`,
                    backgroundColor:
                      result.status === "match"
                        ? "#DCFCE7"
                        : result.status === "partial"
                          ? "#FEF3C7"
                          : "#FEE2E2",
                    color:
                      result.status === "match"
                        ? "#166534"
                        : result.status === "partial"
                          ? "#92400E"
                          : "#991B1B",
                  }}
                >
                  {result.status === "match" && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M2.5 6L5 8.5L9.5 3.5"
                        stroke="#166534"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  {result.status === "match"
                    ? "Match"
                    : result.status === "partial"
                      ? "~ Partial"
                      : "✗ Mismatch"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {matchCount === total && total > 0 && (
        <div
          className="mt-5 pt-4 animate-fade-in"
          style={{ borderTop: "1px solid #D5CEC5" }}
        >
          <p
            className="text-center"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.05rem",
              color: "#2D6A4F",
              fontStyle: "italic",
            }}
          >
            Implementation validated — results within expected margin.
          </p>
        </div>
      )}
    </div>
  );
}
