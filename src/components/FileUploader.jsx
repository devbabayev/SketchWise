import React, { useState, useCallback } from 'react';
import { UploadCloud, File as FileIcon, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FileUploader({ onFilesSelected }) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (newFiles) => {
    const validFiles = Array.from(newFiles).filter(
      file => file.type.startsWith('image/') || file.type === 'application/pdf'
    );
    
    if (validFiles.length > 0) {
      const updatedFiles = [...files, ...validFiles];
      setFiles(updatedFiles);
      onFilesSelected(updatedFiles);
    }
  };

  const removeFile = (indexToRemove) => {
    const updatedFiles = files.filter((_, i) => i !== indexToRemove);
    setFiles(updatedFiles);
    onFilesSelected(updatedFiles);
  };

  const loadSampleBlueprint = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const sampleFile = new window.File(
        ['sample architectural blueprint content'], 
        'Small_Cabin_Floor_Plan_Sample.jpg', 
        { type: 'image/jpeg' }
      );
      handleFiles([sampleFile]);
    } catch (err) {
      console.error('Failed to create sample File:', err);
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Interactive Drop Area */}
      <motion.div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
        animate={{
          scale: isDragging ? 1.02 : 1,
          borderColor: isDragging ? 'rgba(99, 102, 241, 0.8)' : 'rgba(255, 255, 255, 0.1)',
          backgroundColor: isDragging ? 'rgba(99, 102, 241, 0.05)' : 'rgba(0, 0, 0, 0.3)'
        }}
        className="w-full relative overflow-hidden rounded-2xl border border-dashed p-8 text-center cursor-pointer flex flex-col items-center justify-center transition-all duration-300 hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(79,70,229,0.15)] group"
      >
        <input 
          type="file" 
          multiple 
          accept="image/*,application/pdf"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        
        {/* Animated Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/0 via-purple-500/0 to-indigo-500/0 group-hover:from-indigo-500/10 group-hover:via-purple-500/5 group-hover:to-indigo-500/10 transition-colors duration-500 z-0" />

        <div className="relative z-1 flex flex-col items-center pointer-events-none">
          <div className="bg-indigo-500/20 p-4 rounded-full mb-4 group-hover:bg-indigo-500/30 transition-colors">
            <UploadCloud className="w-8 h-8 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Drag & Drop project files</h3>
          <p className="text-sm text-gray-400 max-w-sm">
            Upload sketches, blueprints, or PDF requirements. Our AI will analyze them to configure your project parameters.
          </p>
        </div>
      </motion.div>

      {/* Quick Action: Instant Demo Loader */}
      <div className="flex items-center justify-between px-2 text-xs text-gray-400">
        <span>Supported: PNG, JPG, PDF</span>
        <button
          type="button"
          onClick={loadSampleBlueprint}
          className="text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer font-medium"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Use Demo Blueprint
        </button>
      </div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 pt-1"
          >
            {files.map((file, i) => (
              <motion.div 
                key={`${file.name}-${i}`}
                initial={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(5px)' }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="flex items-center justify-between p-3 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 hover:border-indigo-500/30 transition-colors group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-indigo-500/10 rounded-md group-hover:bg-indigo-500/20 transition-colors">
                    <FileIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                  </div>
                  <span className="text-sm font-medium text-gray-300 truncate">{file.name}</span>
                </div>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(i);
                  }}
                  className="p-1.5 bg-red-500/0 hover:bg-red-500/20 rounded-full transition-colors text-gray-500 hover:text-red-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
