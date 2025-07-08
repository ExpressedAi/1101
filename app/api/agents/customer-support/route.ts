import { type NextRequest, NextResponse } from "next/server"
import { runCustomerSupportAgent } from "@/lib/agents/customer-support-agent"

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json()

    const result = await runCustomerSupportAgent(message, context)

    return NextResponse.json({
      response: result.response,
      toolCalls:
        result.toolCalls?.map((call) => ({
          tool: call.toolName,
          result: call.result,
        })) || [],
      usage: result.usage,
      agentType: "customer-support",
    })
  } catch (error) {
    console.error("Customer Support Agent error:", error)
    return NextResponse.json({ error: "Failed to process customer support request" }, { status: 500 })
  }
}
