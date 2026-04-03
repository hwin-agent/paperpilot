"use client";

import { useState } from "react";
import type { GeneratedFile } from "@/lib/types";

interface Props {
  files: GeneratedFile[];
}

export function CodeViewer({ files }: Props) {
  const [activeTab, setActiveTab] = useState(0);

  if (files.length === 0) return null;

  const activeFile = files[activeTab] ?? files[0];

  return (
    <div
      style={{
        borderRadius: "6px",
        border: "1px solid #D5CEC5",
        overflow: "hidden",
      }}
    >
      {/* Label */}
      <div
        className="px-4 py-2 flex items-center justify-between"
        style={{
          backgroundColor: "#F2EDE7",
          borderBottom: "1px solid #D5CEC5",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
            fontSize: "0.75rem",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "#C8432B",
          }}
        >
          Generated Code
        </span>
      </div>

      {/* Tabs */}
      <div
        className="flex"
        style={{
          backgroundColor: "#252536",
          borderBottom: "1px solid #383850",
        }}
      >
        {files.map((file, i) => (
          <button
            key={file.filename}
            onClick={() => setActiveTab(i)}
            className="px-4 py-2 transition-colors"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.8rem",
              color: i === activeTab ? "#CDD6F4" : "#585B70",
              backgroundColor: i === activeTab ? "#1E1E2E" : "transparent",
              borderBottom:
                i === activeTab ? "2px solid #C8432B" : "2px solid transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            {file.filename}
          </button>
        ))}
      </div>

      {/* Code Content */}
      <div
        className="overflow-auto"
        style={{
          backgroundColor: "#1E1E2E",
          maxHeight: "480px",
        }}
      >
        <pre className="p-4">
          <code
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.8rem",
              lineHeight: "1.7",
            }}
          >
            {activeFile.content.split("\n").map((line, i) => (
              <div key={i} className="flex">
                <span
                  className="select-none flex-shrink-0 text-right pr-4"
                  style={{
                    width: "3rem",
                    color: "#585B70",
                    fontSize: "0.75rem",
                  }}
                >
                  {i + 1}
                </span>
                <span
                  style={{
                    color: isCommentLine(line) ? "#A6ADC8" : "#CDD6F4",
                    backgroundColor:
                      isPaperReference(line) ? "#2A2A3E" : "transparent",
                    display: "block",
                    width: "100%",
                    paddingLeft: "4px",
                    paddingRight: "4px",
                  }}
                >
                  {highlightLine(line)}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}

function isCommentLine(line: string): boolean {
  const trimmed = line.trim();
  return (
    trimmed.startsWith("#") ||
    trimmed.startsWith('"""') ||
    trimmed.startsWith("'''") ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  );
}

function isPaperReference(line: string): boolean {
  const lower = line.toLowerCase();
  return (
    lower.includes("section") ||
    lower.includes("equation") ||
    lower.includes("theorem") ||
    lower.includes("lemma") ||
    lower.includes("paper") ||
    lower.includes("eq.") ||
    lower.includes("sec.")
  );
}

function highlightLine(line: string): string {
  // Simple highlighting — just return the line as-is for now
  // Syntax highlighting is handled by color differentiation
  return line;
}
