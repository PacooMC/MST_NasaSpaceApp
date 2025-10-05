"use client"

import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import type { Detection } from "@/types/analysis"
import { Flame, Ship, Waves } from "lucide-react"

interface SatelliteViewProps {
  region: string
  mode: string
  detections: Detection[]
  isProcessing: boolean
}

const REGION_ASSETS: Record<string, string> = {
  seville: "/observations/seville-live.png",
  galicia: "/observations/galicia-illegal-fishing.png",
  global: "/placeholder.svg",
}

export function SatelliteView({ region, mode, detections, isProcessing }: SatelliteViewProps) {
  const imageSrc = REGION_ASSETS[region] || REGION_ASSETS.global

  const detectionIcon = useMemo(() => {
    return (type: Detection["type"]) => {
      switch (type) {
        case "fire":
          return <Flame className="w-5 h-5" />
        case "flood":
          return <Waves className="w-5 h-5" />
        case "ship":
        default:
          return <Ship className="w-5 h-5" />
      }
    }
  }, [])

  const detectionColor = useMemo(() => {
    return (type: Detection["type"]) => {
      switch (type) {
        case "fire":
          return "bg-destructive text-destructive-foreground"
        case "flood":
          return "bg-sky-500/80 text-background"
        case "ship":
        default:
          return "bg-accent text-accent-foreground"
      }
    }
  }, [])

  return (
    <main className="w-full h-full relative bg-black">
      {/* Imagen base */}
      <img 
        src={imageSrc} 
        alt={`Satellite view of ${region}`} 
        className="w-full h-full object-cover"
      />

      {/* Overlay sutil */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20 pointer-events-none" />

      {isProcessing && (
        <div className="absolute top-4 left-4 z-10 animate-in fade-in slide-in-from-left duration-300">
          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm border-primary text-primary">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse mr-2" />
            Processing image...
          </Badge>
        </div>
      )}

      {mode && mode !== "standard" && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 animate-in fade-in slide-in-from-right duration-300">
          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
            {mode.replace(/-/g, " ").toUpperCase()}
          </Badge>
        </div>
      )}

      {detections.map((detection, index) => {
        const EDGE_GUTTER = 8
        const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)
        const clampedX = clamp(detection.x, EDGE_GUTTER, 100 - EDGE_GUTTER)
        const clampedY = clamp(detection.y, EDGE_GUTTER, 100 - EDGE_GUTTER)
        const translateX = detection.x > 100 - EDGE_GUTTER ? "-100%" : detection.x < EDGE_GUTTER ? "0%" : "-50%"
        const translateY = detection.y > 100 - EDGE_GUTTER ? "-100%" : detection.y < EDGE_GUTTER ? "0%" : "-50%"

        return (
          <div
            key={detection.id}
            className="absolute z-20 animate-in fade-in zoom-in duration-500"
            style={{
              left: `${clampedX}%`,
              top: `${clampedY}%`,
              transform: `translate(${translateX}, ${translateY})`,
              animationDelay: `${index * 150}ms`,
            }}
          >
            <div className="relative">
              <div
                className={`absolute inset-0 w-20 h-20 -left-4 -top-4 rounded-full ${detectionColor(detection.type)} opacity-10 animate-ping`}
                style={{ animationDuration: "2s" }}
              />
              <div
                className={`absolute inset-0 w-14 h-14 -left-2 -top-2 rounded-full ${detectionColor(detection.type)} opacity-20 animate-pulse`}
              />
              <div
                className={`relative w-12 h-12 rounded-full ${detectionColor(detection.type)} flex items-center justify-center shadow-lg border-2 border-background hover:scale-110 transition-transform cursor-pointer`}
              >
                {detectionIcon(detection.type)}
              </div>
            </div>
          </div>
        )
      })}

      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-10">
        <div className="bg-background/80 backdrop-blur-sm px-2.5 sm:px-3 py-1.5 sm:py-2 rounded border border-border text-[11px] sm:text-xs font-mono space-y-1">
          <div className="text-muted-foreground">REGION: {region.toUpperCase()}</div>
          <div className="text-muted-foreground">DETECTIONS: {detections.length}</div>
        </div>
      </div>
    </main>
  )
}
