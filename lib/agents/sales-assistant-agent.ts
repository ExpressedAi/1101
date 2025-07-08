import { generateText, tool } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

const getProductInfo = tool({
  description: "Get detailed information about our products and pricing",
  parameters: z.object({
    product: z.enum(["starter", "professional", "enterprise"]).optional(),
    feature: z.string().optional().describe("Specific feature to inquire about"),
  }),
  execute: async ({ product, feature }) => {
    const products = {
      starter: {
        price: "$29/month",
        features: ["Up to 5 users", "Basic analytics", "Email support", "10GB storage"],
        bestFor: "Small teams and startups",
      },
      professional: {
        price: "$99/month",
        features: ["Up to 25 users", "Advanced analytics", "Priority support", "100GB storage", "API access"],
        bestFor: "Growing businesses",
      },
      enterprise: {
        price: "Custom pricing",
        features: ["Unlimited users", "Custom integrations", "Dedicated support", "Unlimited storage", "SLA guarantee"],
        bestFor: "Large organizations",
      },
    }

    if (product) {
      return products[product]
    }

    return {
      allProducts: products,
      recommendation: "I can help you choose the right plan based on your needs!",
    }
  },
})

const calculateROI = tool({
  description: "Calculate potential ROI and savings for the customer",
  parameters: z.object({
    currentCost: z.number().describe("Current monthly cost of their solution"),
    teamSize: z.number().describe("Number of team members"),
    timeSpent: z.number().describe("Hours per week spent on manual tasks"),
  }),
  execute: async ({ currentCost, teamSize, timeSpent }) => {
    const hourlyRate = 50 // Average hourly rate
    const weeklySavings = timeSpent * hourlyRate * 0.7 // 70% time savings
    const monthlySavings = weeklySavings * 4
    const ourCost = teamSize <= 5 ? 29 : teamSize <= 25 ? 99 : 299
    const netSavings = monthlySavings - ourCost
    const roi = ((netSavings * 12) / (ourCost * 12)) * 100

    return {
      monthlySavings: Math.round(monthlySavings),
      ourCost,
      netMonthlySavings: Math.round(netSavings),
      annualROI: Math.round(roi),
      paybackPeriod: Math.ceil(ourCost / netSavings) + " months",
    }
  },
})

const scheduleDemo = tool({
  description: "Schedule a product demo or sales call",
  parameters: z.object({
    preferredTime: z.string().describe("Preferred time for the demo"),
    contactInfo: z.string().describe("Email or phone number"),
    specificInterests: z.string().optional().describe("Specific features they want to see"),
  }),
  execute: async ({ preferredTime, contactInfo, specificInterests }) => {
    const demoId = `DEMO-${Date.now()}`
    return {
      demoId,
      scheduledTime: preferredTime,
      confirmationSent: true,
      demoLink: `https://calendly.com/sales-demo/${demoId}`,
      message: `Demo scheduled! You'll receive a calendar invite at ${contactInfo}`,
      agenda: specificInterests ? `Custom demo focusing on: ${specificInterests}` : "Standard product overview",
    }
  },
})

export async function runSalesAssistant(message: string, context?: any) {
  const customerContext = context
    ? `
Customer Information:
- Name: ${context.customerName || "Not provided"}
- Company: ${context.company || "Not provided"}
- Team Size: ${context.teamSize || "Not provided"}
- Budget Range: ${context.budget || "Not provided"}
- Current Solution: ${context.currentSolution || "Not provided"}
`
    : ""

  const result = await generateText({
    model: openai("gpt-4o"),
    messages: [
      {
        role: "system",
        content: `You are an expert sales assistant for a SaaS productivity platform. 

Your Goals:
- Understand customer needs and pain points
- Highlight relevant product benefits
- Build value and demonstrate ROI
- Guide toward a purchase decision or demo
- Be consultative, not pushy

Key Selling Points:
- Save 70% of time on manual tasks
- Increase team productivity by 40%
- Seamless integrations with popular tools
- Enterprise-grade security
- 24/7 support for paid plans

${customerContext}

Always be helpful, professional, and focus on solving their business problems.`,
      },
      {
        role: "user",
        content: message,
      },
    ],
    tools: {
      getProductInfo,
      calculateROI,
      scheduleDemo,
    },
    maxSteps: 3,
  })

  return {
    response: result.text,
    toolCalls: result.toolCalls,
    usage: result.usage,
  }
}
