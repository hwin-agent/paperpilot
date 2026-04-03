export interface PaperMetadata {
  title: string;
  authors: string[];
  abstract: string;
  arxivId: string;
}

export interface AlgorithmExtraction {
  algorithmName: string;
  description: string;
  inputs: string;
  outputs: string;
  keyParameters: { name: string; description: string }[];
  coreSteps: string[];
  reportedResults: { metric: string; value: string }[];
  keyEquations: { id: string; description: string; section: string }[];
}

export interface ImplementationPlan {
  files: { filename: string; description: string }[];
  functions: { name: string; signature: string; description: string }[];
  dependencies: string[];
  validationStrategy: string;
  rationale: string;
}

export interface GeneratedFile {
  filename: string;
  content: string;
}

export interface ValidationResult {
  metric: string;
  paperValue: string;
  implementationValue: string;
  status: "match" | "partial" | "mismatch";
}

export type PipelineStage =
  | "idle"
  | "fetching"
  | "reading"
  | "extracting"
  | "planning"
  | "implementing"
  | "validating"
  | "complete"
  | "error";

export interface PipelineEvent {
  stage: PipelineStage;
  message?: string;
  data?: Record<string, unknown>;
}

export interface PipelineRun {
  id: string;
  status: "running" | "complete" | "error";
  arxivUrl: string;
  stage: PipelineStage;
  paperMetadata?: PaperMetadata;
  paperText?: string;
  extraction?: AlgorithmExtraction;
  plan?: ImplementationPlan;
  files?: GeneratedFile[];
  validation?: ValidationResult[];
  error?: string;
  events: PipelineEvent[];
  createdAt: Date;
}
