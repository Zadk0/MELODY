import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, AlertTriangle } from 'lucide-react';
import { usePlayer } from '../../contexts/PlayerContext';

function formatTime(seconds: number) {
  if (isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default function PlayerBar() {
  const { 
    currentSong, isPlaying, togglePlayPause, playNext, playPrevious,
    currentTime, duration, seek, volume, setVolume, playerError
  } = usePlayer();

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  if (!currentSong) {
    return (
      <div className="h-[80px] bg-bento-bg border-t border-bento-border grid grid-cols-3 items-center px-6">
        <div></div>
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-6 text-xl items-center text-bento-text">
            <button className="hover:text-bento-accent transition-colors"><SkipBack className="w-5 h-5 fill-current" /></button>
            <button className="text-3xl hover:text-bento-accent transition-colors">
              <Play className="w-8 h-8 fill-current" />
            </button>
            <button className="hover:text-bento-accent transition-colors"><SkipForward className="w-5 h-5 fill-current" /></button>
          </div>
          <div className="flex items-center gap-2.5 w-full max-w-[400px] hidden sm:flex">
            <span className="font-mono text-[11px] text-bento-dim mt-1">0:00</span>
            <div className="w-full h-1 bg-[#4f4f4f] rounded-sm relative"></div>
            <span className="font-mono text-[11px] text-bento-dim mt-1">0:00</span>
          </div>
        </div>
        <div></div>
      </div>
    );
  }

  return (
    <div className="h-[80px] bg-bento-bg border-t border-bento-border grid grid-cols-2 md:grid-cols-3 items-center px-4 md:px-6 relative">
      {playerError && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg animate-bounce whitespace-nowrap z-50">
          <AlertTriangle className="w-4 h-4" />
          {playerError}
        </div>
      )}

      <div className="flex items-center gap-3">
        {currentSong.imageUrl ? (
          <img src={currentSong.imageUrl} alt={currentSong.name} className="w-12 h-12 rounded object-cover border border-bento-border" />
        ) : (
          <div className="w-12 h-12 bg-bento-panel rounded border border-bento-border flex items-center justify-center">
            <span className="text-[10px] font-bold text-bento-dim text-center px-1">NO COVER</span>
          </div>
        )}
        <div className="flex flex-col overflow-hidden leading-tight">
          <strong className="text-sm text-bento-text truncate">{currentSong.name}</strong>
          <span className="text-[11px] text-bento-dim truncate">{currentSong.artist}</span>
          <span className="text-[9px] text-bento-dim/80 truncate mt-0.5 max-w-[200px]">
            {currentSong.album} • {currentSong.releaseDate}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-6 text-xl items-center text-bento-text">
          <button onClick={playPrevious} disabled={!!playerError} className={`hover:text-bento-accent transition-colors ${playerError ? 'opacity-50' : ''}`}>
            <SkipBack className="w-5 h-5 fill-current" />
          </button>
          <button onClick={togglePlayPause} disabled={!!playerError} className={`text-3xl hover:text-bento-accent transition-colors ${playerError ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
          </button>
          <button onClick={playNext} disabled={!!playerError} className={`hover:text-bento-accent transition-colors ${playerError ? 'opacity-50' : ''}`}>
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
        </div>
        <div className="flex items-center gap-2.5 w-full max-w-[400px] hidden sm:flex">
          <span className="font-mono text-[11px] text-bento-dim mt-1">{formatTime(currentTime)}</span>
          <div 
            className={`w-full h-1 bg-[#4f4f4f] rounded-sm relative ${playerError ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            onClick={(e) => {
              if (playerError) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              seek(pos * duration);
            }}
          >
            <div className={`h-full rounded-sm ${playerError ? 'bg-red-500' : 'bg-bento-accent'}`} style={{ width: `${progressPercent}%` }}></div>
          </div>
          <span className="font-mono text-[11px] text-bento-dim mt-1">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="hidden md:flex items-center justify-end gap-2 text-sm text-bento-dim">
        <Volume2 className="w-4 h-4" />
        <input 
          type="range" 
          min={0} 
          max={1} 
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-20 h-1 bg-[#4f4f4f] rounded-sm appearance-none cursor-pointer accent-bento-accent"
        />
      </div>
    </div>
  );
}
