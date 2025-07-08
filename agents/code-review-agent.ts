import { generateText, tool } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

const analyzeCodeSecurity = tool({
  description: "Analyze code for security vulnerabilities",
  parameters: z.object({
    code: z.string().describe("Code to analyze for security issues"),
    language: z.string().describe("Programming language"),
  }),
  execute: async ({ code, language }) => {
    // Simulate security analysis
    const commonVulnerabilities = {
      javascript: ["XSS vulnerabilities", "Prototype pollution", "Unsafe eval usage"],
      python: ["SQL injection", "Command injection", "Unsafe deserialization"],
      java: ["SQL injection", "Path traversal", "Unsafe reflection"],
      php: ["SQL injection", "XSS", "File inclusion vulnerabilities"],
    }

    const issues = []

    // Check for common patterns
    if (code.includes("eval(") || code.includes("exec(")) {
      issues.push({
        type: "Code Injection",
        severity: "High",
        line: "Multiple locations",
        description: "Avoid using eval() or exec() with user input",
      })
    }

    if (code.includes("SELECT * FROM") && code.includes("+")) {
      issues.push({
        type: "SQL Injection",
        severity: "Critical",
        line: "Database query",
        description: "Use parameterized queries instead of string concatenation",
      })
    }

    return {
      vulnerabilities: issues,
      riskLevel: issues.length > 0 ? "Medium" : "Low",
      recommendations: [
        "Use parameterized queries for database operations",
        "Validate and sanitize all user inputs",
        "Implement proper error handling",
      ],
    }
  },
})

const checkCodeQuality = tool({
  description: "Analyze code quality and best practices",
  parameters: z.object({
    code: z.string().describe("Code to analyze for quality"),
    language: z.string().describe("Programming language"),
  }),
  execute: async ({ code, language }) => {
    const issues = []
    let score = 100

    // Check for common quality issues
    if (code.split("\n").some((line) => line.length > 120)) {
      issues.push({
        type: "Line Length",
        severity: "Minor",
        description: "Lines should be under 120 characters",
      })
      score -= 5
    }

    if (!code.includes("//") && !code.includes("/*") && !code.includes("#")) {
      issues.push({
        type: "Documentation",
        severity: "Medium",
        description: "Add comments to explain complex logic",
      })
      score -= 15
    }

    const functionCount = (code.match(/function|def |public |private /g) || []).length
    if (functionCount > 10) {
      issues.push({
        type: "Complexity",
        severity: "Medium",
        description: "Consider breaking large files into smaller modules",
      })
      score -= 10
    }

    return {
      qualityScore: Math.max(score, 0),
      issues,
      suggestions: [
        "Add comprehensive comments and documentation",
        "Follow consistent naming conventions",
        "Break large functions into smaller, focused ones",
        "Add error handling and input validation",
      ],
    }
  },
})

const suggestImprovements = tool({
  description: "Suggest specific code improvements and refactoring",
  parameters: z.object({
    code: z.string().describe("Code to improve"),
    language: z.string().describe("Programming language"),
    focus: z.enum(["performance", "readability", "maintainability", "all"]).optional(),
  }),
  execute: async ({ code, language, focus = "all" }) => {
    const improvements = []

    if (focus === "performance" || focus === "all") {
      improvements.push({
        category: "Performance",
        suggestions: [
          "Use efficient data structures (Map/Set instead of arrays for lookups)",
          "Implement caching for expensive operations",
          "Avoid nested loops where possible",
          "Use lazy loading for large datasets",
        ],
      })
    }

    if (focus === "readability" || focus === "all") {
      improvements.push({
        category: "Readability",
        suggestions: [
          "Use descriptive variable and function names",
          "Extract magic numbers into named constants",
          "Add JSDoc/docstring comments",
          "Use consistent indentation and formatting",
        ],
      })
    }

    if (focus === "maintainability" || focus === "all") {
      improvements.push({
        category: "Maintainability",
        suggestions: [
          "Follow SOLID principles",
          "Implement proper error handling",
          "Add unit tests for critical functions",
          "Use dependency injection for better testability",
        ],
      })
    }

    return {
      improvements,
      refactoringPriority: "Medium",
      estimatedEffort: "2-4 hours",
    }
  },
})

export async function runCodeReviewAgent(message: string, context?: any) {
  const result = await generateText({
    model: openai("gpt-4o"),
    messages: [
      {
        role: "system",
        content: `You are an expert code reviewer with 10+ years of experience across multiple programming languages.

Your Review Process:
1. Analyze code for security vulnerabilities
2. Check code quality and best practices
3. Suggest specific improvements
4. Provide actionable feedback with examples

Focus Areas:
- Security vulnerabilities and risks
- Code quality and maintainability  
- Performance optimizations
- Best practices and conventions
- Testing and error handling

Always provide:
- Specific line numbers when possible
- Clear explanations of issues
- Concrete suggestions for improvement
- Code examples when helpful

Be thorough but constructive in your feedback.`,
      },
      {
        role: "user",
        content: message,
      },
    ],
    tools: {
      analyzeCodeSecurity,
      checkCodeQuality,
      suggestImprovements,
    },
    maxSteps: 5,
  })

  return {
    response: result.text,
    toolCalls: result.toolCalls,
    usage: result.usage,
  }
}
