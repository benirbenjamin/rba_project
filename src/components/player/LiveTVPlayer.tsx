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
} from 'lucide-react';
import { Station } from '../../types';
import { usePlayer } from '../../context/PlayerContext';
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
  const { playTv, pauseTv, isTvPlaying, playStation } = usePlayer();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const bufferingTimerRef = useRef<any>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [volume, setVolumeState] = useState<number>(1);
  // Start unmuted as requested by user
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState<boolean>(true);
  const controlsTimeoutRef = useRef<any>(null);

  const loadStream = () => {
    const video = videoRef.current;
    if (!video) return;

    setIsLoading(true);
    setIsBuffering(false);
    setError(null);

    // Destroy existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const streamUrl = station.stream_url;

    if (Hls.isSupported()) {
      // High-efficiency HLS configuration matched to RTV Wowza chunk sizes (~10-12s per chunk)
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        // Chunk sizes are 10-12s; 30s buffer allows 2-3 segments smoothly without memory bloat
        maxBufferLength: 30,
        maxMaxBufferLength: 50,
        maxBufferSize: 25 * 1024 * 1024,
        backBufferLength: 0, // Discard past segments immediately to save data
        // Start 2 segments from live edge so playback starts instantly
        liveSyncDurationCount: 2,
        liveMaxLatencyDurationCount: 5,
        startFragPrefetch: true,
        // Generous timeouts for smooth playback on mobile & slow Wi-Fi
        manifestLoadingTimeOut: 20000,
        manifestLoadingMaxRetry: 6,
        fragLoadingTimeOut: 30000,
        fragLoadingMaxRetry: 8,
        levelLoadingTimeOut: 20000,
        levelLoadingMaxRetry: 6,
      });

      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        setIsBuffering(false);
        setError(null);
        if (autoPlay) {
          attemptPlay(false);
        }
      });

      // Self-healing recovery for network and media glitches
      hls.on(Hls.Events.ERROR, (_event, data) => {
        console.warn('HLS stream event:', data.type, data.details);

        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('Recovering from network drop...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Recovering media buffer...');
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              setError('Live TV stream connection reset. Click retry.');
              setIsLoading(false);
              pauseTv();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Safari HLS
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        setIsBuffering(false);
        if (autoPlay) {
          attemptPlay(false);
        }
      });
      video.addEventListener('error', () => {
        setIsLoading(false);
        setError('Live TV broadcast stream is currently offline.');
      });
    } else {
      setError('HLS playback is not supported by your browser.');
      setIsLoading(false);
    }
  };

  const attemptPlay = (startMutedIfBlocked = true) => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = isMuted;
    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          playTv(station);
          trackEvent({
            event_type: 'TV_PLAY',
            station_id: station.id,
          });
        })
        .catch((err) => {
          console.warn('Autoplay unmuted blocked by browser policy:', err);
          if (startMutedIfBlocked) {
            // If browser blocks unmuted autoplay, mute as fallback and start playback
            video.muted = true;
            setIsMuted(true);
            video.play().then(() => playTv(station)).catch(() => {});
          }
        });
    }
  };

  useEffect(() => {
    loadStream();

    return () => {
      if (bufferingTimerRef.current) clearTimeout(bufferingTimerRef.current);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [station.stream_url]);

  // Sync external play/pause from PlayerContext (e.g. when radio starts, pause TV!)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!isTvPlaying && !video.paused) {
      video.pause();
    }
  }, [isTvPlaying]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      if (error) {
        loadStream();
      } else {
        video.muted = isMuted;
        video.play().then(() => {
          playTv(station);
        }).catch(() => {
          attemptPlay(true);
        });
      }
    } else {
      video.pause();
      pauseTv();
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
      if (isTvPlaying) setShowControls(false);
    }, 3500);
  };

  // Debounced buffering state (prevents flashing "Optimizing buffer" on normal micro-delays)
  const handleWaiting = () => {
    if (bufferingTimerRef.current) clearTimeout(bufferingTimerRef.current);
    bufferingTimerRef.current = setTimeout(() => {
      setIsBuffering(true);
    }, 1200);
  };

  const handlePlaying = () => {
    if (bufferingTimerRef.current) clearTimeout(bufferingTimerRef.current);
    setIsBuffering(false);
    setIsLoading(false);
    setError(null);
    playTv(station);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isTvPlaying && setShowControls(false)}
      className={`relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl group select-none ${className}`}
    >
      <video
        ref={videoRef}
        playsInline
        muted={isMuted}
        onPlay={handlePlaying}
        onPause={() => pauseTv()}
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
        onCanPlay={() => {
          if (bufferingTimerRef.current) clearTimeout(bufferingTimerRef.current);
          setIsBuffering(false);
          setIsLoading(false);
        }}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
      />

      {/* Top Banner (Station Name + Live Badge) */}
      <div
        className={`absolute top-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-b from-black/85 via-black/35 to-transparent flex items-center justify-between transition-opacity duration-300 pointer-events-none ${
          showControls || !isTvPlaying ? 'opacity-100' : 'opacity-0'
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

        <div className="flex items-center gap-2">
          {station.frequency && (
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded bg-white/20 text-white text-xs font-semibold backdrop-blur-sm">
              {station.frequency}
            </span>
          )}
        </div>
      </div>

      {/* Loading Overlay (Initial Load) */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-[2px] pointer-events-none z-20">
          <Loader2 className="w-10 h-10 text-rba-blue animate-spin mb-2" />
          <p className="text-white text-xs sm:text-sm font-semibold tracking-wide">
            Connecting to live broadcast...
          </p>
        </div>
      )}

      {/* Buffering Indicator (Only appears if stalled for > 1.2s, non-intrusive) */}
      {isBuffering && !isLoading && !error && (
        <div className="absolute top-14 right-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-sm text-white text-xs font-semibold border border-white/10 animate-fadeIn">
          <Loader2 className="w-3.5 h-3.5 text-rba-yellow animate-spin" />
          <span>Buffering stream...</span>
        </div>
      )}

      {/* Error & Reconnect Overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 p-6 text-center z-30">
          <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
          <h4 className="text-white font-bold text-base mb-1">Live Broadcast Interrupted</h4>
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
      {!isTvPlaying && !isLoading && !error && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-rba-blue/95 hover:bg-rba-blue text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95 z-20"
          aria-label="Play Live TV"
        >
          <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current ml-1" />
        </button>
      )}

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between transition-opacity duration-300 z-20 ${
          showControls || !isTvPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="p-2 rounded-lg text-white hover:bg-white/20 transition-colors"
            aria-label={isTvPlaying ? 'Pause' : 'Play'}
          >
            {isTvPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
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
