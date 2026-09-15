import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Station } from '../types';
import { trackEvent } from '../services/api';

interface PlayerContextType {
  currentStation: Station | null;
  isPlaying: boolean;
  isLoading: boolean;
  isBuffering: boolean;
  volume: number;
  isMuted: boolean;
  error: string | null;
  isExpanded: boolean;
  playStation: (station: Station) => void;
  pauseStation: () => void;
  togglePlay: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  retryPlayback: () => void;
  stopStation: () => void;
  setIsExpanded: (expanded: boolean) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [volume, setVolumeState] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none';
    audio.volume = volume;
    audioRef.current = audio;

    const handleWaiting = () => {
      setIsBuffering(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setIsBuffering(false);
      setError(null);
    };

    const handlePlaying = () => {
      setIsPlaying(true);
      setIsLoading(false);
      setIsBuffering(false);
      setError(null);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleError = (e: any) => {
      console.warn('Audio stream playback error:', e);
      setIsLoading(false);
      setIsBuffering(false);
      setIsPlaying(false);
      setError('Live stream temporarily unavailable. Click retry to reconnect.');
    };

    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.src = '';
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  const playStation = (station: Station) => {
    if (!audioRef.current) return;

    // If already playing this station, just toggle or ensure playing
    if (currentStation?.id === station.id && isPlaying) {
      return;
    }

    // Stop current stream if switching stations
    audioRef.current.pause();
    setError(null);
    setIsLoading(true);
    setIsBuffering(false);
    setCurrentStation(station);

    // Append cache buster timestamp for live radio stream freshness
    const streamUrl = station.stream_url.includes('?') 
      ? `${station.stream_url}&_t=${Date.now()}` 
      : `${station.stream_url}?_t=${Date.now()}`;

    audioRef.current.src = streamUrl;
    audioRef.current.load();

    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
          // Track analytics event
          trackEvent({
            event_type: 'RADIO_PLAY',
            station_id: station.id,
          });
        })
        .catch((err) => {
          console.warn('Audio autoplay prevented or stream connection failed:', err);
          setIsLoading(false);
          setIsPlaying(false);
          // User interaction required or stream offline
          if (err.name === 'NotAllowedError') {
            setError('Click play to allow audio in your browser.');
          } else {
            setError('Unable to connect to live radio stream. Try again.');
          }
        });
    }
  };

  const pauseStation = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (currentStation) {
        trackEvent({
          event_type: 'RADIO_STOP',
          station_id: currentStation.id,
        });
      }
    }
  };

  const togglePlay = () => {
    if (!currentStation) return;
    if (isPlaying) {
      pauseStation();
    } else {
      if (error) {
        retryPlayback();
      } else if (audioRef.current) {
        audioRef.current.play().catch(() => retryPlayback());
      }
    }
  };

  const retryPlayback = () => {
    if (currentStation) {
      playStation(currentStation);
    }
  };

  const stopStation = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setIsPlaying(false);
    setIsLoading(false);
    setError(null);
    setCurrentStation(null);
    setIsExpanded(false);
  };

  const setVolume = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
      audioRef.current.muted = clamped === 0;
    }
    setIsMuted(clamped === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMute = !isMuted;
    setIsMuted(newMute);
    audioRef.current.muted = newMute;
  };

  return (
    <PlayerContext.Provider
      value={{
        currentStation,
        isPlaying,
        isLoading,
        isBuffering,
        volume,
        isMuted,
        error,
        isExpanded,
        playStation,
        pauseStation,
        togglePlay,
        setVolume,
        toggleMute,
        retryPlayback,
        stopStation,
        setIsExpanded,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
