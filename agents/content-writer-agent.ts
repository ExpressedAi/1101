import { generateText, tool } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

const researchTopic = tool({
  description: "Research a topic for content creation",
  parameters: z.object({
    topic: z.string().describe("Topic to research"),
    contentType: z.enum(["blog", "article", "social", "email", "landing"]),
    targetAudience: z.string().describe("Target audience for the content"),
  }),
  execute: async ({ topic, contentType, targetAudience }) => {
    // Simulate research results
    const researchData = {
      keyPoints: [
        `${topic} is trending in ${targetAudience} communities`,
        `Recent studies show increased interest in ${topic}`,
        `Best practices for ${topic} have evolved significantly`,
        `Common challenges include implementation and adoption`,
      ],
      statistics: [
        `85% of ${targetAudience} consider ${topic} important`,
        `Market size for ${topic} solutions: $2.3B`,
        `Average ROI improvement: 40%`,
      ],
      competitorAnalysis: [
        "Most content focuses on basic concepts",
        "Gap in advanced implementation guides",
        "Opportunity for practical case studies",
      ],
      seoKeywords: [
        topic.toLowerCase(),
        `${topic} guide`,
        `${topic} best practices`,
        `${topic} for ${targetAudience.toLowerCase()}`,
      ],
    }

    return researchData
  },
})

const generateOutline = tool({
  description: "Generate a content outline based on research",
  parameters: z.object({
    topic: z.string().describe("Main topic"),
    contentType: z.enum(["blog", "article", "social", "email", "landing"]),
    wordCount: z.number().describe("Target word count"),
    tone: z.enum(["professional", "casual", "technical", "conversational"]),
  }),
  execute: async ({ topic, contentType, wordCount, tone }) => {
    const outlines = {
      blog: {
        structure: [
          "Hook/Opening Question",
          "Problem Statement",
          "Solution Overview",
          "Detailed Steps/Methods",
          "Real-world Examples",
          "Common Pitfalls",
          "Conclusion & CTA",
        ],
        estimatedSections: 7,
        wordsPerSection: Math.round(wordCount / 7),
      },
      article: {
        structure: [
          "Executive Summary",
          "Introduction",
          "Background/Context",
          "Main Analysis",
          "Case Studies",
          "Future Implications",
          "Conclusion",
        ],
        estimatedSections: 7,
        wordsPerSection: Math.round(wordCount / 7),
      },
      landing: {
        structure: [
          "Hero Section",
          "Problem/Pain Points",
          "Solution Benefits",
          "Social Proof",
          "Features Overview",
          "Pricing/CTA",
          "FAQ",
        ],
        estimatedSections: 7,
        wordsPerSection: Math.round(wordCount / 7),
      },
    }

    return outlines[contentType] || outlines.blog
  },
})

const optimizeForSEO = tool({
  description: "Optimize content for search engines",
  parameters: z.object({
    content: z.string().describe("Content to optimize"),
    primaryKeyword: z.string().describe("Primary SEO keyword"),
    secondaryKeywords: z.array(z.string()).describe("Secondary keywords"),
  }),
  execute: async ({ content, primaryKeyword, secondaryKeywords }) => {
    const analysis = {
      keywordDensity: {
        primary:
          Math.round(
            ((content.toLowerCase().split(primaryKeyword.toLowerCase()).length - 1) / content.split(" ").length) *
              100 *
              100,
          ) / 100,
        secondary: secondaryKeywords.map((kw) => ({
          keyword: kw,
          density:
            Math.round(
              ((content.toLowerCase().split(kw.toLowerCase()).length - 1) / content.split(" ").length) * 100 * 100,
            ) / 100,
        })),
      },
      recommendations: [
        "Add primary keyword to title and first paragraph",
        "Include secondary keywords naturally throughout",
        "Add meta description with primary keyword",
        "Use header tags (H1, H2, H3) with keywords",
        "Include internal and external links",
        "Optimize images with alt text",
      ],
      seoScore: 75,
      improvements: ["Increase keyword density to 1-2%", "Add more semantic keywords", "Improve readability score"],
    }

    return analysis
  },
})

export async function runContentWriterAgent(message: string, context?: any) {
  const contentContext = context
    ? `
Content Requirements:
- Topic: ${context.topic || "Not specified"}
- Content Type: ${context.contentType || "Blog post"}
- Target Audience: ${context.targetAudience || "General"}
- Tone: ${context.tone || "Professional"}
- Word Count: ${context.wordCount || "800-1200 words"}
- SEO Keywords: ${context.keywords || "Not specified"}
`
    : ""

  const result = await generateText({
    model: openai("gpt-4o"),
    messages: [
      {
        role: "system",
        content: `You are a professional content writer and SEO specialist with expertise in creating engaging, high-converting content.

Your Expertise:
- Blog posts and articles
- Marketing copy and landing pages
- Email campaigns and newsletters
- Social media content
- SEO optimization and keyword research

Writing Principles:
- Hook readers with compelling openings
- Use clear, scannable formatting
- Include actionable insights and examples
- Optimize for search engines naturally
- Match the brand voice and tone
- Include strong calls-to-action

${contentContext}

Always research the topic thoroughly, create structured outlines, and optimize for both readers and search engines.`,
      },
      {
        role: "user",
        content: message,
      },
    ],
    tools: {
      researchTopic,
      generateOutline,
      optimizeForSEO,
    },
    maxSteps: 4,
  })

  return {
    response: result.text,
    toolCalls: result.toolCalls,
    usage: result.usage,
  }
}
