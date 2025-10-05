"use client"

import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { SystemEvent } from "@/types/analysis"
import { AlertCircle, CheckCircle, Info, Zap } from "lucide-react"

interface ResponsePanelProps {
  events: SystemEvent[]
  onEventClick?: (event: SystemEvent) => void
}

export function ResponsePanel({ events, onEventClick }: ResponsePanelProps) {
  const getEventIcon = (type: SystemEvent["type"]) => {
    switch (type) {
      case "detection":
        return <AlertCircle className="w-4 h-4" />
      case "confirmation":
        return <CheckCircle className="w-4 h-4" />
      case "report":
        return <Info className="w-4 h-4" />
      case "processing":
        return <Zap className="w-4 h-4" />
      default:
        return <Info className="w-4 h-4" />
    }
  }

  const getEventColor = (type: SystemEvent["type"]) => {
    switch (type) {
      case "detection":
        return "text-destructive"
      case "confirmation":
        return "text-accent"
      case "report":
        return "text-primary"
      case "processing":
        return "text-chart-4"
      default:
        return "text-muted-foreground"
    }
  }

  const getSeverityColor = (severity: SystemEvent["severity"]) => {
    switch (severity) {
      case "critical":
        return "bg-destructive/20 text-destructive border-destructive/50"
      case "warning":
        return "bg-chart-4/20 text-chart-4 border-chart-4/50"
      case "info":
      default:
        return "bg-accent/20 text-accent border-accent/50"
    }
  }

  const getSeverityLabel = (severity: SystemEvent["severity"]) => {
    switch (severity) {
      case "critical":
        return "CRITICAL"
      case "warning":
        return "WARNING"
      case "info":
      default:
        return "INFO"
    }
  }

  const getCardAccent = (severity: SystemEvent["severity"]) => {
    switch (severity) {
      case "critical":
        return "border-l-destructive"
      case "warning":
        return "border-l-chart-4"
      case "info":
      default:
        return "border-l-accent"
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
  }

  return (
    <aside className="border border-border rounded-2xl bg-card/40 backdrop-blur-sm flex flex-col max-h-[320px] lg:max-h-none">
      <div className="p-3 border-b border-border flex items-center justify-between gap-2">
        <h2 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">System Events</h2>
        <Badge variant="outline" className="text-xs">
          {events.length}
        </Badge>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {events.length === 0 ? (
            <div className="text-xs text-muted-foreground text-center py-8">No events yet</div>
          ) : (
            events.map((event, index) => (
              <div
                key={event.id}
                onClick={() => onEventClick?.(event)}
                className={`group p-2.5 rounded-lg bg-background/60 border border-border border-l-4 ${getCardAccent(event.severity)} hover:border-primary/50 hover:bg-background/80 transition-all cursor-pointer animate-in fade-in slide-in-from-right duration-300`}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <div className="flex items-start gap-2.5">
                  <div className={`mt-0.5 ${getEventColor(event.type)} transition-transform group-hover:scale-110`}>
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-mono text-muted-foreground tabular-nums">
                        {formatTime(event.timestamp)}
                      </span>
                      <Badge variant="outline" className={`text-xs font-semibold ${getSeverityColor(event.severity)}`}>
                        {getSeverityLabel(event.severity)}
                      </Badge>
                    </div>
                    <p className="text-xs leading-relaxed">{event.message}</p>
                    {event.confidence !== undefined && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Confidence:</span>
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent transition-all duration-1000 ease-out"
                            style={{ width: `${event.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium tabular-nums">{event.confidence}%</span>
                      </div>
                    )}
                    {event.coordinates && (
                      <div className="mt-1 text-xs font-mono text-muted-foreground tabular-nums">
                        {event.coordinates}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </aside>
  )
}
