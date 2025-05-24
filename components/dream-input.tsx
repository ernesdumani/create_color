"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Sparkles, Moon, Palette } from "lucide-react"
import DreamPalette3D from "./dream-palette-3d"
import { generateDreamPalette, saveDreamPalette, type DreamPalette } from "@/lib/color-mapping"

interface DreamInputProps {
  onPaletteGenerated?: (palette: DreamPalette) => void
}

export default function DreamInput({ onPaletteGenerated }: DreamInputProps) {
  const [dreamText, setDreamText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentPalette, setCurrentPalette] = useState<DreamPalette | null>(null)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dreamText.trim()) return

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/interpret-dream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dreamText }),
      })

      if (!response.ok) throw new Error("Failed to interpret dream")

      const interpretation = await response.json()
      const colors = generateDreamPalette(interpretation)

      const palette: DreamPalette = {
        id: Date.now().toString(),
        dreamText,
        colors,
        emotions: interpretation.emotions || [],
        symbols: interpretation.symbols || [],
        mood: interpretation.overallMood || "mysterious",
        timestamp: Date.now(),
        title: `Dream ${new Date().toLocaleDateString()}`,
      }

      setCurrentPalette(palette)
      saveDreamPalette(palette)
      onPaletteGenerated?.(palette)
    } catch (err) {
      setError("Failed to interpret your dream. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-purple-200">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl text-purple-800">
            <Moon className="w-6 h-6" />
            Describe Your Dream
            <Sparkles className="w-6 h-6" />
          </CardTitle>
          <p className="text-purple-600">
            Share the details of your dream, and watch as AI transforms it into a living color palette
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              value={dreamText}
              onChange={(e) => setDreamText(e.target.value)}
              placeholder="I dreamed I was walking through a misty forest at twilight. The trees seemed to whisper secrets, and there were glowing butterflies dancing around ancient stone circles..."
              className="min-h-32 resize-none border-purple-200 focus:border-purple-400"
              disabled={isLoading}
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button
              type="submit"
              disabled={!dreamText.trim() || isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Interpreting Dream...
                </>
              ) : (
                <>
                  <Palette className="w-4 h-4 mr-2" />
                  Generate Dream Palette
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {currentPalette && (
        <Card className="bg-black/5 border-purple-200">
          <CardHeader>
            <CardTitle className="text-center text-purple-800">Your Dream Palette</CardTitle>
            <div className="text-center space-y-2">
              <p className="text-sm text-purple-600">
                <strong>Mood:</strong> {currentPalette.mood}
              </p>
              {currentPalette.emotions.length > 0 && (
                <p className="text-sm text-purple-600">
                  <strong>Emotions:</strong> {currentPalette.emotions.join(", ")}
                </p>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <DreamPalette3D colors={currentPalette.colors} title={currentPalette.title} />

            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {currentPalette.colors.map((color, index) => (
                <div
                  key={index}
                  className="w-12 h-12 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>

            {currentPalette.symbols.length > 0 && (
              <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">Dream Symbols Detected:</h4>
                <div className="space-y-1">
                  {currentPalette.symbols.map((symbol, index) => (
                    <p key={index} className="text-sm text-purple-700">
                      <strong>{symbol.symbol}:</strong> {symbol.meaning}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
