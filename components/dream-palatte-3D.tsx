"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, Float, Text } from "@react-three/drei"
import { useRef, useMemo } from "react"
import type * as THREE from "three"

interface ColorSphere {
  color: string
  position: [number, number, number]
  scale: number
}

function ColorSphere({ color, position, scale }: ColorSphere) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.2} emissive={color} emissiveIntensity={0.1} />
      </mesh>
    </Float>
  )
}

function PaletteOrb({ colors }: { colors: string[] }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })

  const spheres = useMemo(() => {
    return colors.map((color, index) => {
      const angle = (index / colors.length) * Math.PI * 2
      const radius = 3
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const y = Math.sin(angle * 2) * 0.5

      return {
        color,
        position: [x, y, z] as [number, number, number],
        scale: 0.8 + Math.sin(index) * 0.3,
      }
    })
  }, [colors])

  return (
    <group ref={groupRef}>
      {spheres.map((sphere, index) => (
        <ColorSphere key={index} {...sphere} />
      ))}
    </group>
  )
}

interface DreamPalette3DProps {
  colors: string[]
  title?: string
}

export default function DreamPalette3D({ colors, title }: DreamPalette3DProps) {
  return (
    <div className="w-full h-96 rounded-lg overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <Environment preset="night" />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4a90e2" />

        <PaletteOrb colors={colors} />

        {title && (
          <Text
            position={[0, -5, 0]}
            fontSize={0.8}
            color="white"
            anchorX="center"
            anchorY="middle"
            font="/fonts/Geist-Bold.ttf"
          >
            {title}
          </Text>
        )}
      </Canvas>
    </div>
  )
}
