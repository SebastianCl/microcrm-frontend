
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'medium', showText = true }) => {
  // Size mappings for the image
  const sizeClasses = {
    small: 'h-8 w-8',
    medium: 'h-10 w-10',
    large: 'h-12 w-12'
  };
  
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="/ico-microCRM.webp" 
        alt="Micro CRM Logo" 
        className={`${sizeClasses[size]} object-contain`}
      />
      {showText && (
        <span className="ml-2 font-bold text-foreground">Micro CRM</span>
      )}
    </div>
  );
};

export default Logo;
