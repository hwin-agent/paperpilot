# PaperPilot

**arXiv Paper → Working Code**

Paste a research paper URL. Get a validated, documented implementation in minutes. Every function traces back to the paper.

## What It Does

PaperPilot takes an arXiv paper URL and autonomously produces a working, validated Python implementation using a 5-stage pipeline:

1. **Read** — Fetches and parses the full paper text
2. **Extract** — Identifies the core algorithm, parameters, equations, and reported results
3. **Plan** — Designs a modular implementation architecture
4. **Implement** — Generates typed, documented Python code with paper-referencing comments
5. **Validate** — Compares implementation output against the paper's reported metrics

### The X-Factor: Paper-Referencing Code

Every generated function includes docstrings that cite specific paper sections and equations:

```python
def compute_centroids(X, labels, k):
    """
    Update cluster centroids via mean assignment.
    Implements Equation 4 from Section 3.2 of the paper.
    See also: Convergence proof in Theorem 1, Section 4.
    """
```

## Tech Stack

- **Frontend:** Next.js 15 + TypeScript + TailwindCSS
- **AI:** GLM 5.1 via Z.ai API (200K context window)
- **Streaming:** Server-Sent Events for real-time pipeline updates
- **Design:** "Academic Modernism" — serif headlines, warm palette, scholarly feel
- **Deployment:** Vercel

## Getting Started

```bash
npm install
echo "GLM_API_KEY=your_key_here" > .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How It Works

1. Paste an arXiv URL (e.g., `https://arxiv.org/abs/2301.12345`)
2. Click "Implement"
3. Watch GLM 5.1 read the paper, extract the algorithm, plan the architecture, and write the code — all streaming in real-time
4. Review the validation results comparing implementation output to the paper's reported metrics
5. Download the complete implementation package

## Built For

[Build with GLM 5.1 Challenge](https://build-with-glm-5-1-challenge.devpost.com/) by Z.AI

## License

MIT
