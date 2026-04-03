import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";

// Z.ai GLM 5.1 API — OpenAI-compatible endpoint
const glm = createOpenAICompatible({
  name: "glm",
  apiKey: process.env.GLM_API_KEY ?? "",
  baseURL: "https://open.bigmodel.cn/api/paas/v4",
});

// GLM 5.1 model ID — the hackathon's target model
const DEFAULT_MODEL = "glm-4-plus";

export function glmModel(modelId: string = DEFAULT_MODEL) {
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
