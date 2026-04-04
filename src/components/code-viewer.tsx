"use client";

import { useState, type ReactNode } from "react";
import type { GeneratedFile } from "@/lib/types";

interface Props {
  files: GeneratedFile[];
}

export function CodeViewer({ files }: Props) {
  const [activeTab, setActiveTab] = useState(0);

  if (files.length === 0) return null;

  const activeFile = files[activeTab] ?? files[0];
  const lineCount = activeFile.content.split("\n").length;

  return (
    <div className="rounded-[6px] border border-[#D5CEC5] overflow-hidden">
      {/* Label */}
      <div className="px-4 py-2 flex items-center justify-between bg-[#F2EDE7] border-b border-[#D5CEC5]">
        <span
          className="font-semibold text-[0.75rem] tracking-wider uppercase text-[#C8432B]"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Generated Code
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            color: "#9B9498",
          }}
        >
          {files.length} files · {lineCount} lines
        </span>
      </div>

      {/* Tabs with window chrome */}
      <div className="flex items-center bg-[#252536] border-b border-[#383850]">
        <div className="flex items-center gap-1.5 pl-4 pr-3">
          <div
            className="rounded-full"
            style={{ width: "8px", height: "8px", backgroundColor: "#F38BA8", opacity: 0.5 }}
          />
          <div
            className="rounded-full"
            style={{ width: "8px", height: "8px", backgroundColor: "#F9E2AF", opacity: 0.5 }}
          />
          <div
            className="rounded-full"
            style={{ width: "8px", height: "8px", backgroundColor: "#A6E3A1", opacity: 0.5 }}
          />
        </div>
        <div className="flex">
          {files.map((file, i) => (
            <button
              key={file.filename}
              onClick={() => setActiveTab(i)}
              className="px-4 py-2.5 border-none cursor-pointer relative"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.8rem",
                color: i === activeTab ? "#CDD6F4" : "#585B70",
                backgroundColor: i === activeTab ? "#1E1E2E" : "transparent",
                transition: "color 0.2s ease, background-color 0.2s ease",
              }}
            >
              {file.filename}
              {i === activeTab && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "2px",
                    backgroundColor: "#C8432B",
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Code Content */}
      <div
        className="overflow-auto bg-[#1E1E2E]"
        style={{ maxHeight: "480px" }}
      >
        <pre className="p-4">
          <code
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.8rem",
              lineHeight: "1.7",
            }}
          >
            {activeFile.content.split("\n").map((line, i) => {
              const hasPaperRef = isPaperReference(line);
              return (
                <div key={i} className="flex">
                  <span
                    className="select-none shrink-0 text-right pr-4 text-[#585B70]"
                    style={{ width: "3rem", fontSize: "0.75rem" }}
                  >
                    {i + 1}
                  </span>
                  <span
                    className="block w-full px-1"
                    style={{
                      backgroundColor: hasPaperRef
                        ? "#2A2A3E"
                        : "transparent",
                      borderLeft: hasPaperRef
                        ? "2px solid #C8432B"
                        : "2px solid transparent",
                      transition: "background-color 0.15s ease",
                    }}
                  >
                    {highlightPython(line)}
                  </span>
                </div>
              );
            })}
          </code>
        </pre>
      </div>
    </div>
  );
}

function isPaperReference(line: string): boolean {
  const lower = line.toLowerCase();
  return (
    lower.includes("section") ||
    lower.includes("equation") ||
    lower.includes("theorem") ||
    lower.includes("lemma") ||
    lower.includes("eq.") ||
    lower.includes("sec.") ||
    (lower.includes("paper") &&
      (lower.includes("#") ||
        lower.includes('"""') ||
        lower.includes("'''")))
  );
}

// Catppuccin Mocha-inspired palette
const C = {
  keyword: "#CBA6F7", // mauve
  builtin: "#F9E2AF", // yellow
  string: "#A6E3A1", // green
  comment: "#6C7086", // overlay0
  number: "#FAB387", // peach
  decorator: "#F38BA8", // red
  function: "#89B4FA", // blue
  operator: "#89DCEB", // sky
  default: "#CDD6F4", // text
  paperRef: "#F5C2E7", // pink — makes paper references pop
};

