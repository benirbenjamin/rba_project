import React, { useEffect, useState } from 'react';
import { Tv, Sparkles, Filter, Search, Calendar, ChevronRight, Play } from 'lucide-react';
import { Station, Video, Category } from '../types';
import { getStations, getVideos, getCategories } from '../services/api';
import { LiveTVPlayer } from '../components/player/LiveTVPlayer';
import { VideoCard } from '../components/video/VideoCard';
import { SEO } from '../components/common/SEO';

export const TVPage: React.FC = () => {
  const [tvStations, setTvStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTVData = async () => {
      try {
        const [stationsData, categoriesData, videosData] = await Promise.all([
          getStations({ type: 'TV' }),
          getCategories(),
          getVideos({ limit: 24 }),
        ]);

        setTvStations(stationsData);
        if (stationsData.length > 0) {
          const rtv = stationsData.find((s) => s.slug === 'rtv') || stationsData[0];
          setSelectedStation(rtv);
        }
        setCategories(categoriesData);
        setVideos(videosData.data || []);
      } catch (err) {
        console.error('Failed to load TV page data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTVData();
  }, []);

  const filteredVideos = videos.filter((vid) => {
    const matchesSearch =
      vid.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vid.description && vid.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedCategory !== 'all') {
      return vid.category_slug === selectedCategory || vid.category_id === selectedCategory;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-rba-grayBg pb-20">
      <SEO
        title="RTV Live TV & Video Bulletins"
        description="Watch Rwanda Television (RTV) and KC2 live streaming, news bulletins, national reports, and special coverage."
      />

      {/* Hero TV Player Area */}
      <section className="bg-gradient-to-b from-rba-navy to-rba-navyLight text-white py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Header & Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-black uppercase tracking-wider text-red-400">
                  RBA Television Network
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {selectedStation?.name || 'RTV LIVE'}
              </h1>
            </div>

            {/* TV Channels Switcher */}
            {tvStations.length > 1 && (
              <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10 backdrop-blur-sm">
                {tvStations.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setSelectedStation(st)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      selectedStation?.id === st.id
                        ? 'bg-rba-blue text-white shadow-md'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Tv className="w-4 h-4" />
                    <span>{st.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Large Live TV Player */}
          <div className="max-w-5xl mx-auto">
            {selectedStation ? (
              <LiveTVPlayer station={selectedStation} autoPlay={false} />
            ) : (
              <div className="aspect-video bg-black/40 rounded-2xl flex items-center justify-center text-slate-400 text-sm">
                Loading RTV Live broadcast...
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Video Catalog Section (News, Rwanda, Sports, Entertainment) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        
        {/* Section Title & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Latest Videos & News</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Catch up on full news bulletins, presidential updates, and sports highlights
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search video titles..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rba-blue shadow-sm"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-rba-navy text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            All Videos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.slug
                  ? 'bg-rba-navy text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Videos Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-video rounded-2xl bg-white animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <Tv className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-extrabold text-slate-900 text-base">No videos found</h3>
            <p className="text-xs text-slate-500 mt-1">Try selecting another category or clear your search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
