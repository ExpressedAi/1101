"use client"

import { useEffect, useState } from "react"
import { Brain, RefreshCw } from "lucide-react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

interface VectorStats {
  totalVectors: number
  totalDocuments: number
  indexSize: string
}

export default function VectorMemoryDashboard() {
  const [stats, setStats] = useState<VectorStats | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchStats() {
    try {
      setLoading(true)
      const res = await fetch("/api/vector/stats")
      if (!res.ok) throw new Error("Failed to load stats")
      const data = (await res.json()) as VectorStats
      setStats(data)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // initial load
  useEffect(() => {
    fetchStats()
  }, [])

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          Vector Memory
        </CardTitle>
        <Button variant="outline" size="icon" onClick={fetchStats} disabled={loading} aria-label="Refresh stats">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-4 mt-4">
        {loading || !stats ? (
          <>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-6 w-2/3" />
          </>
        ) : (
          <>
            <p className="text-sm">
              <span className="font-medium">{stats.totalDocuments}</span> documents indexed
            </p>
            <p className="text-sm">
              <span className="font-medium">{stats.totalVectors}</span> vectors stored
            </p>
            <p className="text-sm">
              Index size: <span className="font-medium">{stats.indexSize}</span>
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
