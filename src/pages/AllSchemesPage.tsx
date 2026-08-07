import { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { AllSchemesCard } from '../components/AllSchemesCard';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_FILTERS = [
  "Central Scheme",
  "State Scheme",
  "Insurance",
  "Financial",
  "Technology",
  "Organic Farming",
  "Women Farmers",
  "Young Farmers",
];

const BASE_URL = 'http://localhost:8020/api/government-schemes';

export default function AllSchemesPage() {
  const [schemes, setSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedMinistry, setSelectedMinistry] = useState<string>('');

  const [sortBy, setSortBy] = useState('lastUpdated');
  const [sortOrder, setSortOrder] = useState('desc');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  const buildUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', '12');

    if (searchQuery.trim().length > 0) {
      params.set('q', searchQuery.trim());
      if (activeCategory) params.set('schemeType', activeCategory);
      if (selectedState) params.set('state', selectedState);
      return BASE_URL + '/search?' + params.toString();
    }

    if (activeCategory) params.set('schemeType', activeCategory);
    if (selectedState) params.set('state', selectedState);
    if (selectedMinistry) params.set('ministry', selectedMinistry);
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);

    return BASE_URL + '?' + params.toString();
  }, [searchQuery, activeCategory, selectedState, selectedMinistry, sortBy, sortOrder, page]);

  const fetchSchemes = useCallback(async () => {
    setLoading(true);
    try {
      const url = buildUrl();
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setSchemes(json.data || []);
        if (json.meta) {
          setTotalPages(json.meta.totalPages ?? 1);
          setTotalRecords(json.meta.total ?? 0);
        }
      } else {
        setSchemes([]);
      }
    } catch (err) {
      console.error('Failed to fetch schemes:', err);
      setSchemes([]);
    } finally {
      setLoading(false);
    }
  }, [buildUrl]);

  // Debounce search/filter changes and reset to page 1
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, activeCategory, selectedState, selectedMinistry, sortBy, sortOrder]);

  // Fetch whenever page or buildUrl changes
  useEffect(() => {
    fetchSchemes();
  }, [fetchSchemes]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'newest') { setSortBy('lastUpdated'); setSortOrder('desc'); }
    else if (val === 'oldest') { setSortBy('lastUpdated'); setSortOrder('asc'); }
    else if (val === 'alpha_asc') { setSortBy('name'); setSortOrder('asc'); }
    else if (val === 'alpha_desc') { setSortBy('name'); setSortOrder('desc'); }
  };

  const clearAllFilters = () => {
    setActiveCategory(null);
    setSelectedState('');
    setSelectedMinistry('');
    setSearchQuery('');
  };

  const hasActiveFilters = activeCategory || selectedState || selectedMinistry || searchQuery;

  return (
    <div className="min-h-screen bg-gray-50/40 font-sans flex flex-col">
      <Navbar />

      {/* Hero */}
      <div className="pt-32 pb-14 px-6 bg-white border-b border-gray-100">
        <div className="max-w-[1500px] mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl lg:text-5xl font-bold text-gray-900 mb-5 tracking-tight"
          >
            Government Schemes <span style={{ color: '#4ade80' }}>Directory</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Browse, search, and filter all available agricultural government schemes.
            Find the exact support you need for your farming journey.
          </motion.p>
        </div>
      </div>

      <main className="flex-grow max-w-[1500px] mx-auto w-full px-4 lg:px-6 py-10 flex flex-col lg:flex-row gap-8">

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-600">{totalRecords} schemes found</p>
          <button
            onClick={() => setShowFilters(true)}
            className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>

        {/* Sidebar Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              key="filter-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 lg:hidden"
              onClick={() => setShowFilters(false)}
            />
          )}
        </AnimatePresence>

        <aside className={`
          fixed top-0 left-0 z-50 h-screen overflow-y-auto w-[300px] p-6 bg-white shadow-2xl transition-transform duration-300
          lg:static lg:h-auto lg:w-[280px] lg:flex-shrink-0 lg:bg-transparent lg:shadow-none lg:p-0 lg:block lg:translate-x-0
          ${showFilters ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex items-center justify-between lg:hidden mb-8">
            <h2 className="text-xl font-bold text-gray-900">Filters</h2>
            <button onClick={() => setShowFilters(false)} className="p-2 bg-gray-100 rounded-full text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:sticky lg:top-28">
            <div className="flex items-center gap-2 mb-6 text-gray-900 font-bold text-lg">
              <SlidersHorizontal className="w-5 h-5 text-green-500" /> Filters
            </div>

            {/* Categories */}
            <div className="mb-8">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Category</h4>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left ${!activeCategory ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  All Categories
                </button>
                {CATEGORY_FILTERS.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left ${activeCategory === cat ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* State */}
            <div className="mb-8">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">State</h4>
              <select
                value={selectedState}
                onChange={e => setSelectedState(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-green-400 transition-all"
              >
                <option value="">All States</option>
                <option value="All India">All India</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Punjab">Punjab</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Telangana">Telangana</option>
              </select>
            </div>

            {/* Ministry */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Ministry</h4>
              <select
                value={selectedMinistry}
                onChange={e => setSelectedMinistry(e.target.value)}
                disabled={searchQuery.length > 0}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-green-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <option value="">All Ministries</option>
                <option value="Ministry of Agriculture">Ministry of Agriculture</option>
                <option value="Ministry of Rural Development">Rural Development</option>
                <option value="Ministry of Finance">Ministry of Finance</option>
                <option value="Ministry of Jal Shakti">Ministry of Jal Shakti</option>
                <option value="Ministry of Commerce">Ministry of Commerce</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="w-full py-2.5 bg-red-50 text-red-600 font-bold rounded-xl text-sm hover:bg-red-100 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">

          {/* Search + Sort Bar */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-0 overflow-hidden focus-within:border-green-400 transition-all">
            <div className="flex flex-1 items-center gap-3 px-5 py-4">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search by name, crop, ministry, keywords..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 text-base"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="h-px sm:h-auto sm:w-px bg-gray-100" />
            <div className="flex items-center gap-2 px-5 py-4 bg-gray-50/50">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Sort:</span>
              <select
                onChange={handleSortChange}
                disabled={searchQuery.length > 0}
                className="bg-transparent border-none outline-none text-sm font-semibold text-gray-800 cursor-pointer disabled:opacity-50"
              >
                {searchQuery.length > 0 ? (
                  <option value="relevance">Most Relevant</option>
                ) : (
                  <>
                    <option value="newest">Recently Updated</option>
                    <option value="alpha_asc">Alphabetical (A–Z)</option>
                    <option value="alpha_desc">Alphabetical (Z–A)</option>
                    <option value="oldest">Oldest First</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Results count */}
          {!loading && (
            <p className="text-sm font-medium text-gray-500">
              Showing <strong className="text-gray-900">{schemes.length > 0 ? (page - 1) * 12 + 1 : 0}</strong>–
              <strong className="text-gray-900">{Math.min(page * 12, totalRecords)}</strong> of{' '}
              <strong className="text-gray-900">{totalRecords}</strong> schemes
            </p>
          )}

          {/* Cards */}
          {loading ? (
            <div className="flex flex-col justify-center items-center py-32">
              <Loader2 className="w-12 h-12 text-green-400 animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Fetching schemes...</p>
            </div>
          ) : schemes.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Schemes Found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                Try adjusting your search or clearing some filters to see more results.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {schemes.map((scheme, index) => (
                <AllSchemesCard key={scheme.id || index} scheme={scheme} index={index} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8 pt-8 border-t border-gray-200">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-3 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1.5 mx-2">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  const isNearCurrent = pageNum >= page - 1 && pageNum <= page + 1;
                  const isEdge = pageNum === 1 || pageNum === totalPages;
                  const isEllipsis = !isNearCurrent && !isEdge && (pageNum === page - 2 || pageNum === page + 2);

                  if (isEllipsis) {
                    return <span key={pageNum} className="text-gray-400 font-bold px-1">…</span>;
                  }

                  if (!isNearCurrent && !isEdge) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors ${
                        page === pageNum
                          ? 'bg-green-400 text-white shadow-sm'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-3 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
