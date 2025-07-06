'use client';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full  py-2 px-6 mt-auto bottom-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-xs text-neutral-400">
          © {currentYear} Fatoorty. All rights reserved.
        </p>
      </div>
    </footer>
  );
} 