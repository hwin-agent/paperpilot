import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";

/**
 * LLM provider configuration.
 * Uses GLM 5.1 via Z.ai/BigModel API when GLM_API_KEY is set.
 * Falls back to OpenAI for development/testing if OPENAI_API_KEY is set.
 */
function getProvider() {
  // Primary: GLM 5.1 via Z.ai
  if (process.env.GLM_API_KEY && process.env.GLM_API_KEY !== "07cc****") {
    return {
      provider: createOpenAICompatible({
        name: "glm",
        apiKey: process.env.GLM_API_KEY,
        baseURL: "https://api.z.ai/api/coding/paas/v4",
      }),
      modelId: "glm-5.1",
      name: "GLM 5.1",
    };
  }

  // Fallback: OpenAI for development testing
  if (process.env.OPENAI_API_KEY) {
    return {
      provider: createOpenAICompatible({
        name: "openai",
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: "https://api.openai.com/v1",
      }),
      modelId: "gpt-4o-mini",
      name: "OpenAI (dev fallback)",
    };
  }

  throw new Error("No LLM API key configured. Set GLM_API_KEY or OPENAI_API_KEY.");
}

export function getModelInfo() {
  const { name, modelId } = getProvider();
  return { name, modelId };
}

export async function callGLM(
  systemPrompt: string,
  userPrompt: string,
  options?: { maxTokens?: number }
): Promise<string> {
  const { provider, modelId, name } = getProvider();
  console.log(`[PaperPilot] Using ${name} (${modelId})`);

  const { text } = await generateText({
    model: provider.chatModel(modelId),
    system: systemPrompt,
    prompt: userPrompt,
    maxOutputTokens: options?.maxTokens ?? 8192,
  });
  return text;
}
