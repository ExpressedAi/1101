import { generateText, streamText, tool } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

// Customer Support Tools
const searchKnowledgeBase = tool({
  description: "Search the company knowledge base for answers",
  parameters: z.object({
    query: z.string().describe("Search query for the knowledge base"),
    category: z.enum(["billing", "technical", "account", "general"]).optional(),
  }),
  execute: async ({ query, category }) => {
    // Simulate knowledge base search
    const mockResults = {
      billing: [
        "Billing cycles run monthly on the date you signed up",
        "You can update payment methods in Account Settings",
        "Refunds are processed within 5-7 business days",
      ],
      technical: [
        "Try clearing your browser cache and cookies",
        "Check if JavaScript is enabled in your browser",
        "Our system status page shows current uptime",
      ],
      account: [
        "Password resets are sent to your registered email",
        "You can update your profile in Account Settings",
        "Account deletion requests take 24-48 hours to process",
      ],
      general: [
        "Our support hours are 9 AM - 6 PM EST, Monday-Friday",
        "Premium users get priority support response",
        "You can reach us via chat, email, or phone",
      ],
    }

    const results = category ? mockResults[category] : Object.values(mockResults).flat()
    return {
      results: results.filter((r) => r.toLowerCase().includes(query.toLowerCase())).slice(0, 3),
      category: category || "general",
    }
  },
})

const createTicket = tool({
  description: "Create a support ticket for complex issues",
  parameters: z.object({
    title: z.string().describe("Brief title for the ticket"),
    description: z.string().describe("Detailed description of the issue"),
    priority: z.enum(["low", "medium", "high", "urgent"]),
    category: z.enum(["billing", "technical", "account", "feature_request"]),
  }),
  execute: async ({ title, description, priority, category }) => {
    const ticketId = `TICK-${Date.now()}`
    return {
      ticketId,
      status: "created",
      estimatedResponse: priority === "urgent" ? "1 hour" : priority === "high" ? "4 hours" : "24 hours",
      message: `Ticket ${ticketId} has been created. You'll receive updates via email.`,
    }
  },
})

export async function runCustomerSupportAgent(message: string, context?: any) {
  const result = await generateText({
    model: openai("gpt-4o"),
    messages: [
      {
        role: "system",
        content: `You are a professional customer support agent for a SaaS company. 

Key Guidelines:
- Be empathetic, patient, and solution-oriented
- Always acknowledge the customer's frustration
- Provide step-by-step guidance when possible
- Use the knowledge base tool to find accurate information
- Create tickets for complex issues that need escalation
- Keep responses friendly but professional
- Ask clarifying questions when needed

Customer Context: ${context ? JSON.stringify(context) : "No additional context provided"}`,
      },
      {
        role: "user",
        content: message,
      },
    ],
    tools: {
      searchKnowledgeBase,
      createTicket,
    },
    maxSteps: 3,
  })

  return {
    response: result.text,
    toolCalls: result.toolCalls,
    usage: result.usage,
  }
}

export async function streamCustomerSupportAgent(message: string, context?: any) {
  const result = streamText({
    model: openai("gpt-4o"),
    messages: [
      {
        role: "system",
        content: `You are a professional customer support agent. Be empathetic and helpful.`,
      },
      {
        role: "user",
        content: message,
      },
    ],
    tools: {
      searchKnowledgeBase,
      createTicket,
    },
  })

  return result
}
