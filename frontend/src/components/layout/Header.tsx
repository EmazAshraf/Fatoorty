'use client';

import { brandColors } from '@/lib/colors';
import Image from 'next/image';

interface HeaderProps {
  showLogo?: boolean;
  title?: string;
}

export default function Header({ showLogo = true }: HeaderProps) {
  return (
    <header 
      className="w-full py-4 px-6 shadow-md flex fixed top-0 left-0 right-0 z-50"
      style={{ backgroundColor: brandColors.primary }}
    >
      <div className="max-w-7xl">
        <div className=" space-x-3">
          {showLogo && (
            <Image
              src="/fatoorty-logo.png"
              alt="Fatoorty Logo"
              width={90}
              height={90}
              className="w-max h-12"
            />
          )}
          
        </div>
        
        
      </div>
    </header>
  );
} 