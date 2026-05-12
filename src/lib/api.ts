import type { AiInterpretationRequest, ReadingInterpretation } from "../types/liuyao";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8787";

export async function generateAiInterpretation(
  payload: AiInterpretationRequest,
): Promise<ReadingInterpretation> {
  const response = await fetch(`${apiBaseUrl}/api/interpret`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "AI 解读生成失败");
  }

  return (await response.json()) as ReadingInterpretation;
}
