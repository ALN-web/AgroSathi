

export function PredictionAlternatives({ alternatives }: { alternatives?: any[] }) {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Alternative Crop Suggestions</h3>
          <p className="text-gray-500 text-sm">Other crops that can also grow well in your field</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
          Based on Suitability Score 
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {alternatives && alternatives.length > 0 ? (
          alternatives.map((alt, idx) => (
            <AltCropCard 
              key={idx}
              name={alt.crop} 
              score={typeof alt.score === 'number' ? alt.score : parseInt(alt.score) || 0} 
              img={alt.image} 
            />
          ))
        ) : (
          <>
            <AltCropCard name="Maize" score={82} img="/images/service_crop.png" />
            <AltCropCard name="Groundnut" score={78} img="/images/service_soil.png" />
            <AltCropCard name="Soybean" score={75} img="/images/crop_prediction.png" />
            <AltCropCard name="Cotton" score={72} img="/images/service_drone.png" />
          </>
        )}
      </div>
    </div>
  );
}

function AltCropCard({ name, score, img }: { name: string, score: number, img: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-gray-100 flex gap-4 items-center">
      <div className="w-16 h-20 rounded-lg overflow-hidden flex-shrink-0">
        <img src={img} alt={name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-gray-900 text-sm truncate">{name}</h4>
          <div className="relative w-8 h-8 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-100"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="text-brand"
                strokeDasharray={`${score}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
            </svg>
            <span className="absolute text-[9px] font-bold text-gray-900">{score}%</span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-[10px]">
            <span className="text-gray-500">Suitability Score</span>
          </div>
        </div>
      </div>
    </div>
  );
}
