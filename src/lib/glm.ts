import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";

const glm = createOpenAICompatible({
  name: "glm",
  apiKey: process.env.GLM_API_KEY ?? "",
  baseURL: "https://api.z.ai/api/paas/v4",
});

export function glmModel(modelId: string = "glm-4-plus") {
  return glm.chatModel(modelId);
}

export async function callGLM(
  systemPrompt: string,
  userPrompt: string,
  options?: { maxTokens?: number }
): Promise<string> {
  const { text } = await generateText({
    model: glmModel(),
    system: systemPrompt,
    prompt: userPrompt,
    maxOutputTokens: options?.maxTokens ?? 8192,
  });
  return text;
}
