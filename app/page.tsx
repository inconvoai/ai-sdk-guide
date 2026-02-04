"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import { InconvoToolResult } from "./components/inconvo";
import { isInconvoOutput } from "./utils/inconvo";

export default function Chat() {
  const [input, setInput] = useState("");
  const { messages, sendMessage } = useChat();

  return (
    <div className="flex flex-col w-full max-w-4xl py-24 mx-auto px-4">
      {messages.map((message) => (
        <div key={message.id} className="mb-4">
          <div className="font-semibold mb-1">
            {message.role === "user" ? "User" : "AI"}:
          </div>
          <div>
            {message.parts.map((part, i) => {
              if (part.type === "text") {
                return (
                  <div
                    key={`${message.id}-${i}`}
                    className="whitespace-pre-wrap"
                  >
                    {part.text}
                  </div>
                );
              }

              // Handle Inconvo tool calls
              if (part.type.startsWith("tool-") && "state" in part) {
                const isInconvoTool = part.type.includes("DataAgent");

                // Show loading state while tool is executing
                if (part.state === "input-available" && isInconvoTool) {
                  return (
                    <div
                      key={`${message.id}-${i}`}
                      className="flex items-center gap-2 p-4 text-sm text-zinc-500"
                    >
                      <div className="animate-spin h-4 w-4 border-2 border-zinc-300 border-t-zinc-600 rounded-full" />
                      <div>
                        <div>Querying your data...</div>
                        <div className="text-xs mt-1">
                          This may take a few moments for complex queries
                        </div>
                      </div>
                    </div>
                  );
                }

                // Show result when available
                if (
                  part.state === "output-available" &&
                  "output" in part &&
                  isInconvoOutput(part.output)
                ) {
                  return (
                    <InconvoToolResult
                      key={`${message.id}-${i}`}
                      result={part.output}
                    />
                  );
                }
              }

              return null;
            })}
          </div>
        </div>
      ))}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage({ text: input });
          setInput("");
        }}
      >
        <input
          className="fixed dark:bg-zinc-900 bottom-0 w-full max-w-4xl p-2 mb-8 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={(e) => setInput(e.currentTarget.value)}
        />
      </form>
    </div>
  );
}
