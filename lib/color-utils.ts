export interface ColorPalette {
  id: string
  name: string
  colors: string[]
  type: "custom" | "harmony" | "brand" | "dream" | "trending"
  description?: string
  tags?: string[]
  accessibility?: AccessibilityInfo
  createdAt: number
}

export interface AccessibilityInfo {
  wcagAA: boolean
  wcagAAA: boolean
  contrastRatio: number
}

export interface ColorHarmony {
  name: string
  description: string
  generator: (baseColor: string) => string[]
}

// Color conversion utilities
export function hexToHsl(hex: string): [number, number, number] {
  const r = Number.parseInt(hex.slice(1, 3), 16) / 255
  const g = Number.parseInt(hex.slice(3, 5), 16) / 255
  const b = Number.parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0,
    s = 0,
    l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return [h * 360, s * 100, l * 100]
}

export function hslToHex(h: number, s: number, l: number): string {
  h /= 360
  s /= 100
  l /= 100

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  let r, g, b
  if (s === 0) {
    r = g = b = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16)
    return hex.length === 1 ? "0" + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// Color harmony generators
export const colorHarmonies: ColorHarmony[] = [
  {
    name: "Complementary",
    description: "Colors opposite on the color wheel - high contrast and vibrant",
    generator: (baseColor: string) => {
      const [h, s, l] = hexToHsl(baseColor)
      return [
        baseColor,
        hslToHex((h + 180) % 360, s, l),
        hslToHex(h, s * 0.7, l * 1.2),
        hslToHex((h + 180) % 360, s * 0.7, l * 0.8),
        hslToHex(h, s * 0.4, l * 1.4),
      ]
    },
  },
  {
    name: "Triadic",
    description: "Three colors evenly spaced on the color wheel - balanced and vibrant",
    generator: (baseColor: string) => {
      const [h, s, l] = hexToHsl(baseColor)
      return [
        baseColor,
        hslToHex((h + 120) % 360, s, l),
        hslToHex((h + 240) % 360, s, l),
        hslToHex(h, s * 0.6, l * 1.2),
        hslToHex((h + 120) % 360, s * 0.6, l * 0.8),
      ]
    },
  },
  {
    name: "Analogous",
    description: "Adjacent colors on the color wheel - harmonious and pleasing",
    generator: (baseColor: string) => {
      const [h, s, l] = hexToHsl(baseColor)
      return [
        hslToHex((h - 30) % 360, s, l),
        baseColor,
        hslToHex((h + 30) % 360, s, l),
        hslToHex(h, s * 0.7, l * 1.3),
        hslToHex(h, s * 0.5, l * 0.7),
      ]
    },
  },
  {
    name: "Monochromatic",
    description: "Different shades and tints of the same color - elegant and cohesive",
    generator: (baseColor: string) => {
      const [h, s, l] = hexToHsl(baseColor)
      return [
        hslToHex(h, s, Math.min(95, l * 1.4)),
        hslToHex(h, s * 0.8, Math.min(90, l * 1.2)),
        baseColor,
        hslToHex(h, s * 1.1, l * 0.8),
        hslToHex(h, s * 1.2, l * 0.6),
      ]
    },
  },
  {
    name: "Split Complementary",
    description: "Base color plus two colors adjacent to its complement - softer than complementary",
    generator: (baseColor: string) => {
      const [h, s, l] = hexToHsl(baseColor)
      return [
        baseColor,
        hslToHex((h + 150) % 360, s, l),
        hslToHex((h + 210) % 360, s, l),
        hslToHex(h, s * 0.6, l * 1.2),
        hslToHex((h + 180) % 360, s * 0.4, l * 0.9),
      ]
    },
  },
  {
    name: "Tetradic",
    description: "Four colors forming a rectangle on the color wheel - rich and diverse",
    generator: (baseColor: string) => {
      const [h, s, l] = hexToHsl(baseColor)
      return [
        baseColor,
        hslToHex((h + 90) % 360, s, l),
        hslToHex((h + 180) % 360, s, l),
        hslToHex((h + 270) % 360, s, l),
        hslToHex(h, s * 0.5, l * 1.1),
      ]
    },
  },
]

// Accessibility checking
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (hex: string) => {
    const rgb = [
      Number.parseInt(hex.slice(1, 3), 16),
      Number.parseInt(hex.slice(3, 5), 16),
      Number.parseInt(hex.slice(5, 7), 16),
    ].map((c) => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]
  }

  const lum1 = getLuminance(color1)
  const lum2 = getLuminance(color2)
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)

  return (brightest + 0.05) / (darkest + 0.05)
}

