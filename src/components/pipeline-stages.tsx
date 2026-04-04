"use client";

import type { PipelineStage } from "@/lib/types";

const STAGES: { key: PipelineStage; label: string }[] = [
  { key: "fetching", label: "Fetch" },
  { key: "extracting", label: "Extract" },
  { key: "planning", label: "Plan" },
  { key: "implementing", label: "Implement" },
  { key: "validating", label: "Validate" },
];

interface Props {
  currentStage: PipelineStage;
  completedStages: Set<PipelineStage>;
}

export function PipelineStages({ currentStage, completedStages }: Props) {
  const getStageState = (
    stageKey: PipelineStage
  ): "pending" | "active" | "complete" => {
    if (completedStages.has(stageKey)) return "complete";
    if (stageKey === "extracting" && currentStage === "reading") return "active";
    if (stageKey === currentStage) return "active";
    return "pending";
  };

  return (
    <div className="flex items-center gap-1.5">
      {STAGES.map((stage, i) => {
        const state = getStageState(stage.key);
        return (
          <div key={stage.key} className="flex items-center gap-1.5 flex-1">
            <div
              className={`flex items-center justify-center gap-2 flex-1 py-3 px-3 transition-all duration-300 ${
                state === "active" ? "animate-pulse-ring" : ""
              } ${state === "complete" ? "animate-success-glow" : ""}`}
              style={{
                borderRadius: "6px",
                border:
                  state === "active"
                    ? "2px solid #C8432B"
                    : state === "complete"
                      ? "2px solid #2D6A4F"
                      : "1px solid #D5CEC5",
                backgroundColor:
                  state === "active"
                    ? "#FFF8F6"
                    : state === "complete"
                      ? "#F0FAF4"
                      : "transparent",
              }}
            >
              {state === "active" && (
                <span
                  className="inline-block flex-shrink-0"
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "#C8432B",
                    animation: "pulseRing 2s ease-out infinite",
                  }}
                />
              )}
              {state === "complete" && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  className="flex-shrink-0 animate-check"
                >
                  <path
                    d="M3 7L6 10L11 4"
                    stroke="#2D6A4F"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color:
                    state === "active"
                      ? "#C8432B"
                      : state === "complete"
                        ? "#2D6A4F"
                        : "#9B9498",
                  transition: "color 0.3s ease",
                }}
              >
                {stage.label}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <div
                className="flex-shrink-0 transition-all duration-500"
                style={{
                  width: "16px",
                  height: state === "complete" ? "2px" : "1px",
                  backgroundColor:
                    state === "complete" ? "#2D6A4F" : "#D5CEC5",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
