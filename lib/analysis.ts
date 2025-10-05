"use client"

import type { AnalysisResult, AnalysisResponsePayload, SystemEvent } from "@/types/analysis"

const API_ENDPOINT = "/api/analyze"

function toClientEvent(event: AnalysisResponsePayload["events"][number]): SystemEvent {
  return {
    ...event,
    timestamp: new Date(event.timestamp),
  }
}

export async function analyzeCommand(command: string): Promise<AnalysisResult> {
  const response = await fetch(API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ command }),
  })

  if (!response.ok) {
    throw new Error(`Analysis request failed with status ${response.status}`)
  }

  const payload: AnalysisResponsePayload = await response.json()

  if (!payload.success) {
    throw new Error(payload.error || "Unknown analysis error")
  }

  if (payload.scenarioId) {
    const baseDelayMs = 5000
    const jitterMs = Math.random() * 2000 - 1000
    const totalDelay = Math.max(0, Math.round(baseDelayMs + jitterMs))
    if (totalDelay > 0) {
      await new Promise((resolve) => setTimeout(resolve, totalDelay))
    }
  }

  return {
    summary: payload.summary,
    mode: payload.mode,
    region: payload.region,
    scenarioId: payload.scenarioId,
    detections: payload.detections,
    events: payload.events.map(toClientEvent),
    rawModelOutput: payload.rawModelOutput,
  }
}
