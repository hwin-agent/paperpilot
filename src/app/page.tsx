import Link from "next/link";

const EXAMPLE_LINES = [
  { text: "def compute_centroids(X, labels, k):", type: "code" },
  { text: '    """', type: "string" },
  { text: "    Update cluster centroids via mean assignment.", type: "string" },
  {
    text: "    Implements Equation 4 from Section 3.2 of the paper.",
    type: "paperRef",
  },
  {
    text: "    See also: Convergence proof in Theorem 1, Section 4.",
    type: "paperRef",
  },
  { text: "", type: "blank" },
  { text: "    Args:", type: "string" },
  {
    text: "        X: Input data matrix (n_samples, n_features)",
    type: "string",
  },
  { text: "        labels: Cluster assignments for each sample", type: "string" },
  { text: "        k: Number of clusters", type: "string" },
  { text: "    Returns:", type: "string" },
  {
    text: "        Updated centroid positions (k, n_features)",
    type: "string",
  },
  { text: '    """', type: "string" },
  { text: "    centroids = np.zeros((k, X.shape[1]))", type: "code" },
  { text: "    for i in range(k):", type: "code" },
  { text: "        mask = labels == i", type: "code" },
  { text: "        if mask.sum() > 0:", type: "code" },
  { text: "            centroids[i] = X[mask].mean(axis=0)", type: "code" },
  { text: "    return centroids", type: "code" },
];

function highlightLine(line: { text: string; type: string }, lineNum: number) {
  const C = {
    keyword: "#CBA6F7",
    string: "#A6E3A1",
    number: "#FAB387",
    function: "#89B4FA",
    operator: "#89DCEB",
    builtin: "#F9E2AF",
    default: "#CDD6F4",
    paperRef: "#F5C2E7",
    lineNum: "#585B70",
  };

  if (line.type === "blank") {
    return (
      <div key={lineNum} className="flex" style={{ height: "1.7em" }}>
        <span
          className="select-none shrink-0 text-right pr-4"
          style={{
            width: "2.5rem",
            fontSize: "0.75rem",
            color: C.lineNum,
            fontFamily: "var(--font-mono)",
          }}
        >
          {lineNum}
        </span>
      </div>
    );
  }

  const isPaperRef = line.type === "paperRef";

  return (
    <div key={lineNum} className="flex">
      <span
        className="select-none shrink-0 text-right pr-4"
        style={{
          width: "2.5rem",
          fontSize: "0.75rem",
          color: C.lineNum,
          fontFamily: "var(--font-mono)",
        }}
      >
        {lineNum}
      </span>
      <span
        className="block w-full px-1"
        style={{
          backgroundColor: isPaperRef ? "#2A2A3E" : "transparent",
          borderLeft: isPaperRef
            ? "2px solid #C8432B"
            : "2px solid transparent",
        }}
      >
        {line.type === "string" || line.type === "paperRef" ? (
          <span
            style={{
              color: isPaperRef ? C.paperRef : C.string,
              fontStyle: isPaperRef ? "italic" : "normal",
            }}
          >
            {line.text}
          </span>
        ) : (
          <HighlightCode text={line.text} />
        )}
      </span>
    </div>
  );
}

