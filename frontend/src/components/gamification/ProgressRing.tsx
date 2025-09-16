import React from 'react';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number; // diameter in pixels
  strokeWidth?: number;
  label?: string;
  showPercentage?: boolean;
  color?: string;
  backgroundColor?: string;
  className?: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  progress = 0,
  size = 120,
  strokeWidth = 8,
  label,
  showPercentage = true,
  color = '#10B981', // green-500
  backgroundColor = '#E5E7EB', // gray-200
  className = ''
}) => {
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            className="transition-all duration-500 ease-in-out"
          />
        </svg>
        
        {/* Centered content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showPercentage && (
            <span className="text-2xl font-bold text-gray-900">
              {Math.round(progress)}%
            </span>
          )}
          {label && !showPercentage && (
            <span className="text-sm font-medium text-gray-600 text-center">
              {label}
            </span>
          )}
        </div>
      </div>
      
      {label && showPercentage && (
        <p className="mt-2 text-sm font-medium text-gray-600 text-center">
          {label}
        </p>
      )}
    </div>
  );
};

export default ProgressRing;