function highlightPython(line: string): ReactNode {
  const trimmed = line.trim();

  // Full-line comment
  if (trimmed.startsWith("#")) {
    const indent = line.match(/^(\s*)/)?.[1] ?? "";
    const commentText = line.slice(indent.length);
    if (isPaperReference(line)) {
      return (
        <>
          <span style={{ color: C.default }}>{indent}</span>
          <span style={{ color: C.paperRef, fontStyle: "italic" }}>
            {commentText}
          </span>
        </>
      );
    }
    return (
      <>
        <span style={{ color: C.default }}>{indent}</span>
        <span style={{ color: C.comment, fontStyle: "italic" }}>
          {commentText}
        </span>
      </>
    );
  }

  // Docstring lines (inside triple quotes)
  if (
    trimmed.startsWith('"""') ||
    trimmed.startsWith("'''") ||
    trimmed.endsWith('"""') ||
    trimmed.endsWith("'''")
  ) {
    if (isPaperReference(line)) {
      return (
        <span style={{ color: C.paperRef, fontStyle: "italic" }}>{line}</span>
      );
    }
    return <span style={{ color: C.string }}>{line}</span>;
  }

  // Docstring continuation (heuristic: indented line that looks like prose)
  if (
    trimmed &&
    !trimmed.includes("=") &&
    !trimmed.startsWith("def ") &&
    !trimmed.startsWith("class ") &&
    !trimmed.startsWith("return") &&
    !trimmed.startsWith("import") &&
    !trimmed.startsWith("from") &&
    trimmed.match(/^[A-Z]/) &&
    trimmed.match(/[.:)]$/)
  ) {
    if (isPaperReference(line)) {
      return (
        <span style={{ color: C.paperRef, fontStyle: "italic" }}>{line}</span>
      );
    }
  }

  // Token-level highlighting
  const tokens: ReactNode[] = [];
  let remaining = line;
  let key = 0;

  const KEYWORDS = new Set([
    "def",
    "class",
    "return",
    "if",
    "elif",
    "else",
    "for",
    "while",
    "in",
    "not",
    "and",
    "or",
    "is",
    "import",
    "from",
    "as",
    "with",
    "try",
    "except",
    "finally",
    "raise",
    "yield",
    "lambda",
    "pass",
    "break",
    "continue",
    "True",
    "False",
    "None",
    "assert",
    "global",
    "nonlocal",
  ]);

  const BUILTINS = new Set([
    "print",
    "len",
    "range",
    "int",
    "float",
    "str",
    "list",
    "dict",
    "set",
    "tuple",
    "type",
    "isinstance",
    "enumerate",
    "zip",
    "map",
    "filter",
    "sum",
    "min",
    "max",
    "abs",
    "sorted",
    "reversed",
    "any",
    "all",
    "super",
    "self",
    "np",
    "pd",
    "torch",
    "sklearn",
  ]);

  while (remaining.length > 0) {
    // String literals
    const strMatch = remaining.match(
      /^(f?r?b?)("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/
    );
    if (strMatch) {
      const full = strMatch[0];
      const hasPaperRef = isPaperReference(full);
      tokens.push(
        <span
          key={key++}
          style={{
            color: hasPaperRef ? C.paperRef : C.string,
            fontStyle: hasPaperRef ? "italic" : "normal",
          }}
        >
          {full}
        </span>
      );
      remaining = remaining.slice(full.length);
      continue;
    }

    // Decorator
    if (remaining.match(/^@\w+/)) {
      const match = remaining.match(/^@\w+(\.\w+)*/);
      if (match) {
        tokens.push(
          <span key={key++} style={{ color: C.decorator }}>
            {match[0]}
          </span>
        );
        remaining = remaining.slice(match[0].length);
        continue;
      }
    }

    // Numbers
    const numMatch = remaining.match(
      /^(\d+\.?\d*([eE][+-]?\d+)?|0[xX][0-9a-fA-F]+)/
    );
    if (
      numMatch &&
      (key === 0 || !/\w$/.test(String(tokens[tokens.length - 1])))
    ) {
      tokens.push(
        <span key={key++} style={{ color: C.number }}>
          {numMatch[0]}
        </span>
      );
      remaining = remaining.slice(numMatch[0].length);
      continue;
    }

    // Words (keywords, builtins, identifiers)
    const wordMatch = remaining.match(/^\w+/);
    if (wordMatch) {
      const word = wordMatch[0];
      let color = C.default;
      if (KEYWORDS.has(word)) color = C.keyword;
      else if (BUILTINS.has(word)) color = C.builtin;
      // Function call: word followed by (
      else if (remaining.slice(word.length).match(/^\s*\(/))
        color = C.function;

      tokens.push(
        <span key={key++} style={{ color }}>
          {word}
        </span>
      );
      remaining = remaining.slice(word.length);
      continue;
    }

    // Operators
    if (remaining.match(/^[+\-*/%=<>!&|^~:]+/)) {
      const match = remaining.match(/^[+\-*/%=<>!&|^~:]+/);
      if (match) {
        tokens.push(
          <span key={key++} style={{ color: C.operator }}>
            {match[0]}
          </span>
        );
        remaining = remaining.slice(match[0].length);
        continue;
      }
    }

    // Default: single character
    tokens.push(
      <span key={key++} style={{ color: C.default }}>
        {remaining[0]}
      </span>
    );
    remaining = remaining.slice(1);
  }

  return <>{tokens}</>;
}
