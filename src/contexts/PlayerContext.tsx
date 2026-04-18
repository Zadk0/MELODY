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
    // Prevent CORS issues automatically by not forcing crossorigin unless needed, 
    // but some hosts require it. By default, leaving it empty is safer for open links.
    audioRef.current = new Audio();
    // audioRef.current.crossOrigin = "anonymous"; // Commented out to prevent strict CORS blocks on HTTP links
    
    const audio = audioRef.current;
    
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => playNext();
    const handleError = (e: any) => {
      console.error("Audio Load Error:", e);
      setIsPlaying(false);
      setPlayerError("El enlace de audio no funcionó. Asegúrate de que sea un enlace directo a un archivo MP3 y que el servidor permita su reproducción.");
      setTimeout(() => setPlayerError(null), 8000);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (currentSong && audioRef.current) {
      setPlayerError(null);
      audioRef.current.src = currentSong.musicUrl;
      if (isPlaying) {
        audioRef.current.play().catch(e => {
          console.error("Playback failed", e);
          setIsPlaying(false);
          setPlayerError("No se pudo iniciar la reproducción. El navegador bloqueó el audio o el enlace es inválido.");
          setTimeout(() => setPlayerError(null), 8000);
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
    setCurrentSong(song);
    setIsPlaying(true);
    setPlayerError(null);
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
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within a PlayerProvider');
  return context;
};
