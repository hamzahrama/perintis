import type { AIMessage } from "@/lib/ai/provider";

type ConversationMessage = AIMessage & {
  deliveryStatus?: "interrupted" | "not-saved";
};

export function buildAssistantRequestMessages(
  history: ConversationMessage[],
  latestUserMessage: string,
): AIMessage[] {
  const persistedHistory = history
    .filter((message) => !message.deliveryStatus)
    .slice(-19)
    .map(({ role, content }) => ({ role, content }));

  return [
    ...persistedHistory,
    { role: "user", content: latestUserMessage },
  ];
}
