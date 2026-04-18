import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

export interface Song {
  id: string;
  name: string;
  artist: string;
  duration: string;
  releaseDate: string;
  genreId: string;
  album: string;
  musicUrl: string;
  imageUrl?: string;
  previewUrl?: string;
}

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  playSong: (song: Song, queue?: Song[]) => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrevious: () => void;
  volume: number;
  setVolume: (volume: number) => void;
  currentTime: number;
  duration: number;
  seek: (time: number) => void;
  playerError: string | null;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playerError, setPlayerError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (currentSong && audioRef.current) {
      setPlayerError(null);
      if (audioRef.current.dataset.songId !== currentSong.id) {
         audioRef.current.dataset.songId = currentSong.id;
         audioRef.current.dataset.triedFallback = 'false';
         audioRef.current.src = currentSong.musicUrl;
      }
      if (isPlaying) {
        audioRef.current.play().catch(e => {
          console.error("Playback failed block", e);
        });
      }
    }
  }, [currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => {
          console.error("Playback failed", e);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const playSong = (song: Song, newQueue?: Song[]) => {
    if (currentSong?.id === song.id) {
       setIsPlaying(true);
    } else {
       setCurrentSong(song);
       setIsPlaying(true);
       setPlayerError(null);
    }
    
    if (newQueue) {
      setQueue(newQueue);
    }
  };

  const togglePlayPause = () => {
    if (currentSong && !playerError) {
      setIsPlaying(!isPlaying);
    }
  };

  const playNext = () => {
    if (queue.length === 0 || !currentSong) return;
    const currentIndex = queue.findIndex(s => s.id === currentSong.id);
    if (currentIndex < queue.length - 1) {
      playSong(queue[currentIndex + 1]);
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const playPrevious = () => {
    if (queue.length === 0 || !currentSong) return;
    const currentIndex = queue.findIndex(s => s.id === currentSong.id);
    if (currentIndex > 0) {
      playSong(queue[currentIndex - 1]);
    }
  };

  const seek = (time: number) => {
    if (audioRef.current && !playerError) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleEnded = () => playNext();

  const handleError = (e: any) => {
    if (audioRef.current && audioRef.current.dataset.triedFallback === 'false' && currentSong?.previewUrl) {
       console.log("Local music file not found, falling back to iTunes preview...");
       audioRef.current.dataset.triedFallback = 'true';
       audioRef.current.src = currentSong.previewUrl;
       if (isPlaying) {
         audioRef.current.play().catch(err => {
            console.error("Fallback playback failed", err);
            setIsPlaying(false);
            setPlayerError("Error reproducir el audio.");
            setTimeout(() => setPlayerError(null), 8000);
         });
       }
       return;
    }

    console.error("Audio Load Error:", e);
    setIsPlaying(false);
    setPlayerError("Archivo no encontrado. Asegúrate de haberlo subido a tu carpeta /music o verifica el enlace.");
    setTimeout(() => setPlayerError(null), 8000);
  };

  return (
    <PlayerContext.Provider value={{
      currentSong,
      isPlaying,
      queue,
      playSong,
      togglePlayPause,
      playNext,
      playPrevious,
      volume,
      setVolume,
      currentTime,
      duration,
      seek,
      playerError
    }}>
      {children}
      <audio 
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={handleError}
        style={{ display: 'none' }}
      />
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within a PlayerProvider');
  return context;
};
