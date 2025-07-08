import { type NextRequest, NextResponse } from "next/server"
import { runCodeReviewAgent } from "@/lib/agents/code-review-agent"

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json()

    const result = await runCodeReviewAgent(message, context)

    return NextResponse.json({
      response: result.response,
      toolCalls:
        result.toolCalls?.map((call) => ({
          tool: call.toolName,
          result: call.result,
        })) || [],
      usage: result.usage,
      agentType: "code-review",
    })
  } catch (error) {
    console.error("Code Review Agent error:", error)
    return NextResponse.json({ error: "Failed to process code review request" }, { status: 500 })
  }
}
