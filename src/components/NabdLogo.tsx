import React from 'react';

interface NabdLogoProps {
  variant?: 'horizontal' | 'vertical' | 'icon' | 'compact';
  theme?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  showTagline?: boolean;
  className?: string;
}

/**
 * Nabd Emblem SVG - Pin with City Skyline & Golden Sun
 * Matched precisely to the official NABD Brand Identity Styleboard:
 * - GPS Map Pin container in Deep Navy (#0B3A5B)
 * - Modern urban city towers / skyscrapers inside (#FFFFFF)
 * - Golden solar orb / dot (#D4AF37)
 */
export const NabdEmblem: React.FC<{
  size?: number;
  theme?: 'light' | 'dark';
  mode?: 'solid' | 'outline';
  className?: string;
}> = ({ size = 44, theme = 'light', mode = 'solid', className = '' }) => {
  const isDark = theme === 'dark';
  const pinBg = isDark ? '#FFFFFF' : '#0B3A5B';
  const towerFill = isDark ? '#0B3A5B' : '#FFFFFF';
  const windowFill = isDark ? '#FFFFFF' : '#0B3A5B';
  const sunColor = '#D4AF37';

  if (mode === 'outline') {
    return (
      <svg
        width={size}
        height={size * 1.22}
        viewBox="0 0 100 122"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 transition-transform ${className}`}
      >
        <path
          d="M50 4C24.595 4 4 24.595 4 50C4 71.5 28.5 97.5 45.2 114.8C47.8 117.5 52.2 117.5 54.8 114.8C71.5 97.5 96 71.5 96 50C96 24.595 75.405 4 50 4Z"
          fill="none"
          stroke={isDark ? '#FFFFFF' : '#0B3A5B'}
          strokeWidth="6"
          strokeLinejoin="round"
        />
        <circle cx="68" cy="32" r="5.5" fill={sunColor} />
        <g fill={isDark ? '#FFFFFF' : '#0B3A5B'}>
          <path d="M26 72V46L34 40V72H26Z" />
          <path d="M36 72V36L44 32V72H36Z" />
          <path d="M46 72V24L54 28V72H46Z" />
          <path d="M56 72V34L64 38V72H56Z" />
          <path d="M66 72V44L74 48V72H66Z" />
          <path d="M22 72C22 72 34 78 50 78C66 78 78 72 78 72V76C78 76 66 84 50 84C34 84 22 76 22 76V72Z" />
        </g>
      </svg>
    );
  }

  // Solid Version (Official Styleboard Primary Icon)
  return (
    <svg
      width={size}
      height={size * 1.22}
      viewBox="0 0 100 122"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-xs transition-transform ${className}`}
    >
      {/* Outer Solid Map Pin */}
      <path
        d="M50 4C24.595 4 4 24.595 4 50C4 71.5 28.5 97.5 45.2 114.8C47.8 117.5 52.2 117.5 54.8 114.8C71.5 97.5 96 71.5 96 50C96 24.595 75.405 4 50 4Z"
        fill={pinBg}
      />

      {/* Golden Solar Orb */}
      <circle cx="68" cy="32" r="5.5" fill={sunColor} />

      {/* White Architectural Skyline Silhouette inside Pin */}
      <g fill={towerFill}>
        {/* Left Secondary Tower */}
        <path d="M26 72V46L34 40V72H26Z" />
        {/* Left-Mid Tower */}
        <path d="M36 72V36L44 32V72H36Z" />
        {/* Center Primary Tower (Tallest Spire) */}
        <path d="M46 72V24L54 28V72H46Z" />
        {/* Right-Mid Tower with angled crown */}
        <path d="M56 72V34L64 38V72H56Z" />
        {/* Right Secondary Tower */}
        <path d="M66 72V44L74 48V72H66Z" />

        {/* Foundation Base Arc */}
        <path
          d="M22 72C22 72 34 78 50 78C66 78 78 72 78 72V75C78 75 66 82 50 82C34 82 22 75 22 75V72Z"
          fill={towerFill}
        />

        {/* Window accents (slits) on center towers */}
        <rect x="49" y="34" width="2" height="4" fill={windowFill} opacity="0.9" />
        <rect x="49" y="42" width="2" height="4" fill={windowFill} opacity="0.9" />
        <rect x="49" y="50" width="2" height="4" fill={windowFill} opacity="0.9" />
        <rect x="39" y="44" width="2" height="3.5" fill={windowFill} opacity="0.9" />
        <rect x="59" y="44" width="2" height="3.5" fill={windowFill} opacity="0.9" />
      </g>
    </svg>
  );
};

