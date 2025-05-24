"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Download, Trash2 } from "lucide-react"
import { getSavedPalettes, type DreamPalette } from "@/lib/color-mapping"
import DreamPalette3D from "./dream-palette-3d"

export default function DreamTimeline() {
  const [palettes, setPalettes] = useState<DreamPalette[]>([])
  const [selectedPalette, setSelectedPalette] = useState<DreamPalette | null>(null)

  useEffect(() => {
    setPalettes(getSavedPalettes())
  }, [])

  const deletePalette = (id: string) => {
    const updated = palettes.filter((p) => p.id !== id)
    setPalettes(updated)
    localStorage.setItem("lucidHue_palettes", JSON.stringify(updated))
    if (selectedPalette?.id === id) {
      setSelectedPalette(null)
    }
  }

  const exportPalette = (palette: DreamPalette) => {
    const data = {
      title: palette.title,
      colors: palette.colors,
      dreamText: palette.dreamText,
      mood: palette.mood,
      emotions: palette.emotions,
      symbols: palette.symbols,
      timestamp: new Date(palette.timestamp).toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `dream-palette-${palette.id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (palettes.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Clock className="w-12 h-12 mx-auto mb-4 text-purple-400" />
          <h3 className="text-lg font-semibold text-purple-800 mb-2">No Dream Palettes Yet</h3>
          <p className="text-purple-600">Create your first dream palette to see it here!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {palettes.map((palette) => (
          <Card
            key={palette.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedPalette?.id === palette.id ? "ring-2 ring-purple-500" : ""
            }`}
            onClick={() => setSelectedPalette(palette)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">{palette.title}</CardTitle>
              <p className="text-xs text-purple-600">{new Date(palette.timestamp).toLocaleDateString()}</p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1 mb-3">
                {palette.colors.slice(0, 6).map((color, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">{palette.dreamText}</p>
              <div className="flex gap-1 mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    exportPalette(palette)
                  }}
                  className="text-xs"
                >
                  <Download className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    deletePalette(palette.id)
                  }}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedPalette && (
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="text-purple-800">{selectedPalette.title}</CardTitle>
            <p className="text-sm text-purple-600">{new Date(selectedPalette.timestamp).toLocaleString()}</p>
          </CardHeader>
          <CardContent>
            <DreamPalette3D colors={selectedPalette.colors} title={selectedPalette.title} />

            <div className="mt-4 space-y-3">
              <div>
                <h4 className="font-semibold text-purple-800">Dream Description:</h4>
                <p className="text-sm text-gray-700 mt-1">{selectedPalette.dreamText}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-purple-800">Mood:</h4>
                  <p className="text-sm text-purple-600 capitalize">{selectedPalette.mood}</p>
                </div>

                {selectedPalette.emotions.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-purple-800">Emotions:</h4>
                    <p className="text-sm text-purple-600">{selectedPalette.emotions.join(", ")}</p>
                  </div>
                )}
              </div>

              {selectedPalette.symbols.length > 0 && (
                <div>
                  <h4 className="font-semibold text-purple-800">Symbols:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                    {selectedPalette.symbols.map((symbol, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium text-purple-700">{symbol.symbol}:</span>
                        <span className="text-gray-600 ml-1">{symbol.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
