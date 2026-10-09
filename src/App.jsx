import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Cylinder, MeshDistortMaterial, Environment } from '@react-three/drei';
import { ArrowRight, Calculator, Check, ChevronRight, Cuboid, DollarSign, Lock, Sparkles, TrendingDown } from 'lucide-react';
import './index.css';

// --- 3D Components ---
const AbstractShape = () => {
  const meshRef = useRef();
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });
  return (
    <mesh ref={meshRef} position={[0, 0, 0]} scale={1.5}>
      <icosahedronGeometry args={[1, 0]} />
      <MeshDistortMaterial
        color="#6366f1"
        envMapIntensity={1}
        clearcoat={1}
        clearcoatRoughness={0.1}
        metalness={0.5}
        roughness={0.2}
        distort={0.4}
        speed={2}
      />
    </mesh>
  );
};

const RoomModel = ({ width, length, height, pillarType }) => {
  const w = Math.max(2, width / 2);
  const l = Math.max(2, length / 2);
  const h = Math.max(1, height / 2);

  return (
    <group position={[0, -h/2, 0]}>
      {/* Floor */}
      <Box args={[w, 0.1, l]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </Box>
      {/* Pillars */}
      {[-w/2 + 0.2, w/2 - 0.2].map((x, i) =>
        [-l/2 + 0.2, l/2 - 0.2].map((z, j) => (
          <group key={`${i}-${j}`} position={[x, h/2, z]}>
            {pillarType === 'round' ? (
              <Cylinder args={[0.2, 0.2, h, 32]}>
                <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.2} />
              </Cylinder>
            ) : (
              <Box args={[0.4, h, 0.4]}>
                <meshStandardMaterial color="#94a3b8" metalness={0.2} roughness={0.6} />
              </Box>
            )}
          </group>
        ))
      )}
      {/* Roof placeholder (transparent) */}
      <Box args={[w, 0.1, l]} position={[0, h, 0]}>
        <meshStandardMaterial color="#6366f1" transparent opacity={0.2} />
      </Box>
    </group>
  );
};

// --- App Components ---

