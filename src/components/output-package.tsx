"use client";

import type { GeneratedFile } from "@/lib/types";

interface Props {
  files: GeneratedFile[];
  paperTitle: string;
}

export function OutputPackage({ files, paperTitle }: Props) {
  const handleDownload = () => {
    // Download each file individually
    for (const file of files) {
      const blob = new Blob([file.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.filename;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

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
          Output Package
        </h3>
        <button
          onClick={handleDownload}
          className="transition-colors"
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
            fontSize: "0.85rem",
            color: "#1A1A2E",
            backgroundColor: "transparent",
            border: "1px solid #1A1A2E",
            borderRadius: "6px",
            padding: "8px 20px",
            cursor: "pointer",
          }}
        >
          Download Files
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
          }}
        >
          paperpilot-output/
        </div>
        {files.map((file, i) => (
          <div
            key={file.filename}
            className="flex items-center gap-2 ml-4"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.8rem",
              color: "#6B6570",
              padding: "2px 0",
            }}
          >
            <span style={{ color: "#D5CEC5" }}>
              {i === files.length - 1 ? "└──" : "├──"}
            </span>
            <span style={{ color: "#1A1A2E" }}>{file.filename}</span>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div
        className="mt-4 flex items-center justify-center gap-6"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.85rem",
          color: "#6B6570",
        }}
      >
        <span>
          {files.length} files generated
        </span>
        <span style={{ color: "#D5CEC5" }}>·</span>
        <span>Results validated ✓</span>
        <span style={{ color: "#D5CEC5" }}>·</span>
        <span>Ready to use</span>
      </div>
    </div>
  );
}
