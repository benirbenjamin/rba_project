import React, { useEffect, useState } from 'react';
import { Play, Tv, Radio, Sparkles, ChevronRight, Volume2, TrendingUp, Flame } from 'lucide-react';
import { Station, Video } from '../types';
import { getStations, getVideos } from '../services/api';
import { LiveTVPlayer } from '../components/player/LiveTVPlayer';
import { RadioSlider } from '../components/radio/RadioSlider';
import { StationCard } from '../components/radio/StationCard';
import { VideoCard } from '../components/video/VideoCard';
import { SEO } from '../components/common/SEO';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedTvStation, setSelectedTvStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [stationsData, videosData] = await Promise.all([
          getStations(),
          getVideos({ limit: 8 }),
        ]);

        setStations(stationsData);
        setVideos(videosData.data || []);

        const tvStations = stationsData.filter((s) => s.station_type === 'TV' && s.is_active);
        if (tvStations.length > 0) {
          // Default to RTV Live
          const rtv = tvStations.find((s) => s.slug === 'rtv') || tvStations[0];
          setSelectedTvStation(rtv);
        }
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const tvStations = stations.filter((s) => s.station_type === 'TV' && s.is_active);
  const radioStations = stations.filter((s) => s.station_type === 'RADIO' && s.is_active);

  const latestVideos = videos.slice(0, 4);
  const mostWatched = [...videos].sort((a, b) => b.views_count - a.views_count).slice(0, 4);

  return (
    <div className="min-h-screen bg-rba-grayBg">
      <SEO title="RTV Live & Radio Rwanda Streaming" />

      {/* Hero Section: Live TV & Channels Switcher */}
      <section className="bg-gradient-to-b from-rba-navy to-rba-navyLight text-white pt-6 pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Channel Selector Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-black uppercase tracking-widest text-red-400">
                  National Television Network
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                {selectedTvStation?.name || 'RTV LIVE'}
              </h1>
            </div>

            {/* TV Channel Switcher Tabs (RTV / KC2) */}
            {tvStations.length > 1 && (
              <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10 backdrop-blur-sm self-start sm:self-auto">
                {tvStations.map((tv) => (
                  <button
                    key={tv.id}
                    onClick={() => setSelectedTvStation(tv)}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                      selectedTvStation?.id === tv.id
                        ? 'bg-rba-blue text-white shadow-md'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Tv className="w-3.5 h-3.5" />
                    <span>{tv.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Hero Player & Right Live Schedule / Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Live TV Player Container */}
            <div className="lg:col-span-8 xl:col-span-9">
              {selectedTvStation ? (
                <LiveTVPlayer station={selectedTvStation} autoPlay={false} />
              ) : (
                <div className="aspect-video bg-black/50 rounded-2xl flex items-center justify-center text-slate-400 text-sm">
                  Loading Live TV Stream...
                </div>
              )}
            </div>

            {/* Sidebar Highlights */}
            <div className="lg:col-span-4 xl:col-span-3 space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-rba-yellow flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Live Now
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white uppercase">
                    On Air
                  </span>
                </div>
                <h3 className="font-extrabold text-white text-base mb-1">
                  {selectedTvStation?.name} Broadcast
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedTvStation?.description}
                </p>
              </div>

              {/* Radio Quick Banner */}
              <div className="bg-gradient-to-br from-amber-500/20 to-rba-blue/20 border border-amber-500/30 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-rba-yellow text-xs font-bold mb-2">
                  <Radio className="w-4 h-4" />
                  <span>Radio Rwanda • 100.7 FM</span>
                </div>
                <h4 className="font-bold text-white text-sm mb-2">
                  Listen to national and regional community radio stations
                </h4>
                <Link
                  to="/radio"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-rba-yellow hover:underline"
                >
                  Explore All 8+ Radio Stations <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-14">
        
        {/* Horizontal Radio Slider Carousel */}
        <section>
          <RadioSlider stations={stations} />
        </section>

        {/* Latest RTV Videos Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-rba-blue/10 text-rba-blue">
                <Tv className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Latest RTV Videos</h2>
                <p className="text-xs text-slate-500">Official news reports, special coverage, and stories</p>
              </div>
            </div>

            <Link
              to="/tv"
              className="text-xs font-bold text-rba-blue hover:text-rba-navy flex items-center gap-1 transition-colors"
            >
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {latestVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </section>

        {/* Most Watched Section */}
        {mostWatched.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-red-50 text-red-600">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Trending & Most Watched</h2>
                  <p className="text-xs text-slate-500">Popular broadcasts this week on Rwanda Broadcasting Agency</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {mostWatched.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </section>
        )}

        {/* All Radio Stations Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Official Radio Stations</h2>
                <p className="text-xs text-slate-500">Tune in live from Kigali, Rubavu, Musanze, Huye, Rusizi, Nyagatare</p>
              </div>
            </div>

            <Link
              to="/radio"
              className="text-xs font-bold text-rba-blue hover:text-rba-navy flex items-center gap-1 transition-colors"
            >
              Full Radio Guide <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {radioStations.map((station) => (
              <StationCard key={station.id} station={station} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};
