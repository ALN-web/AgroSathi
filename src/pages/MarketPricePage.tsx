import { Navbar } from '../components/Navbar';
import { MarketHero } from '../components/MarketHero';
import { MarketFormCard } from '../components/MarketFormCard';
import { MarketResultsCenter } from '../components/MarketResultsCenter';
import { MarketSidebar } from '../components/MarketSidebar';
import { MarketBottomSections } from '../components/MarketBottomSections';
import { Footer } from '../components/Footer';
import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function MarketPricePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans overflow-x-hidden">
      <Navbar />
      <MarketHero />
      
      {/* Overlapping Main Container */}
      <section className="relative z-30 -mt-24 px-6 mb-12">
        <div className="max-w-[1600px] mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
            
            {/* Left side: Form (3/12) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-3"
            >
              <MarketFormCard />
            </motion.div>
            
            {/* Center: Results & Chart (6/12) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-6"
            >
              <MarketResultsCenter />
            </motion.div>

            {/* Right: Sidebar (3/12) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-3"
            >
              <MarketSidebar />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <MarketBottomSections />
          </motion.div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
