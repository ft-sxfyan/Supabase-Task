import React from 'react';

export const Input = ({ label, ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full text-left">
      {/* The text label on top of the box */}
      <label className="text-xs font-semibold text-gray-400 tracking-wide">
        {label}
      </label>
      
      {/* The clean glassmorphism text box */}
      <input
        {...props} // Passes down standard inputs like type="text" or placeholder
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 backdrop-blur-md focus:bg-white/10 focus:border-white/30 focus:shadow-[0_0_15px_rgba(255,255,255,0.1)] outline-none transition-all duration-300"
      />
    </div>
  );
};