"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Palette, Download, Copy, Shuffle, Accessibility, Sparkles, Code, Save } from "lucide-react"
import {
  colorHarmonies,
  trendingPalettes,
  checkAccessibility,
  exportToCSS,
  exportToSass,
  exportToTailwind,
  exportToJSON,
  type ColorPalette,
  type ColorHarmony,
} from "@/lib/color-utils"

interface ColorGeneratorProps {
  dreamPalettes?: ColorPalette[]
}

export default function ColorGenerator({ dreamPalettes = [] }: ColorGeneratorProps) {
  const [baseColor, setBaseColor] = useState("#3b82f6")
  const [selectedHarmony, setSelectedHarmony] = useState<ColorHarmony>(colorHarmonies[0])
  const [currentPalette, setCurrentPalette] = useState<ColorPalette | null>(null)
  const [savedPalettes, setSavedPalettes] = useState<ColorPalette[]>([])
  const [exportFormat, setExportFormat] = useState<"css" | "sass" | "tailwind" | "json">("css")

  useEffect(() => {
    generatePalette()
  }, [baseColor, selectedHarmony])

  useEffect(() => {
    // Load saved palettes from localStorage
    const saved = localStorage.getItem("designer_palettes")
    if (saved) {
      setSavedPalettes(JSON.parse(saved))
    }
  }, [])

  const generatePalette = () => {
    const colors = selectedHarmony.generator(baseColor)
    const palette: ColorPalette = {
      id: Date.now().toString(),
      name: `${selectedHarmony.name} Palette`,
      colors,
      type: "harmony",
      description: selectedHarmony.description,
      tags: [selectedHarmony.name.toLowerCase(), "generated"],
      createdAt: Date.now(),
    }
    setCurrentPalette(palette)
  }

  const randomizeColor = () => {
    const randomColor = `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")}`
    setBaseColor(randomColor)
  }

  const savePalette = (palette: ColorPalette) => {
    const updated = [palette, ...savedPalettes.filter((p) => p.id !== palette.id)]
    setSavedPalettes(updated)
    localStorage.setItem("designer_palettes", JSON.stringify(updated))
    showToast("Palette saved successfully!")
  }

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color)
    showToast(`Copied ${color} to clipboard!`)
  }

  const exportPalette = (palette: ColorPalette, format: string) => {
    let content = ""
    let filename = ""

    switch (format) {
      case "css":
        content = exportToCSS(palette)
        filename = `${palette.name.toLowerCase().replace(/\s+/g, "-")}.css`
        break
      case "sass":
        content = exportToSass(palette)
        filename = `${palette.name.toLowerCase().replace(/\s+/g, "-")}.scss`
        break
      case "tailwind":
        content = exportToTailwind(palette)
        filename = `tailwind-colors.js`
        break
      case "json":
        content = exportToJSON(palette)
        filename = `${palette.name.toLowerCase().replace(/\s+/g, "-")}.json`
        break
    }

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    showToast(`Exported as ${format.toUpperCase()}!`)
  }

  const showToast = (message: string) => {
    // Simple toast implementation
    const toast = document.createElement("div")
    toast.style.cssText = `
      position: fixed; top: 20px; right: 20px; background: #10b981; color: white;
      padding: 12px 20px; border-radius: 8px; z-index: 1000; font-size: 14px;
    `
    toast.textContent = message
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 3000)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl text-blue-800">
            <Code className="w-6 h-6" />
            Professional Color Generator
            <Palette className="w-6 h-6" />
          </CardTitle>
          <p className="text-blue-600">
            Create perfect color palettes for your designs with color theory, accessibility checking, and export tools
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="generator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generator">Generator</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
          <TabsTrigger value="dreams">Dream Palettes</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          {/* Color Input and Harmony Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Color Harmony Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2">
                  <label htmlFor="baseColor" className="text-sm font-medium">
                    Base Color:
                  </label>
                  <Input
                    id="baseColor"
                    type="color"
                    value={baseColor}
                    onChange={(e) => setBaseColor(e.target.value)}
                    className="w-16 h-10 p-1 border-2"
                  />
                  <span className="text-sm text-gray-600">{baseColor}</span>
                </div>
                <Button onClick={randomizeColor} variant="outline" size="sm">
                  <Shuffle className="w-4 h-4 mr-2" />
                  Random
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {colorHarmonies.map((harmony) => (
                  <Button
                    key={harmony.name}
                    variant={selectedHarmony.name === harmony.name ? "default" : "outline"}
                    onClick={() => setSelectedHarmony(harmony)}
                    className="text-left h-auto p-3"
                  >
                    <div>
                      <div className="font-medium">{harmony.name}</div>
                      <div className="text-xs opacity-70">{harmony.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Generated Palette Display */}
          {currentPalette && (
            <PaletteDisplay
              palette={currentPalette}
              onSave={savePalette}
              onExport={exportPalette}
              onCopyColor={copyColor}
              exportFormat={exportFormat}
              setExportFormat={setExportFormat}
            />
          )}
        </TabsContent>

        <TabsContent value="trending">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trendingPalettes.map((palette) => (
              <PaletteCard
                key={palette.id}
                palette={palette}
                onSave={savePalette}
                onExport={exportPalette}
                onCopyColor={copyColor}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="saved">
          {savedPalettes.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Save className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Saved Palettes</h3>
                <p className="text-gray-500">Generate and save palettes to see them here!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedPalettes.map((palette) => (
                <PaletteCard
                  key={palette.id}
                  palette={palette}
                  onSave={savePalette}
                  onExport={exportPalette}
                  onCopyColor={copyColor}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="dreams">
          {dreamPalettes.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                <h3 className="text-lg font-semibold text-purple-600 mb-2">No Dream Palettes</h3>
                <p className="text-purple-500">Create dream palettes in the LucidHue tab to use them here!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dreamPalettes.map((palette) => (
                <PaletteCard
                  key={palette.id}
                  palette={palette}
                  onSave={savePalette}
                  onExport={exportPalette}
                  onCopyColor={copyColor}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PaletteDisplay({
  palette,
  onSave,
  onExport,
  onCopyColor,
  exportFormat,
  setExportFormat,
}: {
  palette: ColorPalette
  onSave: (palette: ColorPalette) => void
  onExport: (palette: ColorPalette, format: string) => void
  onCopyColor: (color: string) => void
  exportFormat: string
  setExportFormat: (format: "css" | "sass" | "tailwind" | "json") => void
}) {
  const accessibility = checkAccessibility(palette.colors[0], "#ffffff")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{palette.name}</span>
          <div className="flex gap-2">
            <Button onClick={() => onSave(palette)} size="sm" variant="outline">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as any)}
              className="px-3 py-1 border rounded text-sm"
            >
              <option value="css">CSS</option>
              <option value="sass">Sass</option>
              <option value="tailwind">Tailwind</option>
              <option value="json">JSON</option>
            </select>
            <Button onClick={() => onExport(palette, exportFormat)} size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardTitle>
        <p className="text-sm text-gray-600">{palette.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Color Swatches */}
        <div className="grid grid-cols-5 gap-2">
          {palette.colors.map((color, index) => (
            <div key={index} className="space-y-2">
              <div
                className="h-20 rounded-lg cursor-pointer border-2 border-white shadow-lg hover:scale-105 transition-transform"
                style={{ backgroundColor: color }}
                onClick={() => onCopyColor(color)}
                title={`Click to copy ${color}`}
              />
              <div className="text-center">
                <div className="text-xs font-mono">{color}</div>
                <Button variant="ghost" size="sm" onClick={() => onCopyColor(color)} className="h-6 px-2 text-xs">
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Accessibility Info */}
        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
          <Accessibility className="w-5 h-5 text-blue-600" />
          <div className="flex-1">
            <div className="text-sm font-medium">Accessibility Check (vs White Text)</div>
            <div className="text-xs text-gray-600">
              Contrast Ratio: {accessibility.contrastRatio} | WCAG AA: {accessibility.wcagAA ? "✅" : "❌"} | WCAG AAA:{" "}
              {accessibility.wcagAAA ? "✅" : "❌"}
            </div>
          </div>
        </div>

        {/* Tags */}
        {palette.tags && (
          <div className="flex flex-wrap gap-2">
            {palette.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PaletteCard({
  palette,
  onSave,
  onExport,
  onCopyColor,
}: {
  palette: ColorPalette
  onSave: (palette: ColorPalette) => void
  onExport: (palette: ColorPalette, format: string) => void
  onCopyColor: (color: string) => void
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{palette.name}</CardTitle>
        <p className="text-sm text-gray-600">{palette.description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-1">
          {palette.colors.map((color, index) => (
            <div
              key={index}
              className="flex-1 h-12 rounded cursor-pointer hover:scale-105 transition-transform"
              style={{ backgroundColor: color }}
              onClick={() => onCopyColor(color)}
              title={color}
            />
          ))}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex flex-wrap gap-1">
            {palette.tags?.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2">
            <Button onClick={() => onSave(palette)} size="sm" variant="outline">
              <Save className="w-3 h-3" />
            </Button>
            <Button onClick={() => onExport(palette, "css")} size="sm" variant="outline">
              <Download className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
