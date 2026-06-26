import { Navbar } from '../components/Navbar';
import { LeftPanel } from '../components/LeftPanel';
import { PredictionForm } from '../components/PredictionForm';
import { OutputDashboard } from '../components/OutputDashboard';

export default function PredictionPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-brand-accent selection:text-brand-dark overflow-x-hidden">
      <Navbar />
      
      {/* Background layer for the split screen effect */}
      <div className="fixed inset-0 z-0 pointer-events-none flex">
        {/* Left Side Background */}
        <div className="w-full lg:w-[60%] h-[100vh] relative">
          <img src="/images/hero_drone.png" className="w-full h-full object-cover" alt="Farmland" />
          <div className="absolute inset-0 bg-[#0B2E1D]/90 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B2E1D] via-[#0B2E1D]/80 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent"></div>
        </div>
        {/* Right Side Background */}
        <div className="hidden lg:block w-[40%] h-full bg-gray-50"></div>
      </div>

      {/* Main Content Layout */}
      <div className="relative z-10 max-w-[1500px] mx-auto pt-32 px-6 lg:px-12 flex flex-col lg:flex-row gap-12 lg:gap-16 pb-32">
        {/* Left Column */}
        <div className="w-full lg:w-[50%] xl:w-[45%]">
          <LeftPanel />
        </div>

        {/* Right Column (Prediction Form & Output) */}
        <div className="w-full lg:w-[50%] xl:w-[55%] lg:mt-8 relative z-20 flex flex-col gap-12">
          <PredictionForm />
          
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-brand-accent to-brand blur-2xl opacity-10 rounded-[3rem]"></div>
            <OutputDashboard />
          </div>
        </div>
      </div>
    </div>
  );
}
