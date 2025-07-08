"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface AgentConfig {
  name: string
  instructions: string
  model: string
  tools: string[]
  handoffs: string[]
  documents?: any[]
  functionTools?: any[]
  guardrails?: any[]
  contextConfig?: any
}

interface AgentContextType {
  currentAgent: AgentConfig | null
  setCurrentAgent: (agent: AgentConfig) => void
  updateAgent: (updates: Partial<AgentConfig>) => void
}

const AgentContext = createContext<AgentContextType | undefined>(undefined)

export function AgentProvider({ children }: { children: ReactNode }) {
  const [currentAgent, setCurrentAgent] = useState<AgentConfig | null>(null)

  const updateAgent = (updates: Partial<AgentConfig>) => {
    setCurrentAgent((prev) => (prev ? { ...prev, ...updates } : null))
  }

  return (
    <AgentContext.Provider value={{ currentAgent, setCurrentAgent, updateAgent }}>{children}</AgentContext.Provider>
  )
}

export function useAgent() {
  const context = useContext(AgentContext)
  if (context === undefined) {
    throw new Error("useAgent must be used within an AgentProvider")
  }
  return context
}
