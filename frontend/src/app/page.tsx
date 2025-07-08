'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  LayoutDashboard, 
  Building2, 
  Globe, 
  ChefHat,
  QrCode,
  BarChart3,
  Users,
  Shield,
  Zap,
  ArrowRight,
  Sparkles
} from 'lucide-react';

import { useRef } from 'react';

export default function ModernLandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  return (
    <div ref={containerRef} className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background Grid - Same as 404 page */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(109,114,207,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(109,114,207,0.1)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      
      {/* Dynamic Gradient Background */}
      <div className="fixed inset-0 opacity-20">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-[#6D72CF] to-purple-600 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.5, 1],
            rotate: [0, -90, 0],
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
          className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur-3xl"
        />
      </div>

      {/* Hero Section */}
      <motion.section 
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative z-10 min-h-screen flex items-center justify-center px-6"
      >
        <div className="max-w-6xl mx-auto text-center">
          {/* Logo Animation */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 15,
              delay: 0.2
            }}
            className="mb-8"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#6D72CF] to-purple-600 rounded-2xl flex items-center justify-center"
            >
              <motion.div
                animate={{ rotate: [0, -360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
              <ChefHat className="w-10 h-10 text-white" />
              </motion.div>
            </motion.div>
            <motion.h1 
              className="text-6xl md:text-8xl font-black bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Fatoorty
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xl md:text-2xl text-gray-300 mb-8"
            >
              Revolutionary Restaurant Management System
            </motion.p>
          </motion.div>

          {/* Hero Description */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-lg text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Transform your restaurant operations with cutting-edge technology. 
            From QR code menus to real-time analytics, we have got everything you need 
            to elevate your dining experience.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 40px rgba(109, 114, 207, 0.6)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/restaurant/signup'}
              className="group relative px-8 py-4 bg-gradient-to-r from-[#6D72CF] to-purple-600 text-white font-semibold rounded-2xl overflow-hidden transition-all duration-300"
            >
              <motion.div
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
              <div className="relative flex items-center justify-center gap-3">
                <Building2 className="w-5 h-5" />
                <span>Start Your Restaurant</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
            
            <motion.button
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 40px rgba(255, 255, 255, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/superadmin/login'}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              <div className="flex items-center justify-center gap-3">
                <LayoutDashboard className="w-5 h-5" />
                <span>Admin Access</span>
              </div>
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose Fatoorty?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Discover the features that make restaurant management effortless and efficient
            </p>
          </motion.div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: QrCode,
                title: "QR Code Menus",
                description: "Contactless digital menus that update in real-time",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: BarChart3,
                title: "Real-time Analytics",
                description: "Comprehensive insights into your restaurant's performance",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: Users,
                title: "Staff Management",
                description: "Streamline your team operations and scheduling",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: Shield,
                title: "Secure Platform",
                description: "Enterprise-grade security for your business data",
                color: "from-orange-500 to-red-500"
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Optimized for speed and reliability",
                color: "from-yellow-500 to-orange-500"
              },
              {
                icon: Globe,
                title: "Cloud-based",
                description: "Access your restaurant data from anywhere",
                color: "from-indigo-500 to-purple-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="group p-6 bg-white/5 backdrop-blur-sm rounded-2xl  hover:border-white/20 transition-all duration-300"
              >
                <div className="relative w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform overflow-hidden">
                  {/* Moving glow effect */}
                  <motion.div
                    animate={{ 
                      rotate: 360,
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="absolute inset-0 rounded-full m-0"
                    style={{
                      background: `conic-gradient(from 0deg, transparent 0deg, ${feature.color.includes('purple') ? '#6D72CF' : feature.color.includes('blue') ? '#3B82F6' : feature.color.includes('green') ? '#10B981' : feature.color.includes('orange') ? '#F59E0B' : feature.color.includes('yellow') ? '#EAB308' : '#6366F1'} 90deg, transparent 180deg, transparent 270deg, ${feature.color.includes('purple') ? '#6D72CF' : feature.color.includes('blue') ? '#3B82F6' : feature.color.includes('green') ? '#10B981' : feature.color.includes('orange') ? '#F59E0B' : feature.color.includes('yellow') ? '#EAB308' : '#6366F1'} 360deg)`,
                      padding: '1px',
                      mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      maskComposite: 'subtract'
                    }}
                  />
                  <feature.icon className="w-6 h-6 text-white relative z-10" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      

      {/* Final CTA Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-[#6D72CF]/20 to-purple-600/20 backdrop-blur-sm rounded-3xl p-8 border border-white/10"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Restaurant?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of restaurants already using Fatoorty
            </p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 0 40px rgba(109, 114, 207, 0.6)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/restaurant/login'}
                className="group px-8 py-4 bg-gradient-to-r from-[#6D72CF] to-purple-600 text-white font-semibold rounded-2xl transition-all duration-300"
              >
                <div className="flex items-center justify-center gap-3">
                  <Sparkles className="w-5 h-5" />
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Floating Elements */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ 
            y: [0, -30, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 4 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2
          }}
          className="absolute w-1 h-1 bg-gradient-to-r from-[#6D72CF] to-purple-400 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}

      {/* Server Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="fixed bottom-6 left-6 z-20 text-sm text-gray-400 bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/10"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span>Server: localhost:5000</span>
        </div>
      </motion.div>
    </div>
  );
}