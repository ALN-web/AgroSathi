import { Navbar } from '../components/Navbar';
import { PredictionHero } from '../components/PredictionHero';
import { PredictionFormCard } from '../components/PredictionFormCard';
import { PredictionResultsCard } from '../components/PredictionResultsCard';
import { PredictionAlternatives } from '../components/PredictionAlternatives';
import { PredictionFeaturesStrip } from '../components/PredictionFeaturesStrip';
import { Footer } from '../components/Footer';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function PredictionPage() {
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async (features: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8010/api/crop-prediction/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(features),
      });

      const data = await response.json();
      if (data.success) {
        setPredictionResult(data.data);
      } else {
        setError(data.error?.message || 'Prediction failed');
      }
    } catch (err) {
      setError('Failed to connect to the prediction server');
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans overflow-x-hidden">
      <Navbar />
      <PredictionHero />
      
      {/* Overlapping Main Container */}
      <section className="relative z-30 -mt-24 px-6 mb-12">
        <div className="max-w-[1500px] mx-auto bg-white rounded-[2rem] shadow-2xl p-6 lg:p-8 border border-gray-100">
          
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-12">
            {/* Left side: Form */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="xl:col-span-5"
            >
              <PredictionFormCard onSubmit={handlePredict} isLoading={isLoading} />
              {error && <p className="text-red-500 text-sm mt-4 text-center font-bold">{error}</p>}
            </motion.div>
            
            {/* Right side: Results */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="xl:col-span-7"
            >
              <PredictionResultsCard result={predictionResult} />
            </motion.div>
          </div>

          {/* Alternative Crops Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <PredictionAlternatives alternatives={predictionResult?.alternativeCrops} />
          </motion.div>

          <PredictionFeaturesStrip />

        </div>
      </section>

      <Footer />
    </div>
  );
}
