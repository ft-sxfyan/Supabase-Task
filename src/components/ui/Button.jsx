import React from 'react';

export const Button = ({ children, variant = 'primary', ...props }) => {
  return (
    <button
      {...props} // Passes down standard features like onClick or type="submit"
      className={`w-full py-3 px-6 rounded-xl font-medium tracking-wide transition-all duration-300 active:scale-[0.98] ${
        variant === 'primary'
          ? 'bg-white text-black hover:bg-gray-200 shadow-lg'
          : 'bg-white/5 text-white border border-white/10 hover:bg-white/10 backdrop-blur-md'
      }`}
    >
      {children}
    </button>
  );
};