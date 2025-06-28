
import React from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface LogoProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'medium' }) => {
  // Size mappings
  const sizeClasses = {
    small: 'h-8',
    medium: 'h-10',
    large: 'h-12'
  };
  
  return (
    <div className={`flex items-center ${className}`}>
      <div className={`${sizeClasses[size]} aspect-square relative`}>
        <AspectRatio ratio={1 / 1} className="bg-primary rounded-md flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-lg">CRM</span>
        </AspectRatio>
      </div>
      <span className="ml-2 font-bold text-foreground">Micro CRM</span>
    </div>
  );
};

export default Logo;
