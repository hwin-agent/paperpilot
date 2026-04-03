import Link from "next/link";

const EXAMPLE_CODE = `def compute_centroids(X, labels, k):
    """
    Update cluster centroids via mean assignment.
    Implements Equation 4 from Section 3.2 of the paper.
    See also: Convergence proof in Theorem 1, Section 4.

    Args:
        X: Input data matrix (n_samples, n_features)
        labels: Cluster assignments for each sample
        k: Number of clusters
    Returns:
        Updated centroid positions (k, n_features)
    """
    centroids = np.zeros((k, X.shape[1]))
    for i in range(k):
        mask = labels == i
        if mask.sum() > 0:
            centroids[i] = X[mask].mean(axis=0)
    return centroids`;

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
          className="text-center leading-tight text-[#1A1A2E]"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            letterSpacing: "-0.02em",
          }}
        >
          arXiv Paper → Working Code
        </h1>
        <p
          className="mt-6 text-center max-w-xl text-[#6B6570] leading-relaxed"
          style={{ fontFamily: "var(--font-sans)", fontSize: "1.125rem" }}
        >
          Paste a research paper URL. Get a validated, documented implementation
          in minutes. Every function traces back to the paper.
        </p>
        <Link
          href="/pipeline"
          className="mt-10 inline-flex items-center justify-center rounded-[6px] bg-[#C8432B] text-white font-semibold px-8 py-3.5 hover:bg-[#A83520] transition-colors"
          style={{ fontFamily: "var(--font-sans)", fontSize: "1rem" }}
        >
          Try PaperPilot
        </Link>
        <p
          className="mt-4 text-[#9B9498]"
          style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem" }}
        >
          Powered by GLM 5.1 · No signup required
        </p>
      </section>

      {/* How It Works */}
      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-center mb-12 text-[#1A1A2E]"
            style={{ fontFamily: "var(--font-serif)", fontSize: "1.75rem" }}
          >
            How It Works
          </h2>
          <div className="flex items-start justify-between gap-2">
            {STAGES.map((stage, i) => (
              <div key={stage.label} className="flex items-start flex-1">
                <div className="flex flex-col items-center text-center flex-1">
                  <div
                    className="flex items-center justify-center w-9 h-9 rounded-[6px] border border-[#D5CEC5] text-[#6B6570]"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.8rem",
                    }}
                  >
                    {i + 1}
                  </div>
                  <p
                    className="mt-3 text-[#1A1A2E] uppercase tracking-wider"
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
                  <div className="mt-4 shrink-0 w-6 h-px bg-[#D5CEC5]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example Output */}
      <section className="px-6 pb-20">
        <div className="max-w-2xl mx-auto">
          <div className="overflow-hidden rounded-[6px] border border-[#D5CEC5]">
            <div className="px-4 py-2 flex items-center gap-2 bg-[#2A2A3E] border-b border-[#383850]">
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
              className="p-5 overflow-x-auto bg-[#1E1E2E] text-[#CDD6F4]"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.8rem",
                lineHeight: "1.7",
              }}
            >
              <code>{EXAMPLE_CODE}</code>
            </pre>
          </div>
          <p
            className="mt-4 text-center text-[#6B6570] italic"
            style={{ fontFamily: "var(--font-serif)", fontSize: "1rem" }}
          >
            Every function traces back to the paper.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 text-center border-t border-[#D5CEC5]">
        <p
          className="text-[#9B9498]"
          style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem" }}
        >
          Built for the GLM 5.1 Challenge · Powered by{" "}
          <a
            href="https://z.ai"
            target="_blank"
            rel="noopener"
            className="text-[#C8432B] underline hover:text-[#A83520]"
          >
            Z.ai
          </a>
        </p>
      </footer>
    </main>
  );
}
