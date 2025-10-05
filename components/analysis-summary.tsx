"use client"

import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { Detection } from "@/types/analysis"
import { Loader2 } from "lucide-react"

interface AnalysisSummaryProps {
  summary: string
  scenarioId?: string
  source: "llm" | null
  detections: Detection[]
  isProcessing: boolean
}

const SUPPRESSED_SUMMARY =
  "Wildfire origin pinned east of Seville at normalized (x=0.9180, y=0.2050) with smoke curling toward peri-urban corridors near (0.9450, 0.1680)."

export function AnalysisSummary({ summary, detections, isProcessing }: AnalysisSummaryProps) {
  const trimmedSummary = summary.trim()
  const suppressSummary = trimmedSummary === SUPPRESSED_SUMMARY
  const hasSummaryContent = Boolean(trimmedSummary) && !suppressSummary
  const hasContent = hasSummaryContent || detections.length > 0
  const shouldRenderSummaryCard = isProcessing || hasSummaryContent
  const detectionPreview = detections.slice(0, 3)
  const extraCount = detections.length - detectionPreview.length
  const showDetectionRow = isProcessing || detectionPreview.length > 0

  if (!hasContent && !isProcessing) {
    return null
  }

  return (
    <section className="flex-shrink-0 px-4 sm:px-6 py-4 border-b border-border bg-card/40 backdrop-blur-sm">
      <div className="flex flex-col gap-3">

        {shouldRenderSummaryCard && (
          <div className="rounded-lg border border-border bg-background/70 p-4 shadow-sm">
            {isProcessing && !trimmedSummary ? (
              <div className="space-y-2">
                <Skeleton className="h-3 w-1/2" />
              </div>
            ) : (
              hasSummaryContent && (
                <p className="text-sm leading-relaxed text-muted-foreground">{trimmedSummary}</p>
              )
            )}
          </div>
        )}


        {showDetectionRow && (
          <div className="flex flex-wrap items-center gap-2">
            {isProcessing ? (
              <Badge variant="outline" className="gap-2 text-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                Syncing hazard telemetry...
              </Badge>
            ) : (
              <>
                {detectionPreview.map((detection) => (
                  <Badge key={detection.id} variant="secondary" className="gap-2 text-xs">
                    {detection.label}
                    <span className="font-mono text-[11px] text-muted-foreground">{Math.round(detection.confidence)}%</span>
                  </Badge>
                ))}
                {extraCount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    +{extraCount} more detection{extraCount > 1 ? "s" : ""}
                  </Badge>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