function App() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    width: 10,
    length: 15,
    height: 3,
    pillarType: 'square',
    quality: 'premium'
  });
  
  const [calculations, setCalculations] = useState(null);

  const calculateCosts = () => {
    // Fake complex AI calculation
    const area = formData.width * formData.length;
    const baseCost = area * (formData.quality === 'premium' ? 120 : formData.quality === 'standard' ? 80 : 50);
    const pillarCost = formData.height * 4 * (formData.pillarType === 'round' ? 150 : 100);
    const totalOriginal = baseCost + pillarCost;
    
    // AI Optimizations
    const optimizedBase = area * (formData.quality === 'premium' ? 105 : 75);
    const optimizedPillar = formData.height * 4 * 90; // Suggesting standard pillars
    const totalOptimized = optimizedBase + optimizedPillar;
    
    setCalculations({
      original: totalOriginal,
      optimized: totalOptimized,
      savings: totalOriginal - totalOptimized,
      materials: {
        concrete: Math.round(area * 0.15),
        steel: Math.round((area * 2) + (formData.height * 10)),
      }
    });
    
    setStep(3); // Go to loading step
    setTimeout(() => setStep(4), 2500); // Auto progress to paywall
  };

  return (
    <div className="app-container">
      <header className="animate-fade-in">
        <div className="logo">
          <Cuboid className="logo-icon" />
          <span>SketchWise</span>
        </div>
        <div>
          {step > 0 && <span className="badge">AI Engineer Assistant</span>}
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        
        {/* Step 0: Hero */}
        {step === 0 && (
          <div className="glass-panel animate-fade-in text-center" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
              <Sparkles size={48} color="var(--color-primary)" style={{ margin: '0 auto', marginBottom: '1rem' }} />
              <h1>Design smarter.<br/>Build affordably.</h1>
              <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
                Our AI analyzes your construction requirements to find the most cost-effective structural designs without compromising integrity.
              </p>
            </div>
            
            <div className="canvas-container" style={{ height: '300px', marginBottom: '2rem' }}>
              <Canvas camera={{ position: [0, 0, 4] }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <AbstractShape />
                <Environment preset="city" />
              </Canvas>
            </div>
            
            <button className="btn" onClick={() => setStep(1)} style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
              Start AI Optimization <ArrowRight size={20} />
            </button>
          </div>
        )}

        {/* Step 1: Input Wizard */}
        {step === 1 && (
          <div className="glass-panel animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
            <h2>Project Specifications</h2>
            <p>Define the core dimensions and materials for your prototype.</p>
            
            <div className="input-group delay-1 animate-fade-in">
              <label>Room Width (meters)</label>
              <input type="number" value={formData.width} onChange={e => setFormData({...formData, width: Number(e.target.value)})} />
            </div>
            <div className="input-group delay-1 animate-fade-in">
              <label>Room Length (meters)</label>
              <input type="number" value={formData.length} onChange={e => setFormData({...formData, length: Number(e.target.value)})} />
            </div>
            <div className="input-group delay-2 animate-fade-in">
              <label>Ceiling Height (meters)</label>
              <input type="number" value={formData.height} onChange={e => setFormData({...formData, height: Number(e.target.value)})} />
            </div>
            
            <div className="input-group delay-2 animate-fade-in">
              <label>Pillar Type</label>
              <select value={formData.pillarType} onChange={e => setFormData({...formData, pillarType: e.target.value})}>
                <option value="square">Standard Square (Cost Effective)</option>
                <option value="round">Architectural Round (Premium)</option>
              </select>
            </div>
            
            <div className="input-group delay-3 animate-fade-in">
              <label>Material Quality</label>
              <select value={formData.quality} onChange={e => setFormData({...formData, quality: e.target.value})}>
                <option value="economy">Economy</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }} className="delay-3 animate-fade-in">
              <button className="btn btn-secondary" onClick={() => setStep(0)}>Back</button>
              <button className="btn" onClick={calculateCosts}>
                <Calculator size={18} /> Analyze & Optimize
              </button>
            </div>
          </div>
        )}

        {/* Step 2/3: Loading AI */}
        {step === 3 && (
          <div className="glass-panel animate-fade-in" style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto', padding: '4rem 2rem' }}>
            <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 2rem' }}>
               <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, border: '4px solid var(--color-surface)', borderRadius: '50%' }}></div>
               <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, border: '4px solid var(--color-primary)', borderRadius: '50%', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
            </div>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            <h2>AI is analyzing your design...</h2>
            <p>Evaluating material stress limits and cost-cutting alternatives.</p>
            <div style={{ marginTop: '2rem', textAlign: 'left', color: 'var(--color-text-muted)' }}>
              <div style={{ marginBottom: '0.5rem' }}><Check size={16} color="var(--color-success)" style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}/> Calculating load bearing limits</div>
              <div style={{ marginBottom: '0.5rem' }}><Check size={16} color="var(--color-success)" style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}/> Sourcing regional material costs</div>
              <div style={{ marginBottom: '0.5rem' }}><Sparkles size={16} color="var(--color-primary)" style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}/> Generating 3D optimizations...</div>
            </div>
          </div>
        )}

        {/* Step 4: Paywall & Partial Results */}
        {step === 4 && calculations && (
          <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '50%' }}>
                <TrendingDown size={32} color="var(--color-success)" />
              </div>
              <div>
                <h2 style={{ margin: 0 }}>Optimization Complete</h2>
                <p style={{ margin: 0 }}>We found a more affordable way to build your prototype.</p>
              </div>
            </div>

            <div className="comparison-grid">
              <div className="glass-panel" style={{ border: '1px solid var(--color-border)' }}>
                <h3>Original Estimate</h3>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, margin: '1rem 0' }}>
                  ${calculations.original.toLocaleString()}
                </div>
                <p>Based on your provided specifications.</p>
              </div>
              
              <div className="glass-panel" style={{ border: '1px solid var(--color-success)', background: 'rgba(16, 185, 129, 0.05)' }}>
                <h3>AI Optimized Cost</h3>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, margin: '1rem 0', color: 'var(--color-success)' }}>
                  ${calculations.optimized.toLocaleString()}
                </div>
                <div className="badge badge-success">Save ${calculations.savings.toLocaleString()}!</div>
              </div>
            </div>

            <div className="paywall-container glass-panel">
              <div className="paywall-content">
                <h3>Detailed Cost Breakdown & 3D Plan</h3>
                <table className="cost-table">
                  <thead><tr><th>Material</th><th>Quantity</th><th>Cost</th></tr></thead>
                  <tbody>
                    <tr><td>High-grade Concrete</td><td>{calculations.materials.concrete} m³</td><td>$XXXX</td></tr>
                    <tr><td>Structural Steel</td><td>{calculations.materials.steel} kg</td><td>$XXXX</td></tr>
                  </tbody>
                </table>
                <div className="canvas-container"><Canvas></Canvas></div>
              </div>
              
              <div className="paywall-overlay">
                <Lock size={48} color="var(--color-text-muted)" style={{ marginBottom: '1rem' }} />
                <h3>Unlock Full Optimization Data</h3>
                <p style={{ maxWidth: '400px' }}>Get the detailed material breakdown, cut suggestions, and interactive 3D model.</p>
                <div className="price-tag">$49.00</div>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Estimated AI Token Cost: $0.14 | Complexity: Medium</p>
                <button className="btn" style={{ marginTop: '1rem', padding: '1rem 3rem', fontSize: '1.2rem' }} onClick={() => setStep(5)}>
                  Purchase Full Report <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Full Results */}
        {step === 5 && calculations && (
          <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2>Final Optimized Design</h2>
              <button className="btn btn-secondary" onClick={() => setStep(0)}>Start New</button>
            </div>
            
            <div className="glass-panel" style={{ marginBottom: '2rem', padding: 0, overflow: 'hidden' }}>
              <div className="canvas-container large">
                <Canvas camera={{ position: [0, Math.max(formData.width, formData.length), Math.max(formData.width, formData.length) * 1.5] }}>
                  <color attach="background" args={['#0a0a0f']} />
                  <ambientLight intensity={0.5} />
                  <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
                  <RoomModel 
                    width={formData.width} 
                    length={formData.length} 
                    height={formData.height} 
                    pillarType={formData.pillarType} 
                  />
                  <OrbitControls autoRotate autoRotateSpeed={0.5} enablePan={true} enableZoom={true} />
                </Canvas>
                <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(0,0,0,0.5)', padding: '0.5rem 1rem', borderRadius: 'var(--radius)', backdropFilter: 'blur(4px)' }}>
                  Interactive 3D View (Drag to rotate)
                </div>
              </div>
            </div>

            <div className="comparison-grid">
              <div className="glass-panel">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <DollarSign size={20} color="var(--color-primary)"/> Cost Breakdown
                </h3>
                <table className="cost-table">
                  <thead>
                    <tr>
                      <th>Component</th>
                      <th>Original</th>
                      <th>Optimized</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Foundation & Slab</td>
                      <td>${(calculations.original * 0.4).toLocaleString()}</td>
                      <td>${(calculations.optimized * 0.45).toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td>Pillars & Support</td>
                      <td>${(calculations.original * 0.35).toLocaleString()}</td>
                      <td>${(calculations.optimized * 0.25).toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td>Finishes & Misc</td>
                      <td>${(calculations.original * 0.25).toLocaleString()}</td>
                      <td>${(calculations.optimized * 0.3).toLocaleString()}</td>
                    </tr>
                    <tr className="total-row">
                      <td>Total Cost</td>
                      <td>${calculations.original.toLocaleString()}</td>
                      <td style={{ color: 'var(--color-success)' }}>${calculations.optimized.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="glass-panel">
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingDown size={20} color="var(--color-success)"/> Cost Cutting Strategies
                </h3>
                
                <div className="optimization-card">
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0' }}>Modify Pillar Geometry</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Switching from {formData.pillarType} to optimized standardized square pillars reduces custom forming costs.</p>
                  </div>
                  <div className="savings">-$1,250</div>
                </div>
                
                <div className="optimization-card">
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0' }}>Material Reallocation</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Using high-tension rebar allows for 15% less concrete volume while maintaining identical structural integrity.</p>
                  </div>
                  <div className="savings">-$840</div>
                </div>
                
                <div className="optimization-card">
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0' }}>Standardized Cuts</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Adjusting room width by 0.2m aligns perfectly with standard material sizes, reducing waste cuts to 2%.</p>
                  </div>
                  <div className="savings">-$420</div>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}

export default App;
