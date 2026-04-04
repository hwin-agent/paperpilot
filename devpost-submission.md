# Devpost Submission — PaperPilot

> Reference text for submission fields at build-with-glm-5-1-challenge.devpost.com

---

## Tagline
arXiv Paper → Working Code, Autonomously

## What it does

PaperPilot transforms academic research papers into working Python implementations. You paste an arXiv URL, and within minutes, an AI-powered pipeline reads the entire paper, extracts the core algorithm, designs a modular implementation, writes production-quality code, and validates the output against the paper's own reported results — all streaming in real-time.

The secret weapon: every generated function includes docstrings that cite the specific paper sections and equations they implement. The code doesn't just work — it knows where it came from.

## How we built it

We built PaperPilot as a Next.js 15 application with a 5-stage AI pipeline powered by **GLM 5.1**:

1. **Paper Fetching**: arXiv API for metadata + HTML/PDF text extraction
2. **Algorithm Extraction**: GLM 5.1 reads the full paper text (leveraging its 200K context window) and identifies the core algorithm, parameters, equations, and reported results
3. **Implementation Planning**: GLM 5.1 designs a modular file structure with typed function signatures
4. **Code Generation**: GLM 5.1 writes complete Python implementations with paper-referencing docstrings — our X-factor
5. **Validation**: GLM 5.1 analyzes the generated code against the paper's reported metrics

The entire pipeline streams via Server-Sent Events so users can watch the AI think, plan, and build in real-time. We chose to run the pipeline inside the SSE response handler to keep Vercel's serverless function alive for the full ~90-second execution.

The design follows an "Academic Modernism" aesthetic — Instrument Serif headlines, a warm parchment palette, and Catppuccin-inspired syntax highlighting that makes paper references glow.

**Tech stack:** Next.js 15, TypeScript, TailwindCSS v4, Vercel AI SDK v6, GLM 5.1 via Z.ai, arXiv API, pdf-parse, Vercel.

## Challenges we ran into

**Paper text extraction** was harder than expected. arXiv papers come as PDFs with complex layouts, math notation, and multi-column formats. We used a hybrid approach: try the HTML version first (cleaner text), fall back to PDF parsing. Even then, we limit context to 150K characters to stay within token budgets.

**LLM JSON reliability** was a constant battle. GLM 5.1 occasionally outputs JSON wrapped in markdown fences, with trailing commas, or with unescaped newlines inside strings (especially in code blocks). We built a robust parser that handles all these quirks — stripping fences, finding JSON boundaries, and even a character-by-character state machine to fix unescaped newlines inside JSON string values.

**Vercel serverless timeouts** forced us to rethink the architecture. Our pipeline takes 60-90 seconds, but serverless functions have execution limits. The solution: run the entire pipeline inside the SSE streaming response handler, so the function stays alive as long as the client is connected.

## What we learned

GLM 5.1's 200K context window is genuinely game-changing for paper comprehension. Being able to send the entire paper text in a single prompt — not chunks, not summaries — produces dramatically better algorithm extraction. The model can cross-reference equations in Section 3 with experimental setup in Section 5 because it sees everything at once.

We also learned that the "paper-referencing docstrings" feature (our X-factor) works best when you're explicit in the system prompt about tracing every function back to the paper. GLM 5.1 takes this instruction seriously and produces code that feels like it was written by someone who actually read the paper.

## Built with

Next.js, TypeScript, TailwindCSS, GLM 5.1, Vercel AI SDK, arXiv API, Vercel

## Try it out

- **Live app:** https://paperpilot-coral.vercel.app
- **GitHub:** https://github.com/hwin-agent/paperpilot

## Tracks

- Open Ended
- Productivity
