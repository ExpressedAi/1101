import { type NextRequest, NextResponse } from "next/server"
import { runContentWriterAgent } from "@/lib/agents/content-writer-agent"

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json()

    const result = await runContentWriterAgent(message, context)

    return NextResponse.json({
      response: result.response,
      toolCalls:
        result.toolCalls?.map((call) => ({
          tool: call.toolName,
          result: call.result,
        })) || [],
      usage: result.usage,
      agentType: "content-writer",
    })
  } catch (error) {
    console.error("Content Writer Agent error:", error)
    return NextResponse.json({ error: "Failed to process content writing request" }, { status: 500 })
  }
}
