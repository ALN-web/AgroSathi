import { CheckCircle2, Clock, Droplet, Sun, Layers } from 'lucide-react';

export function PredictionResultsCard({ result }: { result?: any }) {
  const prediction = result?.prediction;
  const analysis = result?.analysis;

  const confidence = prediction ? prediction.accuracy.toFixed(2) : '98.74';
  const cropName = prediction ? prediction.crop : 'Paddy (Rice)';

  // Metadata fields — mapped to the UI cards
  const seasonVal = result?.metadata?.season || 'Kharif';
  const categoryVal = result?.metadata?.category || 'Cereal';
  const durationVal = result?.metadata?.growthDuration
    ? `${result.metadata.growthDuration.minDays} - ${result.metadata.growthDuration.maxDays} Days`
    : '120 - 135 Days';
  const waterVal = result?.metadata?.waterRequirement
    ? `${result.metadata.waterRequirement.min} - ${result.metadata.waterRequirement.max} ${result.metadata.waterRequirement.unit}`
    : '1200 - 1500 mm';

  // Analysis fields — fall back to defaults if Gemini is unavailable
  const whyThisCrop = analysis?.whyThisCrop || 'This crop is highly suitable for your soil and environmental conditions.';
  const practices = analysis?.recommendedPractices || [
    'Use organic fertilizers for better yield',
    'Maintain 2-3 cm water level in field',
    'Sow certified seeds for best results',
    'Regular weed and pest management',
  ];
  const soilInfo = analysis?.soilSuitability || 'Soil pH is ideal for cultivation';
  const fertilizer = analysis?.fertilizerRecommendation;

  return (
    <div className="bg-[#f4fbe9] rounded-3xl p-8 border border-[#e2f3d8] h-full flex flex-col relative overflow-hidden">

      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center font-bold text-lg shadow-sm">
            2
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Prediction Results</h2>
            <p className="text-gray-500 text-sm">Based on your input data analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm">
          <span className="text-gray-500 text-sm font-medium">Prediction Confidence</span>
          <div className="text-brand font-bold text-sm">
            {confidence}%
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6 relative z-10 flex flex-col xl:flex-row gap-6 items-center">
        <div className="flex-1 w-full">
          <span className="text-gray-500 text-sm font-medium mb-1 block">Recommended Crop</span>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <h3 className="text-3xl font-bold text-brand">{cropName}</h3>
            <span className="px-3 py-1 bg-[#f4fbe9] text-brand border border-[#e2f3d8] rounded-lg text-xs font-bold">
              {result?.metadata?.geminiVersion ? 'AI Enriched' : 'Kharif Season'}
            </span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            {whyThisCrop}
          </p>
        </div>
        <div className="w-full xl:w-48 h-32 rounded-xl overflow-hidden flex-shrink-0 shadow-inner">
          <img src="/images/crop_prediction.png" alt="Paddy Field" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 relative z-10">
        <StatCard icon={<Sun className="w-5 h-5" />} title="Season" value={seasonVal} unit="" />
        <StatCard icon={<Layers className="w-5 h-5" />} title="Category" value={categoryVal} unit="" />
        <StatCard icon={<Clock className="w-5 h-5" />} title="Growth Duration" value={durationVal} unit="" />
        <StatCard icon={<Droplet className="w-5 h-5" />} title="Water Requirement" value={waterVal} unit="" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 relative z-10">
        <div>
          <h4 className="font-bold text-gray-900 mb-4">Soil &amp; Fertilizer</h4>
          <ul className="space-y-3">
            <ListItem text={soilInfo} />
            {fertilizer && (
              Array.isArray(fertilizer)
                ? fertilizer.map((f: string, i: number) => <ListItem key={i} text={f} />)
                : <ListItem text={fertilizer} />
            )}
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-gray-900 mb-4">Recommended Practices</h4>
          <ul className="space-y-3">
            {practices.map((p: string, i: number) => (
              <ListItem key={i} text={p} />
            ))}
          </ul>
        </div>
      </div>

    </div>
  );
}

function StatCard({ icon, title, value, unit }: { icon: React.ReactNode, title: string, value: string, unit: string }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col">
      <div className="w-8 h-8 rounded-full bg-[#f4fbe9] text-brand flex items-center justify-center mb-3">
        {icon}
      </div>
      <span className="text-gray-500 text-xs font-semibold mb-1">{title}</span>
      <span className="text-gray-900 font-bold text-lg leading-tight">{value}</span>
      <span className="text-gray-400 text-[11px] font-medium">{unit}</span>
    </div>
  );
}

function ListItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2">
      <CheckCircle2 className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
      <span className="text-gray-600 text-sm">{text}</span>
    </li>
  );
}
