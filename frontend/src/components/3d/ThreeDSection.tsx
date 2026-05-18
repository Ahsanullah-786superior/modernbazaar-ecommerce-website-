'use client'

import { useRef, Suspense, Component, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Environment, MeshDistortMaterial, Sphere } from '@react-three/drei'
import * as THREE from 'three'
import Link from 'next/link'

class WebGLErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean}> {
  constructor(props: {children: ReactNode}) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full w-full bg-bazaar-dark text-white/50 text-sm">
          3D experience is not supported on this device or browser.
        </div>
      )
    }
    return this.props.children
  }
}

// ─── 3D Animated Sphere ───────────────────────────────────────────
function AnimatedSphere({ position, color, speed = 1 }: {
  position: [number, number, number]
  color: string
  speed?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * speed * 0.3) * 0.3
    meshRef.current.rotation.y += 0.008 * speed
  })

  return (
    <Float speed={speed * 1.5} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[0.8, 64, 64]} />
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
    </Float>
  )
}

// ─── 3D Torus ─────────────────────────────────────────────────────
function AnimatedTorus({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.4
    meshRef.current.rotation.z = state.clock.elapsedTime * 0.2
  })

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position}>
        <torusGeometry args={[0.6, 0.2, 32, 100]} />
        <meshStandardMaterial
          color="#FF6B35"
          roughness={0.1}
          metalness={0.9}
          envMapIntensity={1}
        />
      </mesh>
    </Float>
  )
}

// ─── Scene ────────────────────────────────────────────────────────
function Scene() {
  return (
    <>
      <Environment preset="city" />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#FF6B35" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#6B8CFF" />

      <AnimatedSphere position={[0, 0, 0]} color="#FF6B35" speed={1} />
      <AnimatedSphere position={[-2.5, 1, -1]} color="#F4A261" speed={0.7} />
      <AnimatedSphere position={[2.5, -0.5, -0.5]} color="#264653" speed={1.3} />
      <AnimatedTorus position={[1.5, 1.5, 0]} />
    </>
  )
}

export default function ThreeDSection() {
  return (
    <section className="py-20 lg:py-28 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-bazaar-dark dark:bg-black overflow-hidden min-h-[500px] flex items-center">
          {/* 3D Canvas */}
          <div className="absolute inset-0">
            <WebGLErrorBoundary>
              <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
                <Suspense fallback={null}>
                  <Scene />
                </Suspense>
              </Canvas>
            </WebGLErrorBoundary>
          </div>

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-bazaar-dark/90 via-bazaar-dark/50 to-transparent" />

          {/* Content */}
          <div className="relative z-10 px-8 sm:px-12 lg:px-16 py-16 max-w-xl">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium mb-4 uppercase tracking-widest">
                New Experience
              </span>
              <h2 className="font-display text-4xl lg:text-5xl font-semibold text-white mb-4 leading-tight">
                The Future of Shopping is Here
              </h2>
              <p className="text-white/70 text-base mb-8 leading-relaxed">
                Immerse yourself in a new dimension of commerce. Explore products
                like never before with our cutting-edge interactive experience.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/products"
                  className="px-8 py-3.5 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors"
                >
                  Explore Collection
                </Link>
                <Link
                  href="/about"
                  className="px-8 py-3.5 border border-white/30 text-white rounded-full font-medium hover:bg-white/10 transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Decorative dots */}
          <div className="absolute bottom-6 right-6 grid grid-cols-4 gap-2 opacity-30">
            {[...Array(16)].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-white" />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
