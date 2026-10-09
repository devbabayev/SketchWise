import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Grid, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { Eye, Layers, Compass, RotateCcw, Cpu } from 'lucide-react';

// --- Step 0: Abstract AI Ingestion Core ---
function IngestionCore({ isAnalyzing, hasFiles }) {
  const meshRef = useRef();
  const ringRef = useRef();

  useFrame((state, delta) => {
    const speed = isAnalyzing ? 3.0 : (hasFiles ? 1.2 : 0.4);
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * speed * 0.5;
      meshRef.current.rotation.y += delta * speed;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z -= delta * speed * 0.8;
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.3;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Central Morphing Core */}
      <mesh ref={meshRef} scale={hasFiles ? 1.6 : 1.3}>
        <icosahedronGeometry args={[1, hasFiles ? 2 : 1]} />
        <MeshDistortMaterial
          color={isAnalyzing ? "#38bdf8" : (hasFiles ? "#6366f1" : "#4338ca")}
          emissive={isAnalyzing ? "#0284c7" : "#312e81"}
          emissiveIntensity={isAnalyzing ? 1.5 : 0.4}
          roughness={0.2}
          metalness={0.8}
          distort={isAnalyzing ? 0.7 : (hasFiles ? 0.4 : 0.2)}
          speed={isAnalyzing ? 5 : 2}
          wireframe={!hasFiles && !isAnalyzing}
        />
      </mesh>

      {/* Orbiting Scanning Ring */}
      <mesh ref={ringRef} scale={hasFiles ? 2.4 : 2.0}>
        <torusGeometry args={[1, 0.02, 16, 64]} />
        <meshStandardMaterial
          color={isAnalyzing ? "#38bdf8" : "#818cf8"}
          emissive={isAnalyzing ? "#38bdf8" : "#6366f1"}
          emissiveIntensity={1.2}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
}

// --- Step 1 & 2: Parametric Building / Blueprint Pavilion ---
function StructuralBuilding({ step, viewMode }) {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current && step === 1) {
      groupRef.current.rotation.y += delta * 0.25;
    }
  });

  const isWireframe = viewMode === 'wireframe';
  const isXray = viewMode === 'xray';

  const beamMaterial = new THREE.MeshStandardMaterial({
    color: isXray ? "#ef4444" : (isWireframe ? "#38bdf8" : "#475569"),
    wireframe: isWireframe,
    transparent: isXray,
    opacity: isXray ? 0.85 : 1,
    metalness: 0.8,
    roughness: 0.2
  });

  const slabMaterial = new THREE.MeshStandardMaterial({
    color: isXray ? "#3b82f6" : (isWireframe ? "#6366f1" : "#1e293b"),
    wireframe: isWireframe,
    transparent: isXray,
    opacity: isXray ? 0.7 : 1,
    roughness: 0.5
  });

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: isXray ? "#10b981" : "#38bdf8",
    transparent: true,
    opacity: isWireframe ? 0.15 : 0.4,
    wireframe: isWireframe,
    roughness: 0.1,
    transmission: 0.6,
    thickness: 0.5
  });

  return (
    <group ref={groupRef} position={[0, -0.8, 0]}>
      {/* Foundation Slab */}
      <mesh position={[0, 0, 0]} material={slabMaterial}>
        <boxGeometry args={[4.2, 0.2, 3.2]} />
      </mesh>

      {/* 2nd Level Floor Slab */}
      <mesh position={[0, 1.8, 0]} material={slabMaterial}>
        <boxGeometry args={[4.2, 0.15, 3.2]} />
      </mesh>

      {/* Roof Deck Slab */}
      <mesh position={[0, 3.4, 0]} material={slabMaterial}>
        <boxGeometry args={[4.6, 0.15, 3.6]} />
      </mesh>

      {/* 4 Corner Structural Columns */}
      {[
        [-1.8, 0.9, -1.3],
        [1.8, 0.9, -1.3],
        [-1.8, 0.9, 1.3],
        [1.8, 0.9, 1.3],
        [-1.8, 2.6, -1.3],
        [1.8, 2.6, -1.3],
        [-1.8, 2.6, 1.3],
        [1.8, 2.6, 1.3]
      ].map((pos, idx) => (
        <mesh key={idx} position={pos} material={beamMaterial}>
          <cylinderGeometry args={[0.08, 0.08, 1.6, 16]} />
        </mesh>
      ))}

      {/* Translucent Curtain Wall Glazing */}
      <mesh position={[0, 0.9, 1.4]} material={glassMaterial}>
        <boxGeometry args={[3.4, 1.6, 0.05]} />
      </mesh>
      <mesh position={[0, 2.6, 1.4]} material={glassMaterial}>
        <boxGeometry args={[3.4, 1.4, 0.05]} />
      </mesh>
      <mesh position={[-1.9, 0.9, 0]} rotation={[0, Math.PI / 2, 0]} material={glassMaterial}>
        <boxGeometry args={[2.4, 1.6, 0.05]} />
      </mesh>

      {/* Structural Load Truss on Roof */}
      <mesh position={[0, 3.7, 0]} rotation={[0, 0, 0.1]} material={beamMaterial}>
        <boxGeometry args={[4.4, 0.08, 0.08]} />
      </mesh>
      <mesh position={[0, 3.7, 0]} rotation={[0, 0, -0.1]} material={beamMaterial}>
        <boxGeometry args={[4.4, 0.08, 0.08]} />
      </mesh>
    </group>
  );
}

