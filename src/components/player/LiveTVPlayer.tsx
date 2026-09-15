import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  AlertCircle,
  Loader2,
  Tv,
  Zap,
  Wifi,
} from 'lucide-react';
import { Station } from '../../types';
import { trackEvent } from '../../services/api';

interface LiveTVPlayerProps {
  station: Station;
  className?: string;
  autoPlay?: boolean;
}

export const LiveTVPlayer: React.FC<LiveTVPlayerProps> = ({
  station,
  className = '',
  autoPlay = false,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const retryCountRef = useRef<number>(0);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [volume, setVolumeState] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(true); // Start muted for smooth browser autoplay policy
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [dataSaver, setDataSaver] = useState<boolean>(true); // Default data saver enabled
  const controlsTimeoutRef = useRef<any>(null);

  const loadStream = () => {
    const video = videoRef.current;
    if (!video) return;

    setIsLoading(true);
    setIsBuffering(false);
    setError(null);
    retryCountRef.current = 0;

    // Destroy existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const streamUrl = station.stream_url;

    if (Hls.isSupported()) {
      // Optimized HLS configuration: Low Data Consumption & Resilient Reconnection
      const hls = new Hls({
        enableWorker: true,
        // Critical: lowLatencyMode = false prevents buffer underrun timeouts on 1080p chunks
        lowLatencyMode: false,
        // Data Saver optimizations: keep minimal forward buffer (8-12s instead of 60s+)
        maxBufferLength: dataSaver ? 8 : 12,
        maxMaxBufferLength: dataSaver ? 14 : 20,
        // Limit max buffer memory strictly (3MB in data saver, prevents runaway background loading)
        maxBufferSize: dataSaver ? 3 * 1024 * 1024 : 6 * 1024 * 1024,
        backBufferLength: 0, // Immediately purge played segments to save bandwidth & memory
        maxBufferHole: 0.5,
        highBufferWatchdogPeriod: 2,
        // Generous network timeouts to prevent premature "Network Error" on mobile/slower Wi-Fi
        manifestLoadingTimeOut: 25000,
        manifestLoadingMaxRetry: 8,
        manifestLoadingRetryDelay: 1000,
        fragLoadingTimeOut: 30000,
        fragLoadingMaxRetry: 10,
        fragLoadingRetryDelay: 1500,
        levelLoadingTimeOut: 25000,
        levelLoadingMaxRetry: 8,
        levelLoadingRetryDelay: 1000,
      });

      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        setIsBuffering(false);
        setError(null);
        if (autoPlay) {
          video.play().catch(() => {
            setIsPlaying(false);
          });
        }
      });

      // Resilient Error Handling & Self-Healing
      hls.on(Hls.Events.ERROR, (_event, data) => {
        console.warn('HLS stream event:', data.type, data.details);

        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              if (retryCountRef.current < 5) {
                retryCountRef.current += 1;
                console.log(`Auto-recovering from network error (attempt ${retryCountRef.current}/5)...`);
                setIsBuffering(true);
                setTimeout(() => {
                  hls.startLoad();
                }, 1000);
              } else {
                hls.destroy();
                setError('Live stream connection momentarily interrupted. Click retry to reconnect.');
                setIsLoading(false);
                setIsPlaying(false);
              }
              break;

            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Recovering from media glitch...');
              hls.recoverMediaError();
              break;

            default:
              hls.destroy();
              setError('Live TV stream connection reset. Click retry.');
              setIsLoading(false);
              setIsPlaying(false);
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Safari HLS
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        if (autoPlay) {
          video.play().catch(() => {});
        }
      });
      video.addEventListener('error', () => {
        setIsLoading(false);
        setIsPlaying(false);
        setError('Live TV broadcast stream is currently offline.');
      });
    } else {
      setError('HLS playback is not supported by your web browser.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStream();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [station.stream_url, dataSaver]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      if (error) {
        loadStream();
      } else {
        video.play().then(() => {
          trackEvent({
            event_type: 'TV_PLAY',
            station_id: station.id,
          });
        }).catch(() => {
          // Autoplay policy prevented unmuted playback
          video.muted = true;
          setIsMuted(true);
          video.play();
        });
      }
    }
  };

  const handleVolumeChange = (newVol: number) => {
    const video = videoRef.current;
    if (!video) return;
    const clamped = Math.max(0, Math.min(1, newVol));
    video.volume = clamped;
    setVolumeState(clamped);
    if (clamped > 0 && isMuted) {
      video.muted = false;
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMute = !isMuted;
    video.muted = nextMute;
    setIsMuted(nextMute);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3500);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={`relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl group select-none ${className}`}
    >
      <video
        ref={videoRef}
        playsInline
        muted={isMuted}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => {
          setIsPlaying(true);
          setIsBuffering(false);
          setIsLoading(false);
          setError(null);
        }}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
      />

      {/* Top Banner (Station Name + Live Badge + Data Saver Indicator) */}
      <div
        className={`absolute top-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-b from-black/85 via-black/35 to-transparent flex items-center justify-between transition-opacity duration-300 pointer-events-none ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-600 text-white text-[11px] font-black tracking-wider uppercase shadow-md">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            Live
          </span>
          <h3 className="text-white font-bold text-sm sm:text-base drop-shadow-md flex items-center gap-1.5">
            <Tv className="w-4 h-4 text-rba-blue" />
            {station.name}
          </h3>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Data Saver Mode Toggle Pill */}
          <button
            onClick={() => setDataSaver(!dataSaver)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all backdrop-blur-sm ${
              dataSaver
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-white/10 text-slate-300 border border-white/10 hover:bg-white/20'
            }`}
            title={dataSaver ? 'Data Saver is Active: Buffer limited to save mobile data' : 'Click to enable Data Saver'}
          >
            <Zap className={`w-3 h-3 ${dataSaver ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span>{dataSaver ? 'Data Saver ON' : 'Data Saver'}</span>
          </button>
        </div>
      </div>

      {/* Loading / Buffering Overlay */}
      {(isLoading || isBuffering) && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[1px] pointer-events-none">
          <Loader2 className="w-10 h-10 text-rba-blue animate-spin mb-2" />
          <p className="text-white text-xs sm:text-sm font-semibold tracking-wide">
            {isBuffering ? 'Optimizing live buffer...' : 'Connecting to live broadcast...'}
          </p>
        </div>
      )}

      {/* Error & Reconnect Overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 p-6 text-center z-30">
          <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
          <h4 className="text-white font-bold text-base mb-1">Live Broadcast Connection Stalled</h4>
          <p className="text-slate-300 text-xs max-w-sm mb-5">{error}</p>
          <button
            onClick={loadStream}
            className="px-5 py-2.5 rounded-xl bg-rba-yellow hover:bg-amber-400 text-rba-dark font-bold text-xs flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
          >
            <RotateCcw className="w-4 h-4" /> Reconnect Live TV
          </button>
        </div>
      )}

      {/* Center Big Play Button when paused */}
      {!isPlaying && !isLoading && !error && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-rba-blue/90 hover:bg-rba-blue text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95 z-20"
          aria-label="Play Live TV"
        >
          <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current ml-1" />
        </button>
      )}

      {/* Unmute prompt banner if muted and playing */}
      {isPlaying && isMuted && (
        <button
          onClick={toggleMute}
          className="absolute top-16 left-4 z-20 px-3 py-1.5 rounded-lg bg-black/75 hover:bg-black/90 border border-white/20 text-white text-xs font-semibold flex items-center gap-2 shadow-lg backdrop-blur-sm transition-all"
        >
          <VolumeX className="w-4 h-4 text-rba-yellow" />
          Tap to Unmute Audio
        </button>
      )}

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between transition-opacity duration-300 z-20 ${
          showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="p-2 rounded-lg text-white hover:bg-white/20 transition-colors"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="p-2 rounded-lg text-white hover:bg-white/20 transition-colors"
              aria-label="Toggle mute"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5 text-rba-yellow" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-16 sm:w-24 h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-rba-blue"
              aria-label="Volume"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg text-white hover:bg-white/20 transition-colors"
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
