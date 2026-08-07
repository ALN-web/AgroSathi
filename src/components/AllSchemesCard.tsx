import { motion } from 'framer-motion';
import { Landmark, ArrowRight, ExternalLink, CheckCircle, HelpCircle, XCircle } from 'lucide-react';

interface AllSchemesCardProps {
  scheme: any;
  index: number;
}

export function AllSchemesCard({ scheme, index }: AllSchemesCardProps) {
  // Determine badge color based on status if available
  const renderEligibilityBadge = (status?: string) => {
    if (!status) return null;
    
    let colorClass = '';
    let Icon = HelpCircle;

    if (status === 'Eligible') {
      colorClass = 'bg-emerald-100 text-emerald-700 border-emerald-200';
      Icon = CheckCircle;
    } else if (status === 'Possibly Eligible') {
      colorClass = 'bg-amber-100 text-amber-700 border-amber-200';
      Icon = HelpCircle;
    } else if (status === 'Not Eligible') {
      colorClass = 'bg-red-100 text-red-700 border-red-200';
      Icon = XCircle;
    }

    return (
      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${colorClass} mb-4 self-start`}>
        <Icon className="w-3.5 h-3.5" />
        {status}
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index % 12) * 0.05, duration: 0.4 }}
      className="bg-white rounded-3xl p-6 lg:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col transition-all hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 h-full relative overflow-hidden"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-[#f4fbe9] text-[#4ade80] flex items-center justify-center flex-shrink-0">
          <Landmark className="w-6 h-6" />
        </div>
        {renderEligibilityBadge(scheme.eligibilityStatus)}
      </div>
      
      <h4 className="text-xl font-bold text-gray-900 mb-2 leading-snug line-clamp-2">{scheme.name || scheme.title}</h4>
      
      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
        {scheme.shortDescription || scheme.description}
      </p>
      
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {(scheme.schemeType || scheme.tags || []).slice(0, 3).map((tag: string, j: number) => (
          <span key={j} className="px-2.5 py-1 bg-gray-50 border border-gray-100 text-gray-600 rounded-lg text-xs font-semibold">
            {tag}
          </span>
        ))}
      </div>

      {/* Expanded Details Section */}
      <div className="flex flex-col gap-3 mb-6 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex-grow">
        {scheme.ministry && (
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Ministry</span>
            <span className="text-sm font-medium text-gray-800 line-clamp-1">{scheme.ministry}</span>
          </div>
        )}
        
        {scheme.state && (
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">State</span>
            <span className="text-sm font-medium text-gray-800">{scheme.state}</span>
          </div>
        )}

        {(scheme.benefits && scheme.benefits.length > 0) && (
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Key Benefit</span>
            <span className="text-sm font-medium text-gray-800 line-clamp-2 text-emerald-700 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100/50">
              {scheme.benefits[0]}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 mt-auto pt-2">
        <a 
          href={scheme.officialWebsite || scheme.link || '#'} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex-1 bg-[#4ade80] text-[#0a1f12] py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#3bcf71] transition-colors shadow-sm text-sm"
        >
          Official Website <ExternalLink className="w-4 h-4" />
        </a>
        <button 
          className="flex-1 bg-white border-2 border-gray-100 text-gray-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:border-gray-200 hover:bg-gray-50 transition-colors text-sm"
        >
          Details <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
