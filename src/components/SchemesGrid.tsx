import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Landmark, ArrowRight, Loader2 } from 'lucide-react';

const tabs = [
  "All Schemes", 
  "Central Schemes", 
  "State Schemes", 
  "Financial Support", 
  "Insurance", 
  "Technology", 
  "Organic Farming", 
  "Women Farmers", 
  "Young Farmers", 
  "State", 
  "Crop", 
  "Ministry", 
  "Application Mode"
];

export function SchemesGrid() {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchemes = async () => {
      setLoading(true);
      try {
        let url = 'http://localhost:8020/api/government-schemes';
        if (activeTab !== "All Schemes") {
          // Clean up the query a bit if needed (e.g. "Central Schemes" -> "Central Scheme")
          let query = activeTab.replace(' Schemes', ' Scheme');
          url = `http://localhost:8020/api/government-schemes/search?q=${encodeURIComponent(query)}`;
        }

        const res = await fetch(url);
        const json = await res.json();
        
        if (json.success && json.data) {
          setSchemes(json.data);
        } else {
          setSchemes([]);
        }
      } catch (err) {
        console.error("Failed to fetch schemes:", err);
        setSchemes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, [activeTab]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Popular Government Schemes</h3>
        
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {tabs.map((tab, i) => (
            <button 
              key={i} 
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm ${activeTab === tab ? 'bg-[#4ade80] text-[#0a1f12]' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20 w-full">
          <Loader2 className="w-10 h-10 text-[#4ade80] animate-spin" />
        </div>
      ) : schemes.length === 0 ? (
        <div className="text-center text-gray-500 py-10 w-full font-semibold">
          No schemes found for the selected filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schemes.map((scheme, i) => (
            <motion.div 
              key={scheme.id || i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col transition-all hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#f4fbe9] text-[#4ade80] flex items-center justify-center mb-6">
                <Landmark className="w-6 h-6" />
              </div>
              
              <h4 className="text-xl font-bold text-gray-900 mb-3">{scheme.name || scheme.title}</h4>
              <p className="text-gray-600 text-[15px] leading-relaxed mb-6 flex-grow">
                {scheme.shortDescription || scheme.description}
              </p>
              
              <div className="flex flex-wrap items-center gap-2 mb-8">
                {(scheme.schemeType || scheme.tags || []).slice(0, 3).map((tag: string, j: number) => (
                  <span key={j} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold">
                    {tag}
                  </span>
                ))}
              </div>

              <a 
                href={scheme.officialWebsite || scheme.link || '#'} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 text-[#4ade80] font-bold hover:text-[#0a1f12] transition-colors self-start mt-auto"
              >
                View Details <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          ))}
        </div>
      )}

      <button className="mt-4 w-full py-5 rounded-2xl border border-gray-200 bg-white text-gray-900 font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-sm">
        View All Schemes <ArrowRight className="w-5 h-5" />
      </button>

    </div>
  );
}