export default function ArchitecturalScene({ step, files, isAnalyzing }) {
  const [viewMode, setViewMode] = useState('solid'); // 'solid' | 'wireframe' | 'xray'
  const controlsRef = useRef();

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-[#0a0a14] via-[#050508] to-[#000000] flex flex-col">
      {/* 3D Viewport HUD Header */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs text-gray-300 pointer-events-auto">
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span>
            {step === 0 && (isAnalyzing ? 'Analyzing Ingested Geometry...' : (files?.length ? 'Files Staged • Ready to Process' : 'Spatial Engine Idle'))}
            {step === 1 && 'Structural Wireframe Generated'}
            {step === 2 && 'Parametric 3D Model Verified'}
          </span>
        </div>

        {/* View Mode Switcher */}
        {step > 0 && (
          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-lg border border-white/10 pointer-events-auto">
            <button
              onClick={() => setViewMode('solid')}
              className={`p-1.5 rounded text-xs transition-colors flex items-center gap-1 ${viewMode === 'solid' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
              title="Solid Model"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('wireframe')}
              className={`p-1.5 rounded text-xs transition-colors flex items-center gap-1 ${viewMode === 'wireframe' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
              title="Structural Wireframe"
            >
              <Compass className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('xray')}
              className={`p-1.5 rounded text-xs transition-colors flex items-center gap-1 ${viewMode === 'xray' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
              title="Stress X-Ray"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetCamera}
              className="p-1.5 rounded text-xs text-gray-400 hover:text-white transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Canvas 3D */}
      <div className="flex-1 w-full h-full">
        <Canvas camera={{ position: [5, 4, 6], fov: 42 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 15, 10]} intensity={1.5} castShadow />
          <pointLight position={[-10, -5, -10]} intensity={0.5} color="#818cf8" />

          {/* Blueprint Reference Grid Floor */}
          <Grid
            position={[0, -0.9, 0]}
            args={[12, 12]}
            cellSize={0.6}
            cellThickness={0.8}
            cellColor="#1e1e38"
            sectionSize={2.4}
            sectionThickness={1.2}
            sectionColor="#3730a3"
            fadeDistance={25}
            fadeStrength={1.5}
          />

          <Float speed={step === 0 ? 1.5 : 0.8} rotationIntensity={0.2} floatIntensity={0.3}>
            {step === 0 ? (
              <IngestionCore isAnalyzing={isAnalyzing} hasFiles={files?.length > 0} />
            ) : (
              <StructuralBuilding step={step} viewMode={viewMode} />
            )}
          </Float>

          <OrbitControls
            ref={controlsRef}
            enableZoom={true}
            minDistance={3}
            maxDistance={14}
            autoRotate={step < 2}
            autoRotateSpeed={step === 1 ? 0.8 : 0.4}
          />
        </Canvas>
      </div>

      {/* 3D Viewport HUD Footer */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between text-[11px] text-gray-400 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 pointer-events-none">
        <span>Coordinate System: ASTM / Metric (m)</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          WebGL Active
        </span>
      </div>
    </div>
  );
}
