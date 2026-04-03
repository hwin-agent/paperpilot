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
            <th
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
              Metric
            </th>
            <th
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
              Paper Reports
            </th>
            <th
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
              PaperPilot Output
            </th>
            <th
              className="text-left py-2"
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 600,
                fontSize: "0.7rem",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "#9B9498",
              }}
            >
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, i) => (
            <tr
              key={result.metric}
              style={{
                backgroundColor: i % 2 === 0 ? "transparent" : "#FAF8F5",
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
                  className="inline-flex items-center gap-1 px-2 py-1"
                  style={{
                    borderRadius: "4px",
                    fontFamily: "var(--font-sans)",
                    fontWeight: 600,
                    fontSize: "0.75rem",
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
                  {result.status === "match"
                    ? "✓ Match"
                    : result.status === "partial"
                      ? "~ Partial"
                      : "✗ Mismatch"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {matchCount === total && (
        <p
          className="mt-4 text-center"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1rem",
            color: "#2D6A4F",
            fontStyle: "italic",
          }}
        >
          Implementation validated — results within expected margin.
        </p>
      )}
    </div>
  );
}
