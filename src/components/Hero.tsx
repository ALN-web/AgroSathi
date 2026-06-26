import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useRef } from 'react';
import { Link } from 'react-router-dom';

export function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  // Parallax effect: move image slightly down and to the right on scroll
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "5%"]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1, y: 0,
      transition: { duration: 0.8 }
    }
  };

  return (
    <div ref={ref} className="relative min-h-[100vh] flex flex-col justify-center pt-32 pb-48 overflow-hidden">
      {/* Background Image with Parallax */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#1e3b20]">
        <motion.img 
          style={{ y, x }}
          initial={{ opacity: 0, scale: 1.15 }}
          animate={{ opacity: 1, scale: 1.1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          src="/images/hero_drone.png" 
          alt="Agriculture Drone" 
          className="w-full h-full object-cover origin-center object-[80%_center]"
        />
        {/* Top dark gradient for nav text visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-transparent h-3/4"></div>
        
        {/* Bottom white gradient mask to blend perfectly into next section */}
        <div className="absolute -bottom-1 left-0 right-0 h-[500px] bg-gradient-to-t from-white via-white/90 to-transparent z-10 pointer-events-none"></div>
        
        {/* AI Circuit Watermark */}
        <motion.img 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 0.6, x: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          src="/images/ai_circuit.png" 
          alt="" 
          className="absolute right-0 bottom-0 w-[400px] md:w-[500px] object-contain mix-blend-multiply z-10 pointer-events-none translate-y-1/4"
        />
      </div>

      <div className="relative z-20 max-w-[1200px] mx-auto px-6 w-full">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-[750px]"
        >
          <motion.h1 variants={itemVariants} className="text-[3.5rem] md:text-[5rem] font-bold text-white leading-[1.1] tracking-tight mb-6">
            India’s AI Farming <br/>
            Assistant For <br/>
            <span className="text-[#dcf573]">Smarter Agriculture</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-white/95 leading-relaxed mb-10 max-w-[500px] font-normal drop-shadow-md">
            AgroSathi uses AI and real-time insights to help farmers make the best decisions for higher yield, better profits, and sustainable farming.
          </motion.p>
          
          <motion.div variants={itemVariants}>
            <Link to="/predict" className="bg-[#dcf573] hover:bg-[#cde466] text-black font-medium text-lg px-8 py-4 rounded-2xl inline-flex items-center gap-3 transition-transform hover:scale-105 shadow-xl">
              Start Prediction
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
