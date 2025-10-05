import { NextRequest, NextResponse } from "next/server"

import { matchScenario } from "@/lib/scenarios"
import type { AnalysisResponsePayload, SystemEventPayload } from "@/types/analysis"

export const runtime = "edge"

function normalizeCommand(command: string) {
  return command
    .trim()
    .toLowerCase()
    .replace(/[\s\u00a0]+/g, " ")
    .replace(/[.!?]+$/g, "")
}

const FIRE_COMMANDS = new Set([
  normalizeCommand("Confirm active fire activity over Seville"),
  normalizeCommand("Confirm active fire activity over Sevilla"),
])

const FLOOD_COMMANDS = new Set([
  normalizeCommand("Assess river overflow along the Guadalquivir"),
  normalizeCommand("Assess river overflow along the Guadalquivir river"),
])

function nowIso(offsetMs = 0) {
  return new Date(Date.now() + offsetMs).toISOString()
}

function severityFromDangerLevel(level?: number) {
  if (!level) return "info"
  if (level >= 3) return "critical"
  if (level === 2) return "warning"
  return "info"
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const command: string | undefined = body?.command

    if (!command || typeof command !== "string") {
      return NextResponse.json<AnalysisResponsePayload>(
        {
          success: false,
          summary: "",
          mode: "standard",
          region: "global",
          detections: [],
          events: [],
          error: "Missing command",
        },
        { status: 400 },
      )
    }

    const scenario = matchScenario(command)
    const normalizedCommand = normalizeCommand(command)

    if (!scenario) {
      const refusalMessage = "Not authorized to respond outside the Seville wildfire and Guadalquivir overflow templates."
      const events: SystemEventPayload[] = [
        {
          id: `evt-summary-${Date.now()}`,
          timestamp: nowIso(),
          type: "report",
          message: refusalMessage,
          severity: "info",
        },
      ]

      const refusalPayload: AnalysisResponsePayload = {
        success: true,
        summary: refusalMessage,
        mode: "standard",
        region: "global",
        detections: [],
        events,
        rawModelOutput: undefined,
        scenarioId: undefined,
        error: undefined,
      }

      return NextResponse.json(refusalPayload)
    }

    let summary = ""
    let alerts: Array<{ dangerLevel: number; description: string; coordinates?: string }> = []
    let derivedMode: "fire-detection" | "flood-monitoring" | "standard" = "standard"

    if (FIRE_COMMANDS.has(normalizedCommand)) {
      derivedMode = "fire-detection"
      summary =
        "Wildfire origin pinned east of Seville at normalized (x=0.9180, y=0.2050) with smoke curling toward peri-urban corridors near (0.9450, 0.1680)."
      alerts = [
        {
          dangerLevel: 3,
          description: "Wildfire ignition at (0.9180, 0.2050) with plume bending toward peri-urban areas near (0.9450, 0.1680).",
          coordinates: "Normalized position: (0.9180, 0.2050)",
        },
      ]
    } else if (FLOOD_COMMANDS.has(normalizedCommand)) {
      derivedMode = "flood-monitoring"
      summary = "No Guadalquivir overflow near Seville; channel occupancy holds near 30% capacity with banks stable."
      alerts = []
    } else {
      const refusalMessage = "Not authorized to respond outside the Seville wildfire and Guadalquivir overflow templates."
      const events: SystemEventPayload[] = [
        {
          id: `evt-summary-${Date.now()}`,
          timestamp: nowIso(),
          type: "report",
          message: refusalMessage,
          severity: "info",
        },
      ]

      const refusalPayload: AnalysisResponsePayload = {
        success: true,
        summary: refusalMessage,
        mode: "standard",
        region: "global",
        detections: [],
        events,
        rawModelOutput: undefined,
        scenarioId: undefined,
        error: undefined,
      }

      return NextResponse.json(refusalPayload)
    }

    const scenarioDetections = scenario.detections
    const filteredDetections =
      derivedMode === "fire-detection"
        ? scenarioDetections.filter((d) => d.type === "fire")
        : derivedMode === "flood-monitoring"
          ? scenarioDetections.filter((d) => d.type === "flood")
          : scenarioDetections

    const primaryDangerLevel = alerts.length > 0 ? alerts[0].dangerLevel : undefined
    const primarySeverity = severityFromDangerLevel(primaryDangerLevel)

    const events: SystemEventPayload[] = [
      {
        id: `evt-primary-${Date.now()}`,
        timestamp: nowIso(),
        type: primarySeverity === "critical" || primarySeverity === "warning" ? "detection" : "report",
        message: summary,
        severity: primarySeverity,
        coordinates: alerts[0]?.coordinates,
        confidence: filteredDetections[0]?.confidence,
      },
    ]

    const responsePayload: AnalysisResponsePayload = {
      success: true,
      summary,
      mode: derivedMode,
      region: scenario.region,
      detections: filteredDetections,
      events,
      rawModelOutput: "offline-demo",
      scenarioId: scenario.id,
      error: undefined,
    }

    return NextResponse.json(responsePayload)
  } catch (error) {
    console.error("[api/analyze]", error)
    return NextResponse.json<AnalysisResponsePayload>(
      {
        success: false,
        summary: "",
        mode: "standard",
        region: "global",
        detections: [],
        events: [],
        error: error instanceof Error ? error.message : "Unexpected error",
      },
      { status: 500 },
    )
  }
}
