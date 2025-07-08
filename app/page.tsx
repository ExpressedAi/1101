"use client"

import { useState } from "react"
import { Bird, Plus, Sparkles, Users, MessageSquare, Code, Search, Mic } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AgentBuilder } from "@/components/agent-builder"
import { AgentTemplates } from "@/components/agent-templates"
import { AgentTester } from "@/components/agent-tester"
import { CodeExporter } from "@/components/code-exporter"
import VectorMemoryDashboard from "@/components/vector-memory-dashboard"
import { DeploymentManager } from "@/components/deployment-manager"
import { VoiceAgentBuilder } from "@/components/voice-agent-builder"
import { AgentProvider } from "@/contexts/agent-context"

export default function Home() {
  const [activeTab, setActiveTab] = useState("templates")

  return (
    <AgentProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Bird className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Redwrite
                  </h1>
                  <p className="text-sm text-muted-foreground">Build powerful AI agents with ease</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Live
                </Badge>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-7 mb-8">
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="builder" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Builder
              </TabsTrigger>
              <TabsTrigger value="tester" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Tester
              </TabsTrigger>
              <TabsTrigger value="voice" className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Voice
              </TabsTrigger>
              <TabsTrigger value="memory" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Memory
              </TabsTrigger>
              <TabsTrigger value="export" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Export
              </TabsTrigger>
              <TabsTrigger value="deploy" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Deploy
              </TabsTrigger>
            </TabsList>

            <TabsContent value="templates">
              <AgentTemplates />
            </TabsContent>

            <TabsContent value="builder">
              <AgentBuilder />
            </TabsContent>

            <TabsContent value="tester">
              <AgentTester />
            </TabsContent>

            <TabsContent value="voice">
              <VoiceAgentBuilder />
            </TabsContent>

            <TabsContent value="memory">
              <VectorMemoryDashboard />
            </TabsContent>

            <TabsContent value="export">
              <CodeExporter />
            </TabsContent>

            <TabsContent value="deploy">
              <DeploymentManager />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AgentProvider>
  )
}
