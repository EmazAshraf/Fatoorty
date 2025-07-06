'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, Search, Sparkles, Zap, Star, Navigation, Globe, Layers } from 'lucide-react';
import { useRef } from 'react';

export default function AnimatedNotFound() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div ref={containerRef} className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(109,114,207,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(109,114,207,0.1)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      
      {/* Dynamic Gradient Beams */}
      <motion.div
        animate={{ 
          rotate: 360,
          scale: [1, 1.5, 1],
        }}
        transition={{ 
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute inset-0 opacity-20"
      >
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-gradient-to-r from-[#6D72CF] via-purple-600 to-indigo-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 rounded-full blur-[110px]" />
      </motion.div>

      {/* Floating Geometric Shapes */}
      <motion.div
        animate={{ 
          y: [0, -30, 0],
          rotate: [0, 180, 360],
          scale: [1, 1.2, 1]
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 left-20 w-16 h-16 border border-[#6D72CF]/30 rounded-lg"
      />

      <motion.div
        animate={{ 
          y: [0, 40, 0],
          rotate: [0, -180, -360],
          scale: [1, 0.8, 1]
        }}
        transition={{ 
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute bottom-20 right-20 w-20 h-20 border border-purple-400/30 rounded-full"
      />

      <motion.div
        animate={{ 
          y: [0, -20, 0],
          x: [0, 15, 0],
          rotate: [0, 90, 180]
        }}
        transition={{ 
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4
        }}
        className="absolute top-40 right-32 w-12 h-12 border border-cyan-400/30 transform rotate-45"
      />

      {/* Particle System */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ 
            y: [0, -100, 0],
            x: [0, Math.sin(i) * 50, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0]
          }}
          transition={{ 
            duration: 3 + i * 0.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.1
          }}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}

      {/* Main Content Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-2xl w-full">
          {/* Glowing Border Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative p-8 rounded-3xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl"
            style={{
              boxShadow: "0 0 80px rgba(109, 114, 207, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
            }}
          >
            {/* Animated Corner Decorations */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-[#6D72CF] rounded-tl-lg"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-purple-400 rounded-tr-lg"
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-cyan-400 rounded-bl-lg"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-pink-400 rounded-br-lg"
            />

            <div className="text-center space-y-8">
              {/* 404 Number with Advanced Effects */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 200, 
                  damping: 15,
                  delay: 0.2
                }}
                className="relative"
              >
                <h1 className="text-8xl md:text-9xl font-black bg-gradient-to-r from-[#6D72CF] via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  404
                </h1>
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#6D72CF] via-purple-400 to-cyan-400 bg-clip-text text-transparent blur-xl opacity-30">
                  404
                </div>
              </motion.div>

              {/* Main Message */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="space-y-4"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  Page Not Found
                </h2>
                <p className="text-gray-300 text-lg max-w-md mx-auto leading-relaxed">
                  The digital realm you're seeking seems to have wandered off into the void. 
                  Let's navigate back to familiar territory.
                </p>
              </motion.div>

              {/* Advanced Button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="pt-4"
              >
                <motion.button
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 0 40px rgba(109, 114, 207, 0.6)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.history.back()}
                  className="group relative px-8 py-4 bg-gradient-to-r from-[#6D72CF] to-purple-600 text-white font-semibold rounded-2xl overflow-hidden transition-all duration-300"
                >
                  {/* Button Background Animation */}
                  <motion.div
                    animate={{ 
                      x: ["-100%", "100%"],
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />
                  
                  {/* Button Content */}
                  <div className="relative flex items-center justify-center gap-3">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span>Navigate Back</span>
                  </div>
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Data Streams */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-10 text-xs text-[#6D72CF]/60 font-mono"
      >
        <div>404_ERROR</div>
        <div>PAGE_NOT_FOUND</div>
        <div>RETURN_TO_ORIGIN</div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/4 right-10 text-xs text-purple-400/60 font-mono text-right"
      >
        <div>NAVIGATION_FAILED</div>
        <div>REDIRECTING...</div>
        <div>BACK_TO_SAFETY</div>
      </motion.div>
    </div>
  );
} 