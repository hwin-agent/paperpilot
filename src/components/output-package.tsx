"use client";

import { useState } from "react";
import type { GeneratedFile } from "@/lib/types";

interface Props {
  files: GeneratedFile[];
  paperTitle: string;
}

export function OutputPackage({ files, paperTitle }: Props) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    // Download each file with a small delay between them
    files.forEach((file, i) => {
      setTimeout(() => {
        const blob = new Blob([file.content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.filename;
        a.click();
        URL.revokeObjectURL(url);
        if (i === files.length - 1) {
          setTimeout(() => setDownloading(false), 500);
        }
      }, i * 200);
    });
  };

  const totalLines = files.reduce(
    (sum, f) => sum + f.content.split("\n").length,
    0
  );

  return (
    <div
      className="animate-success-glow"
      style={{
        backgroundColor: "#F2EDE7",
        border: "1px solid #D5CEC5",
        borderRadius: "6px",
        padding: "24px",
      }}
    >
      <div className="flex items-center justify-between mb-5">
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
          Output Package
        </h3>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="transition-colors"
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
            fontSize: "0.85rem",
            color: downloading ? "#9B9498" : "#1A1A2E",
            backgroundColor: "transparent",
            border: `1px solid ${downloading ? "#D5CEC5" : "#1A1A2E"}`,
            borderRadius: "6px",
            padding: "8px 20px",
            cursor: downloading ? "default" : "pointer",
          }}
          onMouseOver={(e) => {
            if (!downloading) {
              e.currentTarget.style.backgroundColor = "#1A1A2E";
              e.currentTarget.style.color = "#fff";
            }
          }}
          onMouseOut={(e) => {
            if (!downloading) {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#1A1A2E";
            }
          }}
        >
          {downloading ? "Downloading…" : "Download Files"}
        </button>
      </div>

      {/* File Tree */}
      <div
        className="p-4"
        style={{
          backgroundColor: "#FAF8F5",
          borderRadius: "4px",
          border: "1px solid #D5CEC5",
        }}
      >
        <div
          className="mb-2"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.85rem",
            color: "#1A1A2E",
            fontWeight: 500,
          }}
        >
          paperpilot-output/
        </div>
        {files.map((file, i) => (
          <div
            key={file.filename}
            className="flex items-center gap-2 ml-4 animate-fade-in"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.8rem",
              color: "#6B6570",
              padding: "3px 0",
              animationDelay: `${i * 0.08}s`,
            }}
          >
            <span style={{ color: "#D5CEC5" }}>
              {i === files.length - 1 ? "└──" : "├──"}
            </span>
            <span style={{ color: "#1A1A2E" }}>{file.filename}</span>
            <span
              style={{
                fontSize: "0.7rem",
                color: "#9B9498",
                marginLeft: "auto",
              }}
            >
              {file.content.split("\n").length} lines
            </span>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div
        className="mt-5 pt-4 flex items-center justify-center gap-8"
        style={{
          borderTop: "1px solid #D5CEC5",
          fontFamily: "var(--font-sans)",
          fontSize: "0.85rem",
          color: "#6B6570",
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="animate-count"
            style={{ fontWeight: 600, color: "#1A1A2E", fontSize: "1.1rem" }}
          >
            {files.length}
          </span>
          <span>files</span>
        </div>
        <div
          style={{ width: "1px", height: "16px", backgroundColor: "#D5CEC5" }}
        />
        <div className="flex items-center gap-2">
          <span
            className="animate-count"
            style={{ fontWeight: 600, color: "#1A1A2E", fontSize: "1.1rem" }}
          >
            {totalLines}
          </span>
          <span>lines</span>
        </div>
        <div
          style={{ width: "1px", height: "16px", backgroundColor: "#D5CEC5" }}
        />
        <div className="flex items-center gap-2">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className="animate-check"
          >
            <path
              d="M3 7L6 10L11 4"
              stroke="#2D6A4F"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span style={{ color: "#2D6A4F", fontWeight: 600 }}>Validated</span>
        </div>
      </div>
    </div>
  );
}
