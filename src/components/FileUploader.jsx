import React, { useState, useCallback } from 'react';
import { UploadCloud, File, X } from 'lucide-react';
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

  return (
    <div className="w-full">
      <motion.div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        animate={{
          scale: isDragging ? 1.02 : 1,
          borderColor: isDragging ? 'rgba(99, 102, 241, 0.8)' : 'rgba(255, 255, 255, 0.1)',
          backgroundColor: isDragging ? 'rgba(99, 102, 241, 0.05)' : 'rgba(0, 0, 0, 0.3)'
        }}
        className="w-full relative overflow-hidden rounded-2xl border border-dashed p-8 text-center cursor-pointer flex flex-col items-center justify-center transition-colors"
      >
        <input 
          type="file" 
          multiple 
          accept="image/*,application/pdf"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="bg-indigo-500/20 p-4 rounded-full mb-4">
          <UploadCloud className="w-8 h-8 text-indigo-400" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">Drag & Drop project files</h3>
        <p className="text-sm text-gray-400 max-w-sm">
          Upload sketches, blueprints, or PDF requirements. Our AI will analyze them to configure your project parameters.
        </p>
      </motion.div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-2"
          >
            {files.map((file, i) => (
              <motion.div 
                key={`${file.name}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a1a] border border-white/5"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <File className="w-5 h-5 text-indigo-400 shrink-0" />
                  <span className="text-sm text-gray-300 truncate">{file.name}</span>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(i);
                  }}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
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