export const NabdLogo: React.FC<NabdLogoProps> = ({
  variant = 'horizontal',
  theme = 'light',
  size = 'md',
  showSubtitle = true,
  showTagline = false,
  className = '',
}) => {
  // Size calculations
  const emblemSizes = {
    sm: 28,
    md: 36,
    lg: 48,
    xl: 64,
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl sm:text-4xl',
    xl: 'text-4xl sm:text-5xl',
  };

  const englishSizes = {
    sm: 'text-[9px] tracking-[0.22em]',
    md: 'text-[11px] tracking-[0.28em]',
    lg: 'text-xs tracking-[0.32em]',
    xl: 'text-sm tracking-[0.4em]',
  };

  const textColor = theme === 'dark' ? 'text-white' : 'text-[#0B3A5B]';
  const emblemDim = emblemSizes[size];

  // 1. Icon Only
  if (variant === 'icon') {
    return <NabdEmblem size={emblemDim} theme={theme} className={className} />;
  }

  // 2. Vertical Layout (Official Styleboard Hero Format)
  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center font-cairo ${className}`}>
        {/* Emblem */}
        <div className="mb-2 hover:scale-105 transition-transform duration-300">
          <NabdEmblem size={emblemDim * 1.25} theme={theme} />
        </div>

        {/* Arabic Brandmark «نبض» */}
        <div className={`font-extrabold ${textSizes[size]} ${textColor} tracking-tight leading-none`}>
          نَبْـض
        </div>

        {/* English Brandmark N A B D in Gold */}
        {showSubtitle && (
          <div
            className={`font-inter font-bold text-[#D4AF37] ${englishSizes[size]} uppercase mt-1 select-none`}
            style={{ letterSpacing: '0.35em' }}
          >
            N A B D
          </div>
        )}

        {/* Tagline */}
        {showTagline && (
          <div className="text-xs text-slate-500 max-w-xs mt-2.5 font-medium leading-relaxed">
            من البلاغ إلى القرار إلى المقاس .. سلسلة واحدة لمرافق الأمانة
          </div>
        )}
      </div>
    );
  }

  // 3. Compact Layout (Inline badge)
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 font-cairo ${className}`}>
        <NabdEmblem size={emblemDim} theme={theme} />
        <div className="leading-tight">
          <div className={`font-extrabold ${textSizes[size]} ${textColor} tracking-tight`}>
            نَبْـض
          </div>
          {showSubtitle && (
            <div
              className={`font-inter font-bold text-[#D4AF37] ${englishSizes[size]} uppercase -mt-0.5`}
              style={{ letterSpacing: '0.28em' }}
            >
              N A B D
            </div>
          )}
        </div>
      </div>
    );
  }

  // 4. Horizontal Standard Layout (Default - Emblem + Arabic + English Gold)
  return (
    <div className={`flex items-center gap-3 font-cairo ${className}`}>
      {/* Emblem with subtle hover animation */}
      <div className="shrink-0 hover:scale-105 transition-transform duration-200">
        <NabdEmblem size={emblemDim} theme={theme} />
      </div>

      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-baseline gap-2">
          {/* Arabic Typography */}
          <span className={`font-extrabold ${textSizes[size]} ${textColor} tracking-tight`}>
            نَبْـض
          </span>

          {/* English Typography in Gold */}
          {showSubtitle && (
            <span
              className={`font-inter font-bold text-[#D4AF37] ${englishSizes[size]} uppercase select-none`}
              style={{ letterSpacing: '0.25em' }}
            >
              N A B D
            </span>
          )}
        </div>

        {showTagline && (
          <span className="text-[10px] text-slate-400 font-medium mt-1">
            سلسلة واحدة لمرافق الأمانة
          </span>
        )}
      </div>
    </div>
  );
};
