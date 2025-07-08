import { type NextRequest, NextResponse } from "next/server"
import { runSalesAssistant } from "@/lib/agents/sales-assistant-agent"

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json()

    const result = await runSalesAssistant(message, context)

    return NextResponse.json({
      response: result.response,
      toolCalls:
        result.toolCalls?.map((call) => ({
          tool: call.toolName,
          result: call.result,
        })) || [],
      usage: result.usage,
      agentType: "sales-assistant",
    })
  } catch (error) {
    console.error("Sales Assistant error:", error)
    return NextResponse.json({ error: "Failed to process sales request" }, { status: 500 })
  }
}