function HighlightCode({ text }: { text: string }) {
  const C = {
    keyword: "#CBA6F7",
    string: "#A6E3A1",
    number: "#FAB387",
    function: "#89B4FA",
    operator: "#89DCEB",
    builtin: "#F9E2AF",
    default: "#CDD6F4",
  };

  const KEYWORDS = new Set([
    "def",
    "class",
    "return",
    "if",
    "for",
    "in",
    "range",
  ]);
  const BUILTINS = new Set(["np", "sum"]);

  const tokens: { text: string; color: string }[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    // Whitespace
    const wsMatch = remaining.match(/^\s+/);
    if (wsMatch) {
      tokens.push({ text: wsMatch[0], color: C.default });
      remaining = remaining.slice(wsMatch[0].length);
      continue;
    }

    // Numbers
    const numMatch = remaining.match(/^\d+/);
    if (numMatch) {
      tokens.push({ text: numMatch[0], color: C.number });
      remaining = remaining.slice(numMatch[0].length);
      continue;
    }

    // Words
    const wordMatch = remaining.match(/^\w+/);
    if (wordMatch) {
      const w = wordMatch[0];
      let color = C.default;
      if (KEYWORDS.has(w)) color = C.keyword;
      else if (BUILTINS.has(w)) color = C.builtin;
      else if (remaining.slice(w.length).match(/^\s*\(/)) color = C.function;
      tokens.push({ text: w, color });
      remaining = remaining.slice(w.length);
      continue;
    }

    // Operators
    const opMatch = remaining.match(/^[+\-*/%=<>!&|^~:().,\[\]]+/);
    if (opMatch) {
      tokens.push({ text: opMatch[0], color: C.operator });
      remaining = remaining.slice(opMatch[0].length);
      continue;
    }

    tokens.push({ text: remaining[0], color: C.default });
    remaining = remaining.slice(1);
  }

  return (
    <>
      {tokens.map((t, i) => (
        <span key={i} style={{ color: t.color }}>
          {t.text}
        </span>
      ))}
    </>
  );
}

const STAGES = [
  { label: "Read", desc: "Parse the full paper in 200K context" },
  { label: "Extract", desc: "Identify algorithms, parameters, equations" },
  { label: "Plan", desc: "Design modular implementation architecture" },
  { label: "Implement", desc: "Write typed, documented Python code" },
  { label: "Validate", desc: "Compare output against paper's results" },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#FAF8F5]">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-6 pt-32 pb-24">
        <h1
          className="text-center leading-tight text-[#1A1A2E] stagger-1"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            letterSpacing: "-0.02em",
          }}
        >
          arXiv Paper → Working Code
        </h1>
        <p
          className="mt-6 text-center max-w-xl text-[#6B6570] leading-relaxed stagger-2"
          style={{ fontFamily: "var(--font-sans)", fontSize: "1.125rem" }}
        >
          Paste a research paper URL. Get a validated, documented implementation
          in minutes. Every function traces back to the paper.
        </p>
        <Link
          href="/pipeline"
          className="mt-10 inline-flex items-center justify-center rounded-[6px] bg-[#C8432B] text-white font-semibold px-8 py-3.5 hover:bg-[#A83520] transition-colors stagger-3"
          style={{ fontFamily: "var(--font-sans)", fontSize: "1rem" }}
        >
          Try PaperPilot
        </Link>
        <p
          className="mt-4 text-[#9B9498] stagger-3"
          style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem" }}
        >
          Powered by GLM 5.1 · No signup required
        </p>
      </section>

      {/* How It Works */}
      <section className="px-6 pb-24 stagger-4">
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-left mb-10 text-[#1A1A2E]"
            style={{ fontFamily: "var(--font-serif)", fontSize: "1.75rem" }}
          >
            Five stages. One pipeline.
          </h2>
          <div className="flex items-start justify-between gap-2">
            {STAGES.map((stage, i) => (
              <div key={stage.label} className="flex items-start flex-1">
                <div className="flex flex-col items-start text-left flex-1">
                  <div className="flex items-center gap-2.5 mb-2">
                    <span
                      className="text-[#9B9498]"
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.7rem",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div
                      style={{
                        width: "20px",
                        height: "1px",
                        backgroundColor: "#D5CEC5",
                      }}
                    />
                  </div>
                  <p
                    className="text-[#1A1A2E] uppercase tracking-wider"
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                    }}
                  >
                    {stage.label}
                  </p>
                  <p
                    className="mt-1 text-[#6B6570]"
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.8rem",
                      lineHeight: "1.4",
                    }}
                  >
                    {stage.desc}
                  </p>
                </div>
                {i < STAGES.length - 1 && (
                  <div
                    className="mt-5 shrink-0 w-6 h-px bg-[#D5CEC5] opacity-50"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example Output */}
      <section className="px-6 pb-24 stagger-4">
        <div className="max-w-2xl mx-auto">
          <div className="overflow-hidden rounded-[6px] border border-[#D5CEC5]">
            <div className="px-4 py-2.5 flex items-center gap-3 bg-[#252536] border-b border-[#383850]">
              <div className="flex items-center gap-1.5">
                <div
                  className="rounded-full"
                  style={{
                    width: "8px",
                    height: "8px",
                    backgroundColor: "#F38BA8",
                    opacity: 0.6,
                  }}
                />
                <div
                  className="rounded-full"
                  style={{
                    width: "8px",
                    height: "8px",
                    backgroundColor: "#F9E2AF",
                    opacity: 0.6,
                  }}
                />
                <div
                  className="rounded-full"
                  style={{
                    width: "8px",
                    height: "8px",
                    backgroundColor: "#A6E3A1",
                    opacity: 0.6,
                  }}
                />
              </div>
              <span
                className="text-[#CDD6F4] opacity-70"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                }}
              >
                algorithm.py
              </span>
            </div>
            <pre
              className="py-4 overflow-x-auto bg-[#1E1E2E]"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.8rem",
                lineHeight: "1.7",
              }}
            >
              <code>
                {EXAMPLE_LINES.map((line, i) => highlightLine(line, i + 1))}
              </code>
            </pre>
          </div>
          <p
            className="mt-5 text-[#6B6570]"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1rem",
              fontStyle: "italic",
            }}
          >
            Every function traces back to the paper.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 border-t border-[#D5CEC5]">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <p
            className="text-[#9B9498]"
            style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem" }}
          >
            Built for the{" "}
            <a
              href="https://build-with-glm-5-1-challenge.devpost.com/"
              target="_blank"
              rel="noopener"
              className="text-[#C8432B] underline hover:text-[#A83520]"
            >
              GLM 5.1 Challenge
            </a>{" "}
            · Powered by{" "}
            <a
              href="https://z.ai"
              target="_blank"
              rel="noopener"
              className="text-[#C8432B] underline hover:text-[#A83520]"
            >
              Z.ai
            </a>
          </p>
          <a
            href="https://github.com/hwin-agent/paperpilot"
            target="_blank"
            rel="noopener"
            className="text-[#9B9498] hover:text-[#6B6570] transition-colors"
            style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem" }}
          >
            GitHub ↗
          </a>
        </div>
      </footer>
    </main>
  );
}
