import { FlaskConical, Leaf, Activity, Thermometer, CloudRain, CloudDrizzle, Sparkles, Loader2 } from 'lucide-react';
import { useState } from 'react';

export function PredictionFormCard({ onSubmit, isLoading }: { onSubmit?: (data: any) => void, isLoading?: boolean }) {
  const [features, setFeatures] = useState({
    ph: '',
    N: '',
    P: '',
    K: '',
    temperature: '',
    humidity: '',
    rainfall: ''
  });

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit({
        ph: Number(features.ph),
        N: Number(features.N),
        P: Number(features.P),
        K: Number(features.K),
        temperature: Number(features.temperature),
        humidity: Number(features.humidity),
        rainfall: Number(features.rainfall),
      });
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center font-bold text-lg shadow-sm">
          1
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Your Farm &amp; Soil Details</h2>
          <p className="text-gray-500 text-sm">Fill in the details below to get accurate prediction</p>
        </div>
      </div>

      {/* Row 1: pH, Nitrogen, Phosphorus */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-4">
        <InputField icon={<FlaskConical className="w-7 h-7 text-brand" />} label="pH Level" placeholder="Enter pH value" value={features.ph} onChange={(v) => setFeatures({...features, ph: v})} />
        <InputField icon={<Leaf className="w-7 h-7 text-brand" />} label="Nitrogen (N)" placeholder="kg/ha" value={features.N} onChange={(v) => setFeatures({...features, N: v})} />
        <InputField icon={<FlaskConical className="w-7 h-7 text-brand" />} label="Phosphorus (P)" placeholder="kg/ha" value={features.P} onChange={(v) => setFeatures({...features, P: v})} />
      </div>

      {/* Row 2: Potassium, Temperature, Humidity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-4">
        <InputField icon={<Activity className="w-7 h-7 text-brand" />} label="Potassium (K)" placeholder="kg/ha" value={features.K} onChange={(v) => setFeatures({...features, K: v})} />
        <InputField icon={<Thermometer className="w-7 h-7 text-orange-500" />} label="Temperature" placeholder="°C" value={features.temperature} onChange={(v) => setFeatures({...features, temperature: v})} />
        <InputField icon={<CloudRain className="w-7 h-7 text-blue-400" />} label="Humidity" placeholder="%" value={features.humidity} onChange={(v) => setFeatures({...features, humidity: v})} />
      </div>

      {/* Row 3: Rainfall — full width spanning all 3 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        <div className="sm:col-span-2 xl:col-span-3">
          <InputField icon={<CloudDrizzle className="w-7 h-7 text-blue-500" />} label="Rainfall" placeholder="mm" value={features.rainfall} onChange={(v) => setFeatures({...features, rainfall: v})} />
        </div>
      </div>

      <button 
        onClick={handleSubmit}
        disabled={isLoading}
        className={`w-full bg-gradient-to-r from-[#1a5f3a] to-[#24814f] hover:from-[#134E36] hover:to-[#1a5f3a] text-white font-bold text-lg py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mb-4 ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}`}
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />} 
        {isLoading ? 'Predicting...' : 'Predict Best Crop'}
      </button>

      <p className="text-center text-gray-500 text-sm font-medium">
        Our AI will analyze your soil &amp; weather inputs to predict the best crop
      </p>
    </div>
  );
}

function InputField({ icon, label, placeholder, value, onChange }: { icon: React.ReactNode, label: string, placeholder: string, value?: string, onChange?: (val: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border border-gray-200 bg-gray-50 hover:border-gray-300 transition-colors text-center min-h-[120px]">
      <div className="flex items-center justify-center text-gray-400">
        {icon}
      </div>
      <div className="flex flex-col items-center w-full">
        <span className="text-sm font-bold text-gray-900 mb-1">{label}</span>
        <input
          type="number"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="bg-transparent text-sm text-gray-500 placeholder-gray-400 focus:outline-none w-full text-center"
        />
      </div>
    </div>
  );
}
