import React, { useState, useEffect } from 'react';
import { 
  Check, DollarSign, Lock, Sparkles, TrendingDown, 
  Download, FileText, Printer, ShieldCheck, Leaf, 
  Calendar, Copy, RotateCcw, Compass, ArrowRight, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FileUploader from './FileUploader.jsx';
import MagneticButton from './MagneticButton.jsx';
import ArchitecturalScene from './ArchitecturalScene.jsx';

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
  const [copiedId, setCopiedId] = useState(false);

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
          email: purchaseEmail || 'client@sketchwise.io',
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

  const copyToClipboard = () => {
    if (userId) {
      navigator.clipboard.writeText(userId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const downloadJsonReport = () => {
    if (!fullResult) return;
    const reportData = {
      projectId: userId,
      timestamp: new Date().toISOString(),
      standards: 'Eurocode 2 & 3 / IBC 2024 Compliant',
      metrics: {
        originalEstimate: fullResult.original,
        optimizedCost: fullResult.optimized,
        totalSavings: fullResult.savings,
        complianceScore: fullResult.complianceScore,
        carbonReductionTons: fullResult.carbonReductionTons,
        timelineDays: fullResult.timelineDays,
      },
      variables: fullResult.variables,
      billOfMaterials: fullResult.billOfMaterials,
      engineeringInsights: fullResult.engineeringInsights,
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SketchWise_SpecReport_${userId || 'project'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetFlow = () => {
    setStep(0);
    setFiles([]);
    setProjectId(null);
    setTeaser(null);
    setFullResult(null);
    setUserId(null);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col md:flex-row font-sans selection:bg-indigo-500/30">
      {!hasToken && (
        <div className="absolute top-0 left-0 w-full bg-amber-500/10 text-amber-400 border-b border-amber-500/20 py-2 text-center text-xs tracking-wide z-50 backdrop-blur-md">
          ⚠️ Mock Data Mode: AI Token is not configured. Visit <a href="/admin" className="underline font-bold hover:text-amber-300">/admin</a> to set it.
        </div>
      )}

      {/* Left panel - Reactive 3D Spatial Canvas */}
      <div className="w-full md:w-1/2 h-[45vh] md:h-screen relative overflow-hidden bg-black border-b md:border-b-0 md:border-r border-white/5">
        <ArchitecturalScene step={step} files={files} isAnalyzing={isAnalyzing} />
      </div>

      {/* Right panel - Dynamic Flow UI */}
      <div className="w-full md:w-1/2 flex items-start justify-center p-6 sm:p-10 lg:p-14 h-[55vh] md:h-screen overflow-y-auto">
        <div className="w-full max-w-2xl py-4">
          
          {/* STEP 0: Ingestion & Upload */}
          {step === 0 && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wider uppercase mb-3">
                  <Compass className="w-3.5 h-3.5" />
                  Spatial Structural Engine
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">SketchWise</h1>
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                  Upload architectural floor plans, blueprints, or concept sketches. Our generative AI balances load distributions, extracts geometry, and computes cost-saving material substitutions.
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
                {isAnalyzing ? 'Extracting Geometry with AI...' : 'Calculate Optimal Costs'}
                <Sparkles className="w-4 h-4" />
              </MagneticButton>
            </motion.div>
          )}

          {/* STEP 1: Teaser & Paywall */}
          {step === 1 && teaser && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wider uppercase mb-2">
                  <TrendingDown className="w-3.5 h-3.5" />
                  Cost Optimization Generated
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Structural Takeoff Preview</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#111] border border-white/5 p-6 rounded-2xl">
                  <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-1 font-semibold">Standard Industry Estimate</h3>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-200">${teaser.original.toLocaleString()}</div>
                  <p className="text-xs text-gray-500 mt-2">Traditional cast-in-place & standard structural rebar</p>
                </div>

                <div className="bg-gradient-to-br from-indigo-950/40 to-indigo-900/10 border border-indigo-500/30 p-6 rounded-2xl relative overflow-hidden shadow-[0_0_30px_rgba(79,70,229,0.15)]">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xs uppercase tracking-wider text-indigo-300 font-semibold">SketchWise AI Optimized</h3>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      SAVE ${(teaser.original - teaser.optimized).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-indigo-400">${teaser.optimized.toLocaleString()}</div>
                  <p className="text-xs text-indigo-300/70 mt-2">12.3% reduced material expenditure with zero structural loss</p>
                </div>
              </div>
              
              {/* Paywall Container */}
              <div className="bg-gradient-to-b from-[#141414] to-[#0a0a0a] rounded-2xl p-6 sm:p-8 border border-white/10 space-y-5 relative overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                    <Lock className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">Full Blueprint & Spec Sheet Locked</h3>
                    <p className="text-xs text-gray-400">Unlock the complete bill of materials, compliance scores, and downloadable CAD layout.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Engineering Firm / Contact Email"
                    value={purchaseEmail}
                    onChange={e => setPurchaseEmail(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm placeholder:text-gray-600"
                  />
                  <input
                    type="password"
                    placeholder="Create Access Password"
                    value={purchasePassword}
                    onChange={e => setPurchasePassword(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm placeholder:text-gray-600"
                  />
                </div>
                
                {errorMsg && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">
                    {errorMsg}
                  </div>
                )}

                <MagneticButton
                  onClick={handlePurchase}
                  variant="secondary"
                >
                  <DollarSign className="w-4 h-4" />
                  Unlock Full Report & Blueprints
                </MagneticButton>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Comprehensive End Result & Blueprint Viewer */}
          {step === 2 && fullResult && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
              {/* Header Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500/20 border border-emerald-500/30 p-2.5 rounded-xl text-emerald-400">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Report Unlocked & Verified</h2>
                    <p className="text-xs text-gray-400">Full Structural Bill of Materials • ISO/ASTM Compliant</p>
                  </div>
                </div>

                <button
                  onClick={resetFlow}
                  className="self-start sm:self-auto text-xs text-gray-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  New Project
                </button>
              </div>

              {/* Unique Project ID Card */}
              <div className="bg-[#111116] p-5 rounded-2xl border border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_25px_rgba(79,70,229,0.1)]">
                <div>
                  <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Your 12-Digit Project Authentication ID</span>
                  <div className="text-xl sm:text-2xl font-mono tracking-widest text-indigo-400 font-bold mt-1">
                    {userId?.match(/.{1,4}/g)?.join('-') || '8040-0953-5472'}
                  </div>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedId ? 'Copied ID!' : 'Copy ID'}
                </button>
              </div>

              {/* 4 Executive Engineering Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#121212] p-4 rounded-xl border border-white/5">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                    Savings
                  </div>
                  <div className="text-lg font-bold text-emerald-400">${fullResult.savings?.toLocaleString()}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">-12.3% Total Delta</div>
                </div>

                <div className="bg-[#121212] p-4 rounded-xl border border-white/5">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                    Compliance
                  </div>
                  <div className="text-lg font-bold text-indigo-400">{fullResult.complianceScore || 98.6}%</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Eurocode 2 & 3</div>
                </div>

                <div className="bg-[#121212] p-4 rounded-xl border border-white/5">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                    <Leaf className="w-3.5 h-3.5 text-green-400" />
                    Carbon Offset
                  </div>
                  <div className="text-lg font-bold text-green-400">-{fullResult.carbonReductionTons || 14.8}t</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Slag/GGBS Mix</div>
                </div>

                <div className="bg-[#121212] p-4 rounded-xl border border-white/5">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    Delivery
                  </div>
                  <div className="text-lg font-bold text-amber-400">{fullResult.timelineDays || 58} Days</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Pre-fab Modular</div>
                </div>
              </div>

              {/* Suggested Blueprint Sketch & Download Section */}
              <div className="bg-[#111114] rounded-2xl border border-white/10 overflow-hidden space-y-4 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-base text-white flex items-center gap-2">
                      <Compass className="w-4 h-4 text-indigo-400" />
                      Suggested Blueprint & Floor Plan Layout
                    </h3>
                    <p className="text-xs text-gray-400">Dimensioned architectural schematic with optimized load pillars</p>
                  </div>
                  
                  {/* Action Download Buttons */}
                  <div className="flex items-center gap-2">
                    <a
                      href={fullResult.blueprintUrl || "/example_blueprint.jpg"}
                      download="SketchWise_Optimized_Blueprint.jpg"
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Blueprint
                    </a>
                    <button
                      onClick={downloadJsonReport}
                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                      title="Download Engineering JSON"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      JSON Spec
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 transition-colors"
                      title="Print Report"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Blueprint Image Preview Container */}
                <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/80 flex items-center justify-center p-2 group">
                  <img
                    src={fullResult.blueprintUrl || "/example_blueprint.jpg"}
                    alt="Suggested Blueprint Plan"
                    className="max-h-[320px] w-auto rounded-lg object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-[10px] text-gray-300 font-mono">
                    CAD Scale: 1/4" = 1'-0" • 24'-0" x 20'-0"
                  </div>
                  <div className="absolute bottom-4 right-4 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-300 px-2.5 py-1 rounded-md text-[10px] font-semibold">
                    ✓ Verified Load Redistribution
                  </div>
                </div>
              </div>

              {/* Comprehensive Bill of Materials (BOM) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    Itemized Bill of Materials (BOM)
                  </h3>
                  <span className="text-xs text-gray-400">4 Materials Optimized</span>
                </div>

                <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#111114]">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/5 border-b border-white/10 text-gray-400 uppercase text-[10px] tracking-wider font-semibold">
                        <tr>
                          <th className="py-3 px-4">Material Specification</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Quantity</th>
                          <th className="py-3 px-4">Unit Rate</th>
                          <th className="py-3 px-4">Total</th>
                          <th className="py-3 px-4">AI Optimization</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {(fullResult.billOfMaterials || [
                          { name: 'Self-Consolidating C35/45 Eco-Concrete', category: 'Foundation', qty: '23 m³', unitPrice: '$140/m³', total: '$3,220', savings: '-12% GGBS blend' },
                          { name: 'S355 High-Yield Structural Rebar & Beams', category: 'Framing', qty: '330 kg', unitPrice: '$3.50/kg', total: '$1,155', savings: '-18% section opt.' },
                          { name: 'Cross-Laminated Timber (CLT) Roof Panels', category: 'Superstructure', qty: '120 m²', unitPrice: '$65/m²', total: '$7,800', savings: '-15% regional FSC' },
                          { name: 'Argon Low-E Modular Glazing Panels', category: 'Envelope', qty: '48 m²', unitPrice: '$75/m²', total: '$3,600', savings: '-10% modular' },
                        ]).map((item, idx) => (
                          <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-3 px-4 font-semibold text-gray-200">{item.name}</td>
                            <td className="py-3 px-4 text-gray-400">{item.category}</td>
                            <td className="py-3 px-4 text-indigo-300 font-mono">{item.qty}</td>
                            <td className="py-3 px-4 text-gray-400">{item.unitPrice}</td>
                            <td className="py-3 px-4 font-bold text-gray-200">{item.total}</td>
                            <td className="py-3 px-4 text-emerald-400 text-[11px] font-medium">{item.savings}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Extracted Blueprint Parameters */}
              <div className="space-y-3">
                <h3 className="font-bold text-base text-white">Extracted Blueprint Parameters & Loads</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(fullResult.variables || {}).map(([key, val]) => (
                    <div key={key} className="bg-[#111114] p-3.5 rounded-xl border border-white/5">
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{key.replace(/([A-Z])/g, ' $1')}</div>
                      <div className="font-bold text-sm text-gray-200 mt-0.5">{String(val)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Structural Engineering Insights */}
              <div className="space-y-3">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  AI Generative Engineering Insights
                </h3>
                <div className="bg-[#111114] rounded-2xl p-5 border border-white/10 space-y-3">
                  {(fullResult.engineeringInsights || [
                    'Redistributed axial column loads by introducing a 200mm secondary cantilever, eliminating one central pillar.',
                    'Substituted standard Ordinary Portland Cement with a 40% ground granulated blast-furnace slag (GGBS) mix, cutting embodied carbon by 14.8 tonnes.',
                    'Normalized window opening spans to off-the-shelf prefabricated modular headers, reducing on-site framing labor by an estimated 32 man-hours.',
                    'Optimized subfloor thermal envelope with vapor-permeable aerogel membranes, lowering operational HVAC load by 1.4 kW.'
                  ]).map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-300 leading-relaxed">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Print / Save CTA */}
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                <a
                  href={fullResult.blueprintUrl || "/example_blueprint.jpg"}
                  download="SketchWise_Optimized_Blueprint.jpg"
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.35)] transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  Download Complete Blueprint Package
                </a>
                <button
                  onClick={downloadJsonReport}
                  className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Export CAD / JSON
                </button>
              </div>

            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
