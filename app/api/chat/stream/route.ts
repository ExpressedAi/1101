import type { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const { message, agentConfig } = await req.json()

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      // Simulate streaming response
      const simulateStream = async () => {
        const response = `[${agentConfig.name}]: Processing your request...

I'm configured with: ${agentConfig.instructions}

Tools available: ${agentConfig.tools.join(", ")}

Analyzing: "${message}"

*This is a simulated streaming response - add your OpenAI API key to enable real streaming*`

        const words = response.split(" ")

        for (let i = 0; i < words.length; i++) {
          const chunk = words[i] + " "
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
          await new Promise((resolve) => setTimeout(resolve, 50))
        }

        controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
        controller.close()
      }

      simulateStream()
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
