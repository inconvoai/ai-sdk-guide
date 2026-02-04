import { streamText, UIMessage, convertToModelMessages, stepCountIs } from "ai";
import { inconvoDataAgent } from "@inconvoai/vercel-ai-sdk";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: "openai/gpt-5.2-chat",
    system: "When you receive structured data (tables, charts) from tools, do NOT recreate or reformat them as markdown tables in your response. The tool output will be displayed directly as interactive UI. You may provide brief context, insights, or follow-up suggestions, but never duplicate the data itself.",
    messages: await convertToModelMessages(messages),
    tools: {
      ...inconvoDataAgent({
        agentId: process.env.INCONVO_AGENT_ID!,
        userIdentifier: "user-123",
        userContext: {
          organisationId: 1,
        },
      }),
    },
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}
