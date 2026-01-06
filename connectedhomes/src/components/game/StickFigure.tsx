import React from 'react';

interface StickFigureProps {
  color?: string;
  size?: number;
  activity?: 'idle' | 'walking' | 'waving' | 'sitting' | 'jumping';
  className?: string;
}

export const StickFigure: React.FC<StickFigureProps> = ({
  color = 'currentColor',
  size = 24,
  activity = 'idle',
  className = '',
}) => {
  const getActivityClass = () => {
    switch (activity) {
      case 'walking':
        return 'animate-walk';
      case 'waving':
        return 'animate-wave';
      case 'jumping':
        return 'animate-jump';
      case 'sitting':
        return '';
      default:
        return 'animate-breathe';
    }
  };

  if (activity === 'sitting') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={`${className}`}
        style={{ color }}
      >
        {/* Head */}
        <circle cx="12" cy="4" r="3" fill="currentColor" />
        {/* Body */}
        <line x1="12" y1="7" x2="12" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Arms resting */}
        <line x1="12" y1="9" x2="8" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="12" y1="9" x2="16" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Legs bent (sitting) */}
        <line x1="12" y1="14" x2="8" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="18" x2="6" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="12" y1="14" x2="16" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="16" y1="18" x2="18" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (activity === 'waving') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={`animate-wave ${className}`}
        style={{ color }}
      >
        {/* Head */}
        <circle cx="12" cy="5" r="3" fill="currentColor" />
        {/* Body */}
        <line x1="12" y1="8" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Waving arm */}
        <line x1="12" y1="10" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="origin-bottom-right animate-arm-wave" />
        {/* Other arm */}
        <line x1="12" y1="10" x2="17" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Legs */}
        <line x1="12" y1="15" x2="8" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="12" y1="15" x2="16" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (activity === 'jumping') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={`animate-jump ${className}`}
        style={{ color }}
      >
        {/* Head */}
        <circle cx="12" cy="4" r="3" fill="currentColor" />
        {/* Body */}
        <line x1="12" y1="7" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Arms up */}
        <line x1="12" y1="9" x2="6" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="12" y1="9" x2="18" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Legs spread */}
        <line x1="12" y1="13" x2="7" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="12" y1="13" x2="17" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`${getActivityClass()} ${className}`}
      style={{ color }}
    >
      {/* Head */}
      <circle cx="12" cy="5" r="3" fill="currentColor" />
      {/* Body */}
      <line x1="12" y1="8" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Arms */}
      <line x1="12" y1="10" x2="7" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="10" x2="17" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Legs */}
      <line x1="12" y1="15" x2="8" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="15" x2="16" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};
