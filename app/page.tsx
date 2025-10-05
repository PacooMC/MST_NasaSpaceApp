"use client"

import { useRef, useState } from "react"
import { MissionControlBar } from "@/components/mission-control-bar"
import { SatelliteView } from "@/components/satellite-view"
import { ResponsePanel } from "@/components/response-panel"
import { CommandConsole } from "@/components/command-console"
import { AnalysisSummary } from "@/components/analysis-summary"
import { analyzeCommand } from "@/lib/analysis"
import { SCENARIOS, type ScenarioId } from "@/lib/scenarios"
import type { Detection, SystemEvent } from "@/types/analysis"

export default function SatelliteInterface() {
  const defaultScenario = SCENARIOS["seville-multi"]

  const [currentMode, setCurrentMode] = useState<string>("standard")
  const [currentRegion, setCurrentRegion] = useState(defaultScenario.region)
  const [systemStatus, setSystemStatus] = useState<"operational" | "processing" | "idle">("operational")
  const [lastCommand, setLastCommand] = useState<string>()
  const [detections, setDetections] = useState<Detection[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [events, setEvents] = useState<SystemEvent[]>([])
  const [analysisSummary, setAnalysisSummary] = useState<string>("")
  const [analysisSource, setAnalysisSource] = useState<"llm" | null>(null)
  const [scenarioId, setScenarioId] = useState<ScenarioId | undefined>(undefined)
  const eventTimersRef = useRef<Array<ReturnType<typeof setTimeout>>>([])

  const clearEventQueue = () => {
    eventTimersRef.current.forEach((timer) => clearTimeout(timer))
    eventTimersRef.current = []
  }

  const enqueueEvents = (incoming: SystemEvent[]) => {
    const sorted = [...incoming].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    sorted.forEach((event, index) => {
      const timer = setTimeout(() => {
        setEvents((prev) => [event, ...prev])
      }, index * 350)
      eventTimersRef.current.push(timer)
    })
  }

  const handleCommandSubmit = async (command: string): Promise<void> => {
    if (!command.trim()) return

    clearEventQueue()
    setLastCommand(command)
    setIsProcessing(true)
    setSystemStatus("processing")
    setEvents([])


    try {
      const result = await analyzeCommand(command)

      const nextDetections = result.detections.length > 0 ? result.detections : []
      setDetections(nextDetections)
      enqueueEvents(result.events)
      setCurrentMode(result.mode)
      setCurrentRegion(result.region)
      const nextScenario = result.scenarioId ? (result.scenarioId as ScenarioId) : undefined
      setScenarioId(nextScenario)
      setSystemStatus("operational")
      setAnalysisSummary(result.summary || analysisSummary)
      setAnalysisSource("llm")
    } catch (error) {
      console.error("[analysis]", error)
      setSystemStatus("idle")
      setAnalysisSummary("Analysis could not be completed. Please try again.")
      setAnalysisSource(null)
      clearEventQueue()
      setEvents([])
      setScenarioId(undefined)

      const errorEvent: SystemEvent = {
        id: `error-${Date.now()}`,
        timestamp: new Date(),
        type: "info",
        message: "Unable to reach the on-board model. Check telemetry and retry.",
        severity: "warning",
      }
      setEvents((prev) => [errorEvent, ...prev])
      setDetections([])
      setCurrentMode("standard")
      throw error
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    clearEventQueue()
    setDetections([])
    setEvents([])
    setLastCommand(undefined)
    setSystemStatus("operational")
    setIsProcessing(false)
    setCurrentMode("standard")
    setCurrentRegion(defaultScenario.region)
    setAnalysisSummary("")
    setAnalysisSource(null)
    setScenarioId(undefined)
  }

  const handleEventClick = (event: SystemEvent) => {
    console.log("[event]", event)
  }

  return (
    <div className="w-full flex min-h-screen flex-col bg-background text-foreground lg:h-screen lg:overflow-hidden">
      <MissionControlBar
        currentMode={currentMode}
        onModeChange={setCurrentMode}
        currentRegion={currentRegion}
        onRegionChange={setCurrentRegion}
        systemStatus={systemStatus}
        lastCommand={lastCommand}
      />

      <AnalysisSummary
        summary={analysisSummary}
        scenarioId={scenarioId}
        source={analysisSource}
        detections={detections}
        isProcessing={isProcessing}
      />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden px-4 sm:px-6 pb-4 sm:pb-6 gap-4 sm:gap-6">
        <div className="flex-1 overflow-hidden rounded-2xl bg-card/70 shadow-md min-h-[260px] sm:min-h-[320px] lg:min-h-0">
          <SatelliteView region={currentRegion} mode={currentMode} detections={detections} isProcessing={isProcessing} />
        </div>

        <div className="lg:w-72 w-full flex-shrink-0">
          <ResponsePanel events={events} onEventClick={handleEventClick} />
        </div>
      </div>

      <CommandConsole onCommandSubmit={handleCommandSubmit} isProcessing={isProcessing} onReset={handleReset} />
    </div>
  )
}
