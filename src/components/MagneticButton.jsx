import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function MagneticButton({ children, onClick, disabled, className, variant = 'primary' }) {
  const buttonRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (disabled) return;
    const { clientX, clientY } = e;
    const { width, height, left, top } = buttonRef.current.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    setPosition({ x: x * 0.2, y: y * 0.2 });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const baseStyles = "relative w-full overflow-hidden rounded-xl py-4 flex items-center justify-center gap-2 font-semibold text-sm tracking-wide uppercase transition-colors outline-none group";
  
  const variants = {
    primary: "bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] border border-indigo-500/50",
    secondary: "bg-white text-black shadow-md hover:bg-gray-100",
  };

  return (
    <motion.button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      disabled={disabled}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      className={`${baseStyles} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className || ''}`}
    >
      <div className="relative z-10 flex items-center gap-2">
        {children}
      </div>
      
      {/* Glow overlay */}
      {!disabled && variant === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0 mix-blend-screen" />
      )}
    </motion.button>
  );
}
