import React from 'react';

interface FmmLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const FmmLogo: React.FC<FmmLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-7 h-9',
    md: 'w-9 h-11',
    lg: 'w-12 h-15',
    xl: 'w-20 h-26',
  }[size];

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${sizeClasses} ${className}`}>
      <img
        src="/fmm_logo.jpg"
        alt="FMM BLSA Project Logo"
        referrerPolicy="no-referrer"
        className="w-full h-full object-contain filter drop-shadow-2xs select-none"
        onError={(e) => {
          // If local file loading ever has an issue, fallback to vector SVG
          e.currentTarget.style.display = 'none';
          const sibling = e.currentTarget.nextElementSibling as HTMLElement;
          if (sibling) sibling.style.display = 'block';
        }}
      />
      {/* SVG Fallback */}
      <svg
        viewBox="0 0 100 130"
        className="w-full h-full hidden"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="50" cy="65" rx="48" ry="62" stroke="#111827" strokeWidth="2" fill="#ffffff" />
        {/* Grey quadrant fills */}
        <path d="M 50 5 A 48 62 0 0 0 5 60 L 44 60 L 44 5 Z" fill="#d1d5db" />
        <path d="M 56 5 L 56 60 L 95 60 A 48 62 0 0 0 56 5 Z" fill="#d1d5db" />
        <path d="M 5 70 A 48 62 0 0 0 44 125 L 44 70 L 5 70 Z" fill="#d1d5db" />
        <path d="M 56 70 L 56 125 A 48 62 0 0 0 95 70 L 56 70 Z" fill="#d1d5db" />
        {/* Central white cross */}
        <path
          d="M 44 3 L 56 3 L 53 58 L 97 58 L 97 72 L 53 72 L 56 127 L 44 127 L 47 72 L 3 72 L 3 58 L 47 58 Z"
          fill="#ffffff"
          stroke="#111827"
          strokeWidth="1"
        />
        {/* F M M in red */}
        <text x="25" y="32" fill="#dc2626" fontSize="18" fontWeight="bold" fontFamily="serif" textAnchor="middle">F</text>
        <text x="25" y="47" fill="#dc2626" fontSize="18" fontWeight="bold" fontFamily="serif" textAnchor="middle">M</text>
        <text x="25" y="62" fill="#dc2626" fontSize="18" fontWeight="bold" fontFamily="serif" textAnchor="middle">M</text>
        {/* S S S in red */}
        <text x="75" y="86" fill="#dc2626" fontSize="18" fontWeight="bold" fontFamily="serif" textAnchor="middle">S</text>
        <text x="75" y="101" fill="#dc2626" fontSize="18" fontWeight="bold" fontFamily="serif" textAnchor="middle">S</text>
        <text x="75" y="116" fill="#dc2626" fontSize="18" fontWeight="bold" fontFamily="serif" textAnchor="middle">S</text>
        {/* Towards wholeness motto */}
        <text x="50" y="125" fill="#111827" fontSize="7" fontStyle="italic" fontFamily="serif" textAnchor="middle">
          Towards wholeness
        </text>
      </svg>
    </div>
  );
};
