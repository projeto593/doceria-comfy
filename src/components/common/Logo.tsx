import React from 'react';

interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ variant = 'dark', size = 'md', onClick }) => {
  const isLight = variant === 'light';

  const iconSizes = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 select-none ${
        onClick ? 'cursor-pointer transition-opacity hover:opacity-90' : ''
      }`}
    >
      {/* Terracotta signature organic rounded icon */}
      <div
        className={`${iconSizes[size]} rounded-[40%_60%_70%_30%/40%_50%_60%_50%] bg-[#D07A6D] text-white flex items-center justify-center font-bold shadow-xs transition-transform duration-300 hover:rotate-6`}
      >
        <span className="font-serif italic text-white pb-0.5 font-bold">c</span>
      </div>

      {/* Brand Name */}
      <span
        className={`${textSizes[size]} font-semibold tracking-tight ${
          isLight ? 'text-white' : 'text-[#231818]'
        }`}
      >
        comfy<span className="text-[#D07A6D]">.</span>
      </span>
    </div>
  );
};
