import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Cylinder, MeshDistortMaterial } from '@react-three/drei';
import { ArrowRight, Calculator, Check, DollarSign, Lock, Sparkles, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import FileUploader from './FileUploader.jsx';
import MagneticButton from './MagneticButton.jsx';

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
      <MeshDistortMaterial color="#6366f1" clearcoat={1} clearcoatRoughness={0.1} metalness={0.5} roughness={0.2} distort={0.4} speed={2} />
    </mesh>
  );
};

export default function MainFlow() {
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Secure Paywall State
  const [projectId, setProjectId] = useState(null);
  const [teaser, setTeaser] = useState(null);
  const [fullResult, setFullResult] = useState(null);
  const [userId, setUserId] = useState(null);
  
  const [hasToken, setHasToken] = useState(true);
  const [purchaseEmail, setPurchaseEmail] = useState('');
  const [purchasePassword, setPurchasePassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch('/api/admin/token-status')
      .then(res => res.json())
      .then(data => setHasToken(data.hasToken))
      .catch(() => setHasToken(false));
  }, []);

  const handleAnalyze = async () => {
    setErrorMsg('');
    setIsAnalyzing(true);
    
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    try {
      const res = await fetch('/api/analyze-files', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze files');
      
      setProjectId(data.projectId);
      setTeaser(data.teaser);
      setStep(1); // Move to estimation step
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePurchase = async () => {
    setErrorMsg('');
    try {
      const res = await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          email: purchaseEmail || 'user@example.com',
          password: purchasePassword || 'secure123'
        })
      });
      const data = await res.json();
      if (res.ok) {
        setUserId(data.userId);
        setFullResult(data.fullResult);
        setStep(2); // Move to final result step
      } else {
        throw new Error(data.error || 'Failed to unlock report');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col md:flex-row font-sans">
      {!hasToken && (
        <div className="absolute top-0 left-0 w-full bg-amber-500/10 text-amber-500 border-b border-amber-500/20 py-2 text-center text-sm z-50">
          ⚠️ Mock Data Mode: AI Token is not configured. Visit <a href="/admin" className="underline font-bold">/admin</a> to set it.
        </div>
      )}

      {/* Left panel - 3D Visualizer */}
      <div className="w-full md:w-1/2 h-[50vh] md:h-screen relative overflow-hidden bg-black flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/20 to-transparent pointer-events-none" />
        <Canvas camera={{ position: [5, 5, 5], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <AbstractShape />
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      {/* Right panel - UI */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 lg:p-16 h-[50vh] md:h-screen overflow-y-auto">
        <div className="w-full max-w-xl">
          {step === 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div>
                <h1 className="text-4xl font-bold tracking-tight mb-4">SketchWise</h1>
                <p className="text-gray-400 text-lg">
                  Upload your designs, sketches, or blueprints. Our AI engine identifies the requirements and computes cost optimizations automatically.
                </p>
              </div>
              <FileUploader onFilesSelected={setFiles} />
              
              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
                  {errorMsg}
                </div>
              )}

              <MagneticButton 
                onClick={handleAnalyze}
                disabled={files.length === 0 || isAnalyzing}
                variant="primary"
              >
                {isAnalyzing ? 'Analyzing with AI...' : 'Calculate Optimal Costs'}
                <Sparkles className="w-5 h-5" />
              </MagneticButton>
            </motion.div>
          )}

          {step === 1 && teaser && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <h2 className="text-3xl font-bold">Optimization Preview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#111] border border-white/5 p-6 rounded-2xl">
                  <h3 className="text-gray-400 mb-2">Original Estimate</h3>
                  <div className="text-3xl font-bold">${teaser.original.toLocaleString()}</div>
                </div>
                <div className="bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4">
                    <TrendingDown className="w-6 h-6 text-indigo-400 opacity-50" />
                  </div>
                  <h3 className="text-indigo-300 mb-2">AI Optimized</h3>
                  <div className="text-3xl font-bold text-indigo-400">${teaser.optimized.toLocaleString()}</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-b from-[#161616] to-[#0a0a0a] rounded-2xl p-8 border border-white/5 space-y-5 relative overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] group">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                      <Lock className="w-5 h-5 text-gray-300" />
                    </div>
                    <h3 className="font-semibold text-xl tracking-tight">Secure Paywall</h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                    The detailed cost breakdown, exact material quantities, and architectural optimizations are hidden. Purchase to unlock the full blueprint.
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <input
                      type="email"
                      placeholder="Your Email"
                      value={purchaseEmail}
                      onChange={e => setPurchaseEmail(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm placeholder:text-gray-600"
                    />
                    <input
                      type="password"
                      placeholder="Create Password"
                      value={purchasePassword}
                      onChange={e => setPurchasePassword(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm placeholder:text-gray-600"
                    />
                  </div>
                  
                  {errorMsg && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-4">
                      {errorMsg}
                    </div>
                  )}

                <MagneticButton
                  onClick={handlePurchase}
                  variant="secondary"
                >
                  <DollarSign className="w-5 h-5" />
                  Unlock Full Report
                </MagneticButton>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && fullResult && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="flex items-center gap-3 text-green-400 mb-6">
                <div className="bg-green-400/20 p-2 rounded-full"><Check className="w-6 h-6" /></div>
                <h2 className="text-2xl font-bold text-white">Purchase Successful</h2>
              </div>
              
              <div className="bg-[#111] p-6 rounded-2xl border border-white/10 mb-6">
                <p className="text-gray-400 text-sm mb-2">Your Unique Project ID</p>
                <div className="text-2xl font-mono tracking-widest text-indigo-400 bg-black/50 p-4 rounded-lg text-center border border-indigo-500/20">
                  {userId?.match(/.{1,4}/g)?.join('-')}
                </div>
                <p className="text-xs text-center mt-3 text-gray-500">Save this ID and your password to access this project later.</p>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b border-white/10 pb-2">Full Material Breakdown</h3>
                <div className="flex justify-between bg-[#1a1a1a] p-4 rounded-lg">
                  <span className="text-gray-400">Concrete required:</span>
                  <span className="font-bold">{fullResult.materials.concrete} units</span>
                </div>
                <div className="flex justify-between bg-[#1a1a1a] p-4 rounded-lg">
                  <span className="text-gray-400">Steel required:</span>
                  <span className="font-bold">{fullResult.materials.steel} units</span>
                </div>
                
                <h3 className="font-semibold text-lg border-b border-white/10 pb-2 mt-6">Extracted Variables</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(fullResult.variables).map(([key, val]) => (
                    <div key={key} className="bg-[#1a1a1a] p-4 rounded-lg">
                      <div className="text-xs text-gray-500 uppercase">{key}</div>
                      <div className="font-bold">{val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