export function checkAccessibility(backgroundColor: string, textColor: string): AccessibilityInfo {
  const ratio = getContrastRatio(backgroundColor, textColor)
  return {
    contrastRatio: Math.round(ratio * 100) / 100,
    wcagAA: ratio >= 4.5,
    wcagAAA: ratio >= 7,
  }
}

// Trending color palettes
export const trendingPalettes: ColorPalette[] = [
  {
    id: "modern-minimal",
    name: "Modern Minimal",
    colors: ["#f8f9fa", "#e9ecef", "#6c757d", "#495057", "#212529"],
    type: "trending",
    description: "Clean, minimal palette perfect for modern interfaces",
    tags: ["minimal", "modern", "neutral"],
    createdAt: Date.now(),
  },
  {
    id: "vibrant-energy",
    name: "Vibrant Energy",
    colors: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7"],
    type: "trending",
    description: "Energetic colors that grab attention and inspire action",
    tags: ["vibrant", "energetic", "bold"],
    createdAt: Date.now(),
  },
  {
    id: "nature-inspired",
    name: "Nature Inspired",
    colors: ["#2d5016", "#61892f", "#86c232", "#c6d57e", "#f4f3ee"],
    type: "trending",
    description: "Earthy tones inspired by natural landscapes",
    tags: ["nature", "earthy", "organic"],
    createdAt: Date.now(),
  },
  {
    id: "sunset-gradient",
    name: "Sunset Gradient",
    colors: ["#ff9a9e", "#fecfef", "#fecfef", "#a8edea", "#fed6e3"],
    type: "trending",
    description: "Soft gradient colors reminiscent of beautiful sunsets",
    tags: ["gradient", "sunset", "soft"],
    createdAt: Date.now(),
  },
  {
    id: "tech-corporate",
    name: "Tech Corporate",
    colors: ["#667eea", "#764ba2", "#f093fb", "#f5576c", "#4facfe"],
    type: "trending",
    description: "Professional yet modern palette for tech companies",
    tags: ["corporate", "tech", "professional"],
    createdAt: Date.now(),
  },
]

// Export formats
export function exportToCSS(palette: ColorPalette): string {
  return `:root {
${palette.colors.map((color, index) => `  --color-${index + 1}: ${color};`).join("\n")}
  --color-primary: ${palette.colors[0]};
  --color-secondary: ${palette.colors[1] || palette.colors[0]};
  --color-accent: ${palette.colors[2] || palette.colors[0]};
}`
}

export function exportToSass(palette: ColorPalette): string {
  return `// ${palette.name} Color Palette
${palette.colors.map((color, index) => `$color-${index + 1}: ${color};`).join("\n")}
$color-primary: ${palette.colors[0]};
$color-secondary: ${palette.colors[1] || palette.colors[0]};
$color-accent: ${palette.colors[2] || palette.colors[0]};

// Color map
$colors: (
${palette.colors.map((color, index) => `  ${index + 1}: ${color}`).join(",\n")}
);`
}

export function exportToTailwind(palette: ColorPalette): string {
  return `// Add to your tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
${palette.colors.map((color, index) => `          ${(index + 1) * 100}: '${color}'`).join(",\n")}
        }
      }
    }
  }
}`
}

export function exportToJSON(palette: ColorPalette): string {
  return JSON.stringify(
    {
      name: palette.name,
      colors: palette.colors,
      type: palette.type,
      description: palette.description,
      tags: palette.tags,
      createdAt: new Date(palette.createdAt).toISOString(),
    },
    null,
    2,
  )
}
