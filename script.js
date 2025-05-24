class LucidHue {
  constructor() {
    this.currentPalette = null
    this.scene = null
    this.camera = null
    this.renderer = null
    this.spheres = []
    this.animationId = null

    this.init()
  }

  init() {
    this.setupEventListeners()
    this.loadTimeline()
  }

  setupEventListeners() {
    // Tab switching
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.switchTab(e.target.dataset.tab)
      })
    })

    // Dream form submission
    document.getElementById("dreamForm").addEventListener("submit", (e) => {
      e.preventDefault()
      this.submitDream()
    })
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.remove("active")
    })
    document.querySelector(`[data-tab="${tabName}"]`).classList.add("active")

    // Update tab content
    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.remove("active")
    })
    document.getElementById(tabName).classList.add("active")

    // Load timeline if switching to timeline tab
    if (tabName === "timeline") {
      this.loadTimeline()
    }
  }

  async submitDream() {
    const dreamText = document.getElementById("dreamText").value.trim()
    const submitBtn = document.getElementById("submitBtn")
    const errorDiv = document.getElementById("error-message")

    if (!dreamText) return

    // Show loading state
    this.setLoadingState(true)
    errorDiv.style.display = "none"

    try {
      const response = await fetch("api/interpret-dream.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dreamText }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to interpret dream")
      }

      this.displayPalette(data)
    } catch (error) {
      console.error("Error:", error)
      errorDiv.textContent = error.message
      errorDiv.style.display = "block"
    } finally {
      this.setLoadingState(false)
    }
  }

  setLoadingState(loading) {
    const submitBtn = document.getElementById("submitBtn")
    const spinner = submitBtn.querySelector(".loading-spinner")
    const text = submitBtn.querySelector("span")

    if (loading) {
      submitBtn.disabled = true
      spinner.style.display = "block"
      text.textContent = "Interpreting Dream..."
    } else {
      submitBtn.disabled = false
      spinner.style.display = "none"
      text.textContent = "Generate Dream Palette"
    }
  }

  displayPalette(paletteData) {
    this.currentPalette = paletteData

    // Show palette display
    document.getElementById("paletteDisplay").style.display = "block"

    // Update palette info
    document.getElementById("paletteMood").textContent = paletteData.mood || "mysterious"
    document.getElementById("paletteEmotions").textContent = paletteData.emotions
      ? paletteData.emotions.join(", ")
      : "N/A"

    // Display color swatches
    this.displayColorSwatches(paletteData.colors)

    // Display symbols
    this.displaySymbols(paletteData.symbols)

    // Create 3D visualization
    this.create3DVisualization(paletteData.colors)

    // Scroll to palette
    document.getElementById("paletteDisplay").scrollIntoView({
      behavior: "smooth",
    })
  }

  displayColorSwatches(colors) {
    const swatchesContainer = document.getElementById("colorSwatches")
    swatchesContainer.innerHTML = ""

    colors.forEach((color) => {
      const swatch = document.createElement("div")
      swatch.className = "color-swatch"
      swatch.style.backgroundColor = color
      swatch.setAttribute("data-color", color)
      swatch.title = color

      swatch.addEventListener("click", () => {
        navigator.clipboard.writeText(color)
        this.showToast(`Copied ${color} to clipboard!`)
      })

      swatchesContainer.appendChild(swatch)
    })
  }

  displaySymbols(symbols) {
    const symbolsContainer = document.getElementById("symbolsDisplay")

    if (!symbols || symbols.length === 0) {
      symbolsContainer.style.display = "none"
      return
    }

    symbolsContainer.style.display = "block"
    symbolsContainer.innerHTML = `
            <h4><i class="fas fa-eye"></i> Dream Symbols Detected:</h4>
            ${symbols
              .map(
                (symbol) => `
                <div class="symbol-item">
                    <strong>${symbol.symbol}:</strong> ${symbol.meaning}
                </div>
            `,
              )
              .join("")}
        `
  }

  create3DVisualization(colors) {
    const container = document.getElementById("palette3D")

    // Clear previous visualization
    if (this.renderer) {
      container.removeChild(this.renderer.domElement)
      if (this.animationId) {
        cancelAnimationFrame(this.animationId)
      }
    }

    // Setup Three.js scene
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000)
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })

    this.renderer.setSize(container.offsetWidth, container.offsetHeight)
    this.renderer.setClearColor(0x000000, 0)
    container.appendChild(this.renderer.domElement)

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    this.scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0xffffff, 0.8)
    pointLight.position.set(10, 10, 10)
    this.scene.add(pointLight)

    // Create color spheres
    this.spheres = []
    colors.forEach((color, index) => {
      const geometry = new THREE.SphereGeometry(0.5, 32, 32)
      const material = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.1,
      })

      const sphere = new THREE.Mesh(geometry, material)

      // Position spheres in a circle
      const angle = (index / colors.length) * Math.PI * 2
      const radius = 2
      sphere.position.x = Math.cos(angle) * radius
      sphere.position.z = Math.sin(angle) * radius
      sphere.position.y = Math.sin(angle * 2) * 0.3

      // Add floating animation data
      sphere.userData = {
        originalY: sphere.position.y,
        floatSpeed: 0.5 + Math.random() * 0.5,
        rotationSpeed: 0.01 + Math.random() * 0.02,
      }

      this.spheres.push(sphere)
      this.scene.add(sphere)
    })

    // Position camera
    this.camera.position.z = 6
    this.camera.position.y = 1

    // Start animation
    this.animate()
  }

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate())

    const time = Date.now() * 0.001

    // Animate spheres
    this.spheres.forEach((sphere, index) => {
      // Floating animation
      sphere.position.y = sphere.userData.originalY + Math.sin(time * sphere.userData.floatSpeed + index) * 0.2

      // Rotation animation
      sphere.rotation.x += sphere.userData.rotationSpeed
      sphere.rotation.y += sphere.userData.rotationSpeed * 0.7
    })

    // Rotate entire group
    if (this.scene.children.length > 2) {
      this.scene.rotation.y = time * 0.1
    }

    this.renderer.render(this.scene, this.camera)
  }

  async loadTimeline() {
    const timelineContent = document.getElementById("timelineContent")

    try {
      const response = await fetch("api/get-palettes.php")
      const palettes = await response.json()

      if (palettes.length === 0) {
        timelineContent.innerHTML = `
                    <div class="loading-message">
                        <i class="fas fa-clock"></i>
                        <h3>No Dream Palettes Yet</h3>
                        <p>Create your first dream palette to see it here!</p>
                    </div>
                `
        return
      }

      timelineContent.innerHTML = palettes
        .map(
          (palette) => `
                <div class="timeline-item" data-id="${palette.id}">
                    <h4>${palette.title}</h4>
                    <div class="date">${new Date(palette.created_at).toLocaleDateString()}</div>
                    <div class="preview-colors">
                        ${JSON.parse(palette.colors)
                          .slice(0, 6)
                          .map((color) => `<div class="preview-color" style="background-color: ${color}"></div>`)
                          .join("")}
                    </div>
                    <div class="dream-preview">${palette.dream_text}</div>
                    <div class="actions">
                        <button class="action-btn" onclick="lucidHue.exportPalette(${palette.id})">
                            <i class="fas fa-download"></i> Export
                        </button>
                        <button class="action-btn" onclick="lucidHue.deletePalette(${palette.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `,
        )
        .join("")
    } catch (error) {
      console.error("Error loading timeline:", error)
      timelineContent.innerHTML = `
                <div class="loading-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error loading palettes</p>
                </div>
            `
    }
  }

  async deletePalette(id) {
    if (!confirm("Are you sure you want to delete this palette?")) return

    try {
      const response = await fetch("api/delete-palette.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      if (response.ok) {
        this.loadTimeline()
        this.showToast("Palette deleted successfully!")
      }
    } catch (error) {
      console.error("Error deleting palette:", error)
      this.showToast("Error deleting palette")
    }
  }

  async exportPalette(id) {
    try {
      const response = await fetch(`api/export-palette.php?id=${id}`)
      const palette = await response.json()

      const dataStr = JSON.stringify(palette, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })

      const link = document.createElement("a")
      link.href = URL.createObjectURL(dataBlob)
      link.download = `dream-palette-${id}.json`
      link.click()

      this.showToast("Palette exported successfully!")
    } catch (error) {
      console.error("Error exporting palette:", error)
      this.showToast("Error exporting palette")
    }
  }

  showToast(message) {
    // Create toast notification
    const toast = document.createElement("div")
    toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #6a1b9a;
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `
    toast.textContent = message

    document.body.appendChild(toast)

    setTimeout(() => {
      toast.remove()
    }, 3000)
  }
}

// Initialize the application
const lucidHue = new LucidHue()

// Handle window resize for 3D canvas
window.addEventListener("resize", () => {
  if (lucidHue.renderer && lucidHue.camera) {
    const container = document.getElementById("palette3D")
    lucidHue.camera.aspect = container.offsetWidth / container.offsetHeight
    lucidHue.camera.updateProjectionMatrix()
    lucidHue.renderer.setSize(container.offsetWidth, container.offsetHeight)
  }
})
