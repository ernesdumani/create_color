export interface DreamPalette {
  id: string
  dreamText: string
  colors: string[]
  emotions: string[]
  symbols: Array<{ symbol: string; meaning: string; intensity: number }>
  mood: string
  timestamp: number
  title: string
}

export const symbolColorMap: Record<string, string[]> = {
  water: ["#0077be", "#4a90e2", "#87ceeb", "#20b2aa"],
  fire: ["#ff4500", "#ff6347", "#ffa500", "#dc143c"],
  sky: ["#87ceeb", "#4169e1", "#6495ed", "#b0c4de"],
  earth: ["#8b4513", "#a0522d", "#daa520", "#cd853f"],
  forest: ["#228b22", "#32cd32", "#90ee90", "#006400"],
  night: ["#191970", "#483d8b", "#2f4f4f", "#000080"],
  light: ["#ffffe0", "#fffacd", "#f0e68c", "#ffd700"],
  shadow: ["#2f2f2f", "#696969", "#708090", "#4a4a4a"],
  blood: ["#8b0000", "#dc143c", "#b22222", "#800000"],
  gold: ["#ffd700", "#ffb347", "#daa520", "#b8860b"],
}

export const emotionColorMap: Record<string, string[]> = {
  peaceful: ["#e6f3ff", "#b3d9ff", "#87ceeb", "#4a90e2"],
  anxious: ["#ff6b6b", "#ffa07a", "#ff7f50", "#ff4500"],
  mysterious: ["#4b0082", "#663399", "#8a2be2", "#9370db"],
  joyful: ["#ffff00", "#ffd700", "#ffa500", "#ff69b4"],
  melancholic: ["#4682b4", "#5f9ea0", "#708090", "#2f4f4f"],
  energetic: ["#ff1493", "#ff4500", "#ffa500", "#32cd32"],
  chaotic: ["#ff0000", "#ff4500", "#8b008b", "#4b0082"],
  serene: ["#e0ffff", "#f0f8ff", "#e6e6fa", "#d8bfd8"],
}

export function generateDreamPalette(interpretation: any): string[] {
  const colors: string[] = []

  // Add colors from AI suggestions
  if (interpretation.colorSuggestions) {
    colors.push(...interpretation.colorSuggestions.map((c: any) => c.color))
  }

  // Add colors based on mood
  if (interpretation.overallMood && emotionColorMap[interpretation.overallMood]) {
    colors.push(...emotionColorMap[interpretation.overallMood].slice(0, 2))
  }

  // Add colors based on symbols
  interpretation.symbols?.forEach((symbol: any) => {
    const symbolColors = symbolColorMap[symbol.symbol.toLowerCase()]
    if (symbolColors) {
      const intensity = symbol.intensity || 0.5
      const numColors = Math.ceil(intensity * 2)
      colors.push(...symbolColors.slice(0, numColors))
    }
  })

  // Ensure we have at least 5 colors and at most 8
  const uniqueColors = [...new Set(colors)]
  if (uniqueColors.length < 5) {
    // Add some default dreamy colors
    uniqueColors.push("#e6e6fa", "#f0f8ff", "#ffe4e1", "#f5f5dc", "#e0ffff")
  }

  return uniqueColors.slice(0, 8)
}

export function saveDreamPalette(palette: DreamPalette) {
  const saved = getSavedPalettes()
  saved.unshift(palette)
  localStorage.setItem("lucidHue_palettes", JSON.stringify(saved.slice(0, 50))) // Keep last 50
}

export function getSavedPalettes(): DreamPalette[] {
  if (typeof window === "undefined") return []
  const saved = localStorage.getItem("lucidHue_palettes")
  return saved ? JSON.parse(saved) : []
}
