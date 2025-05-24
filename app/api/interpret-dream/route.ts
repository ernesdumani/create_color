import type { NextRequest } from "next/server"

// Free dream interpretation without OpenAI
export async function POST(request: NextRequest) {
  try {
    const { dreamText } = await request.json()

    if (!dreamText || dreamText.trim().length === 0) {
      return Response.json({ error: "Dream text is required" }, { status: 400 })
    }

    // Analyze dream using our free interpretation system
    const interpretation = interpretDreamOffline(dreamText)

    return Response.json(interpretation)
  } catch (error) {
    console.error("Dream interpretation error:", error)
    return Response.json({ error: "Failed to interpret dream" }, { status: 500 })
  }
}

function interpretDreamOffline(dreamText: string) {
  const text = dreamText.toLowerCase()

  // Symbol detection with color mappings
  const symbolDatabase = {
    water: {
      keywords: ["water", "ocean", "sea", "river", "lake", "rain", "swimming", "drowning", "waves", "flood"],
      meaning: "emotions, subconscious mind, cleansing, life flow",
      colors: ["#0077be", "#4a90e2", "#87ceeb", "#20b2aa"],
      intensity: 0.8,
    },
    fire: {
      keywords: ["fire", "flame", "burning", "smoke", "heat", "candle", "torch", "explosion"],
      meaning: "passion, transformation, destruction, energy",
      colors: ["#ff4500", "#ff6347", "#ffa500", "#dc143c"],
      intensity: 0.9,
    },
    sky: {
      keywords: ["sky", "clouds", "flying", "airplane", "birds", "heaven", "stars", "moon", "sun"],
      meaning: "freedom, aspirations, spirituality, limitless potential",
      colors: ["#87ceeb", "#4169e1", "#6495ed", "#b0c4de"],
      intensity: 0.7,
    },
    forest: {
      keywords: ["forest", "trees", "woods", "jungle", "leaves", "branches", "nature"],
      meaning: "growth, life force, mystery, natural wisdom",
      colors: ["#228b22", "#32cd32", "#90ee90", "#006400"],
      intensity: 0.6,
    },
    animals: {
      keywords: ["dog", "cat", "bird", "snake", "lion", "tiger", "wolf", "bear", "horse", "fish"],
      meaning: "instincts, primal nature, companionship, wild aspects",
      colors: ["#8b4513", "#a0522d", "#daa520", "#cd853f"],
      intensity: 0.7,
    },
    darkness: {
      keywords: ["dark", "night", "shadow", "black", "darkness", "midnight"],
      meaning: "unknown, fear, mystery, hidden aspects",
      colors: ["#191970", "#483d8b", "#2f4f4f", "#000080"],
      intensity: 0.8,
    },
    light: {
      keywords: ["light", "bright", "glow", "shine", "golden", "white", "illuminated"],
      meaning: "clarity, hope, divine guidance, enlightenment",
      colors: ["#ffffe0", "#fffacd", "#f0e68c", "#ffd700"],
      intensity: 0.9,
    },
    home: {
      keywords: ["house", "home", "room", "door", "window", "stairs", "kitchen", "bedroom"],
      meaning: "security, self, family, personal space",
      colors: ["#deb887", "#f5deb3", "#ffe4b5", "#ffefd5"],
      intensity: 0.5,
    },
    death: {
      keywords: ["death", "dying", "grave", "funeral", "ghost", "cemetery"],
      meaning: "transformation, endings, new beginnings, fear",
      colors: ["#2f2f2f", "#696969", "#708090", "#4a4a4a"],
      intensity: 0.8,
    },
    love: {
      keywords: ["love", "kiss", "romance", "heart", "wedding", "partner", "relationship"],
      meaning: "connection, affection, unity, emotional fulfillment",
      colors: ["#ff69b4", "#ff1493", "#ffc0cb", "#ffb6c1"],
      intensity: 0.7,
    },
  }

  // Emotion detection
  const emotionDatabase = {
    peaceful: {
      keywords: ["calm", "peaceful", "serene", "quiet", "still", "gentle", "soft"],
      colors: ["#e6f3ff", "#b3d9ff", "#87ceeb", "#4a90e2"],
    },
    anxious: {
      keywords: ["scared", "afraid", "worried", "nervous", "panic", "stress", "fear"],
      colors: ["#ff6b6b", "#ffa07a", "#ff7f50", "#ff4500"],
    },
    joyful: {
      keywords: ["happy", "joy", "laugh", "smile", "celebration", "party", "fun"],
      colors: ["#ffff00", "#ffd700", "#ffa500", "#ff69b4"],
    },
    mysterious: {
      keywords: ["strange", "weird", "mysterious", "unknown", "secret", "hidden"],
      colors: ["#4b0082", "#663399", "#8a2be2", "#9370db"],
    },
    melancholic: {
      keywords: ["sad", "cry", "tears", "lonely", "empty", "lost", "grief"],
      colors: ["#4682b4", "#5f9ea0", "#708090", "#2f4f4f"],
    },
    energetic: {
      keywords: ["running", "fast", "energy", "power", "strong", "active", "moving"],
      colors: ["#ff1493", "#ff4500", "#ffa500", "#32cd32"],
    },
  }

  // Detect symbols
  const detectedSymbols = []
  for (const [symbolName, symbolData] of Object.entries(symbolDatabase)) {
    for (const keyword of symbolData.keywords) {
      if (text.includes(keyword)) {
        detectedSymbols.push({
          symbol: symbolName,
          meaning: symbolData.meaning,
          intensity: symbolData.intensity,
        })
        break
      }
    }
  }

  // Detect emotions
  const detectedEmotions = []
  let overallMood = "mysterious"
  let moodScore = 0

  for (const [emotionName, emotionData] of Object.entries(emotionDatabase)) {
    let emotionScore = 0
    for (const keyword of emotionData.keywords) {
      if (text.includes(keyword)) {
        emotionScore++
      }
    }
    if (emotionScore > 0) {
      detectedEmotions.push(emotionName)
      if (emotionScore > moodScore) {
        moodScore = emotionScore
        overallMood = emotionName
      }
    }
  }

  // Generate color suggestions based on detected elements
  const colorSuggestions = []
  const allColors = new Set()

  // Add colors from detected symbols
  detectedSymbols.forEach((symbol) => {
    const symbolData = symbolDatabase[symbol.symbol as keyof typeof symbolDatabase]
    if (symbolData) {
      symbolData.colors.forEach((color) => {
        allColors.add(color)
        colorSuggestions.push({
          color,
          reasoning: `Represents ${symbol.symbol}: ${symbol.meaning}`,
        })
      })
    }
  })

  // Add colors from detected emotions
  detectedEmotions.forEach((emotion) => {
    const emotionData = emotionDatabase[emotion as keyof typeof emotionDatabase]
    if (emotionData) {
      emotionData.colors.slice(0, 2).forEach((color) => {
        allColors.add(color)
        colorSuggestions.push({
          color,
          reasoning: `Reflects ${emotion} emotional tone`,
        })
      })
    }
  })

  // If no specific elements detected, use default dreamy colors
  if (allColors.size === 0) {
    const defaultColors = ["#e6e6fa", "#f0f8ff", "#ffe4e1", "#f5f5dc", "#e0ffff"]
    defaultColors.forEach((color) => {
      allColors.add(color)
      colorSuggestions.push({
        color,
        reasoning: "Default dreamy atmosphere",
      })
    })
  }

  return {
    emotions: detectedEmotions.length > 0 ? detectedEmotions : ["mysterious"],
    symbols:
      detectedSymbols.length > 0
        ? detectedSymbols
        : [{ symbol: "dream", meaning: "subconscious exploration", intensity: 0.5 }],
    overallMood,
    colorSuggestions: colorSuggestions.slice(0, 8),
  }
}
