import type { Detection } from "@/types/analysis"

export type ScenarioId = "seville-multi"

export interface Scenario {
  id: ScenarioId
  label: string
  description: string
  region: "seville"
  mode: "fire-detection" | "flood-monitoring" | "standard"
  asset: {
    path: string
    mimeType: string
  }
  detections: Detection[]
}

export const SCENARIOS: Record<ScenarioId, Scenario> = {
  "seville-multi": {
    id: "seville-multi",
    label: "Seville Hazard Watch",
    description: "Wildfire and river overflow monitoring over the Guadalquivir corridor",
    region: "seville",
    mode: "fire-detection",
    asset: {
      path: "/observations/seville-live.png",
      mimeType: "image/png",
    },
    detections: [
      {
        id: "fire-core",
        type: "fire",
        x: 91.8,
        y: 20.5,
        confidence: 94,
        label: "Wildfire origin",
      },
    ],
  },
}

const REGION_KEYWORDS: Record<string, ScenarioId> = {
  sevilla: "seville-multi",
  seville: "seville-multi",
  "seville fire": "seville-multi",
  wildfire: "seville-multi",
  incendio: "seville-multi",
  smoke: "seville-multi",
  flood: "seville-multi",
  flooding: "seville-multi",
  overflow: "seville-multi",
  overflowing: "seville-multi",
  river: "seville-multi",
  inundation: "seville-multi",
  guadalquivir: "seville-multi",
}

export function matchScenario(command: string): Scenario | undefined {
  const normalized = command.toLowerCase()
  for (const [keyword, scenarioId] of Object.entries(REGION_KEYWORDS)) {
    if (normalized.includes(keyword)) {
      return SCENARIOS[scenarioId]
    }
  }
  return undefined
}
