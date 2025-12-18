"use client"

import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage, useGLTF } from '@react-three/drei'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

interface Model3DViewerProps {
  modelUrl: string
  defaultColor?: string
}

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} />
}

export function Model3DViewer({ modelUrl, defaultColor = '#ff3b30' }: Model3DViewerProps) {
  const [showViewer, setShowViewer] = useState(false)

  if (!modelUrl) {
    return (
      <div className="w-full h-32 bg-muted rounded flex items-center justify-center text-sm text-muted-foreground">
        Pas de modèle 3D
      </div>
    )
  }

  return (
    <div className="w-full space-y-2">
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => setShowViewer(!showViewer)}
      >
        {showViewer ? (
          <>
            <EyeOff className="h-4 w-4 mr-2" />
            Masquer le modèle 3D
          </>
        ) : (
          <>
            <Eye className="h-4 w-4 mr-2" />
            Afficher le modèle 3D
          </>
        )}
      </Button>

      {showViewer && (
        <div className="w-full h-64 bg-zinc-900 rounded-lg overflow-hidden relative">
          <Canvas
            camera={{ position: [0, 0, 5], fov: 50 }}
            style={{ background: '#18181b' }}
          >
            <Suspense
              fallback={
                <mesh>
                  <boxGeometry args={[1, 1, 1]} />
                  <meshStandardMaterial color="#666" />
                </mesh>
              }
            >
              <Stage environment="city" intensity={0.6}>
                <Model url={modelUrl} />
              </Stage>
              <OrbitControls
                enableZoom={true}
                enablePan={true}
                enableRotate={true}
                minDistance={2}
                maxDistance={10}
              />
            </Suspense>
          </Canvas>
          <div className="absolute bottom-2 right-2 text-xs text-white/50 bg-black/30 px-2 py-1 rounded">
            Glisser pour tourner • Molette pour zoomer
          </div>
        </div>
      )}
    </div>
  )
}
