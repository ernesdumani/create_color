"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Moon, Clock, Sparkles, Code, TrendingUpIcon as Trending } from "lucide-react"
import DreamInput from "@/components/dream-input"
import DreamTimeline from "@/components/dream-timeline"
import ColorGenerator from "@/components/color-generator"
import type { DreamPalette } from "@/lib/color-mapping"

export default function LucidHuePage() {
  const [refreshTimeline, setRefreshTimeline] = useState(0)
  const [dreamPalettes, setDreamPalettes] = useState<DreamPalette[]>([])

  const handlePaletteGenerated = (palette: DreamPalette) => {
    setRefreshTimeline((prev) => prev + 1)
    setDreamPalettes((prev) => [palette, ...prev])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Moon className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              LucidHue
            </h1>
            <Sparkles className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-lg text-purple-700 max-w-3xl mx-auto">
            The ultimate color toolkit for creatives. Transform dreams into palettes, generate professional color
            schemes, and discover the perfect colors for your next project.
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="dreams" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="dreams" className="flex items-center gap-2">
              <Moon className="w-4 h-4" />
              Dream Palettes
            </TabsTrigger>
            <TabsTrigger value="generator" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              Pro Generator
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="inspiration" className="flex items-center gap-2">
              <Trending className="w-4 h-4" />
              Inspiration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dreams">
            <DreamInput onPaletteGenerated={handlePaletteGenerated} />
          </TabsContent>

          <TabsContent value="generator">
            <ColorGenerator dreamPalettes={dreamPalettes} />
          </TabsContent>

          <TabsContent value="timeline" key={refreshTimeline}>
            <DreamTimeline />
          </TabsContent>

          <TabsContent value="inspiration">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-purple-800 mb-4">Color Inspiration Hub</h2>
                <p className="text-purple-600 mb-6">
                  Discover trending palettes, color psychology insights, and design inspiration
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-lg">
                  <h3 className="font-bold text-lg mb-3 text-purple-800">🎨 Color Psychology</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>
                      <strong>Red:</strong> Energy, passion, urgency
                    </li>
                    <li>
                      <strong>Blue:</strong> Trust, calm, professional
                    </li>
                    <li>
                      <strong>Green:</strong> Growth, nature, harmony
                    </li>
                    <li>
                      <strong>Purple:</strong> Luxury, creativity, mystery
                    </li>
                    <li>
                      <strong>Orange:</strong> Enthusiasm, warmth, fun
                    </li>
                    <li>
                      <strong>Yellow:</strong> Happiness, optimism, attention
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-lg">
                  <h3 className="font-bold text-lg mb-3 text-purple-800">🎯 Design Tips</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Use 60-30-10 rule for color distribution</li>
                    <li>• Test accessibility with contrast checkers</li>
                    <li>• Consider color blindness (8% of men)</li>
                    <li>• Limit palette to 3-5 main colors</li>
                    <li>• Use neutral colors for large areas</li>
                    <li>• Bright colors for call-to-action elements</li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-lg">
                  <h3 className="font-bold text-lg mb-3 text-purple-800">🚀 Trending 2024</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Digital Lime (#32CD32)</li>
                    <li>• Viva Magenta (#BB2649)</li>
                    <li>• Classic Blue (#0F4C75)</li>
                    <li>• Living Coral (#FF6B6B)</li>
                    <li>• Ultra Violet (#6B5B95)</li>
                    <li>• Sage Green (#9CAF88)</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center mt-12 text-purple-600">
          <p className="text-sm">✨ Where dreams meet design, and creativity becomes reality ✨</p>
        </div>
      </div>
    </div>
  )
}
