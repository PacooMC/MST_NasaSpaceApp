"use client"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MissionControlBarProps {
  currentMode: string
  onModeChange: (mode: string) => void
  currentRegion: string
  onRegionChange: (region: string) => void
  systemStatus: "operational" | "processing" | "idle"
  lastCommand?: string
}

export function MissionControlBar({
  currentMode,
  onModeChange,
  currentRegion,
  onRegionChange,
  systemStatus,
  lastCommand,
}: MissionControlBarProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const statusLabel =
    systemStatus === "operational" ? "Payload network operational" : systemStatus === "processing" ? "Processing at edge..." : "Idle"

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="px-4 sm:px-6 py-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Branding */}
        <div className="flex items-center gap-3">
          <Image
            src="/brand/arsa-logo.jpeg"
            alt="ARSA mission emblem"
            width={32}
            height={32}
            priority
            className="rounded-md border border-border bg-background/80"
          />
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight text-foreground">ARSA</div>
            <div className="text-[11px] text-muted-foreground hidden sm:block">
              Autonomous Recognition System for Automatic disaster detection
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div
            className={`w-2 h-2 rounded-full ${
              systemStatus === "operational"
                ? "bg-accent animate-pulse"
                : systemStatus === "processing"
                  ? "bg-chart-4 animate-pulse"
                  : "bg-muted-foreground"
            }`}
          />
          <span className="truncate max-w-[160px] sm:max-w-none">{statusLabel}</span>
        </div>

        {/* Region & Time */}
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Region:</span>
            <Select value={currentRegion} onValueChange={onRegionChange}>
              <SelectTrigger className="w-[120px] sm:w-[140px] h-8 text-xs bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seville">Seville</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <span className="text-xs text-muted-foreground font-mono tabular-nums">
            {currentTime.toLocaleTimeString("en-US", { hour12: false })}
          </span>
        </div>
      </div>
    </header>
  )
}
