# PaperPilot

**arXiv Paper → Working Code, Autonomously**

Paste a research paper URL. Get a validated, documented Python implementation in minutes. Every function traces back to the paper.

🔗 **[Try it live →](https://paperpilot-coral.vercel.app)**

---

## What It Does

PaperPilot takes an arXiv paper URL and autonomously produces a working, validated Python implementation using a 5-stage AI pipeline powered by **GLM 5.1**:

1. **Read** — Fetches the full paper text (HTML or PDF) from arXiv
2. **Extract** — Identifies the core algorithm, parameters, equations, and reported results
3. **Plan** — Designs a modular implementation architecture with file structure and function signatures
4. **Implement** — Generates typed, documented Python code with paper-referencing comments
5. **Validate** — Compares implementation output against the paper's reported metrics

The entire pipeline streams in real-time so you can watch the AI think, plan, and build.

## The X-Factor: Paper-Referencing Code

Every generated function includes docstrings that cite specific paper sections and equations:

```python
def scaled_dot_product_attention(Q, K, V, mask=None):
    """
    Compute Scaled Dot-Product Attention.
    Implements Equation 1 from Section 3.2.1 of the paper:
    Attention(Q, K, V) = softmax(QK^T / sqrt(d_k))V
    See also: Section 3.2.2 for Multi-Head Attention.
    """
```

This isn't just code generation — it's **code that understands its own provenance**. Every function traces back to the source material, like academic citations in software form.

## How It Works

1. Paste an arXiv URL (e.g., `https://arxiv.org/abs/1706.03762`)
2. Click **Implement**
3. Watch GLM 5.1 read the paper, extract the algorithm, plan the architecture, and write the code — all streaming in real-time
4. Review the validation results comparing implementation output to the paper's reported metrics
5. Download the complete implementation package

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Next.js Frontend                         │
│  Landing Page → Pipeline UI (SSE streaming, real-time updates)   │
└───────────────────────────┬─────────────────────────────────────┘
                            │ POST /api/pipeline/stream
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Pipeline Orchestrator                         │
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────┐  ┌───────────┐  ┌──────┐ │
│  │  Fetch    │→ │ Extract  │→ │ Plan │→ │ Implement │→ │Valid.│ │
│  │ (arXiv)  │  │ (GLM5.1) │  │(GLM) │  │  (GLM)    │  │(GLM) │ │
│  └──────────┘  └──────────┘  └──────┘  └───────────┘  └──────┘ │
│                                                                   │
│  SSE events emitted at each stage for real-time UI updates        │
└─────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

- **SSE within POST request**: The pipeline runs inside the streaming response handler to keep Vercel's serverless function alive for the full ~90-second pipeline execution.
- **GLM 5.1's 200K context**: The full paper text is sent in a single prompt, leveraging GLM's massive context window for deep comprehension.
- **Mental execution validation**: Instead of running generated code (which requires execution infrastructure), GLM analyzes the code and predicts outputs — comparing against the paper's reported results.
- **Robust JSON parsing**: A custom parser handles common LLM quirks (markdown fences, unescaped newlines, trailing commas) for reliable structured output.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 (App Router), TypeScript, TailwindCSS v4 |
| **AI** | GLM 5.1 via Z.ai API, Vercel AI SDK v6 |
| **Streaming** | Server-Sent Events (SSE) |
| **Paper Parsing** | arXiv API (metadata), pdf-parse (PDF text extraction) |
| **Design** | "Academic Modernism" — Instrument Serif, Source Sans 3, warm palette |
| **Deployment** | Vercel |

## Getting Started

```bash
# Clone the repository
git clone https://github.com/hwin-agent/paperpilot.git
cd paperpilot

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your GLM API key to .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GLM_API_KEY` | Yes* | GLM 5.1 API key from Z.ai |
| `OPENAI_API_KEY` | No | Fallback for development testing |

*If no GLM key is set, falls back to OpenAI if `OPENAI_API_KEY` is available.

## Built For

[Build with GLM 5.1 Challenge](https://build-with-glm-5-1-challenge.devpost.com/) by Z.AI

## License

MIT
