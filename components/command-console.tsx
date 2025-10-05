"use client"

import { useState, type KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RotateCcw, Send, Loader2, CircleCheck, AlertTriangle, Orbit } from "lucide-react"

interface CommandHistory {
  id: string
  command: string
  timestamp: Date
  status: "processing" | "completed" | "error"
}

interface CommandConsoleProps {
  onCommandSubmit: (command: string) => Promise<void>
  isProcessing: boolean
  onReset?: () => void
}

const EXAMPLE_COMMANDS = [
  "Confirm active fire activity over Seville",
  "Assess river overflow along the Guadalquivir",
]

export function CommandConsole({ onCommandSubmit, isProcessing, onReset }: CommandConsoleProps) {
  const [input, setInput] = useState("")
  const [history, setHistory] = useState<CommandHistory[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const updateHistoryStatus = (id: string, status: CommandHistory["status"]) => {
    setHistory((prev) => prev.map((entry) => (entry.id === id ? { ...entry, status } : entry)))
  }

  const handleSubmit = async () => {
    const commandValue = input.trim()
    if (!commandValue || isProcessing) return

    const newCommand: CommandHistory = {
      id: Date.now().toString(),
      command: commandValue,
      timestamp: new Date(),
      status: "processing",
    }

    setHistory((prev) => [newCommand, ...prev])
    setInput("")
    setHistoryIndex(-1)

    try {
      await onCommandSubmit(commandValue)
      updateHistoryStatus(newCommand.id, "completed")
    } catch (error) {
      console.error("[console]", error)
      updateHistoryStatus(newCommand.id, "error")
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (history.length > 0 && historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setInput(history[newIndex].command)
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setInput(history[newIndex].command)
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setInput("")
      }
    }
  }

  const handleExampleClick = (command: string) => {
    if (isProcessing) return
    setInput(command)
  }

  const handleReset = () => {
    setHistory([])
    setInput("")
    setHistoryIndex(-1)
    onReset?.()
  }

  return (
    <footer className="flex-shrink-0 border-t border-border bg-card/50 backdrop-blur-sm flex flex-col lg:h-48">
      <div className="p-3 border-b border-border flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Command Console</h2>
        <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 text-xs self-start sm:self-auto">
          <RotateCcw className="w-3 h-3 mr-1" />
          Reset
        </Button>
      </div>

      <div className="relative flex-1 flex flex-col lg:flex-row gap-3 p-3">
        {isProcessing && (
          <div className="pointer-events-none absolute top-2 right-3 flex items-center gap-1 rounded-full border border-border bg-background/80 px-2 py-1 text-[11px] font-medium text-muted-foreground shadow-sm">
            <Loader2 className="w-3 h-3 animate-spin text-primary" />
            <Orbit className="w-3.5 h-3.5 text-primary" />
            <span className="tracking-wide uppercase">Processing onboard</span>
          </div>
        )}
        {/* Command History */}
        <div className="w-full lg:w-56 flex flex-col">
          <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">History</div>
          <ScrollArea className="flex-1 max-h-40 lg:max-h-none -mx-2 px-2">
            <div className="space-y-2">
              {history.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-4">No commands yet</div>
              ) : (
                history.map((cmd, index) => (
                  <div
                    key={cmd.id}
                    className="p-2 rounded bg-background/50 border border-border text-xs animate-in fade-in slide-in-from-bottom duration-200 hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => setInput(cmd.command)}
                    style={{
                      animationDelay: `${index * 30}ms`,
                    }}
                  >
                    <div className="font-mono text-muted-foreground mb-1 tabular-nums">
                      {cmd.timestamp.toLocaleTimeString("en-US", { hour12: false })}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="line-clamp-2 flex-1">{cmd.command}</div>
                      {cmd.status === "completed" && <CircleCheck className="w-3.5 h-3.5 text-emerald-500" />}
                      {cmd.status === "error" && <AlertTriangle className="w-3.5 h-3.5 text-destructive" />}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Input Area */}
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Send a command to the satellite... (↑↓ to browse history)"
              disabled={isProcessing}
              className="flex-1 bg-background"
            />
            <Button onClick={handleSubmit} disabled={!input.trim() || isProcessing} className="px-6 sm:self-auto">
              {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              {isProcessing ? "Processing" : "Send"}
            </Button>
          </div>
          {/* Example Commands */}
          <div className="flex flex-col gap-2">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Quick Commands</div>
            <div className="flex gap-2 flex-wrap">
              {EXAMPLE_COMMANDS.map((cmd) => (
                <Button
                  key={cmd}
                  variant="outline"
                  size="sm"
                  onClick={() => handleExampleClick(cmd)}
                  disabled={isProcessing}
                  className="text-xs h-7 hover:bg-primary/10 transition-colors"
                >
                  {cmd}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
