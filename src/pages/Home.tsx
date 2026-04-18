import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { usePlayer, Song } from '../contexts/PlayerContext';
import { useAuth } from '../contexts/AuthContext';
import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Genre {
  id: string;
  name: string;
  imageUrl?: string;
}

export default function Home() {
  const { profile, signInWithGoogle } = useAuth();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [recentSongs, setRecentSongs] = useState<Song[]>([]);
  const { playSong } = usePlayer();

  useEffect(() => {
    if (!profile) return;
    const fetchData = async () => {
      try {
        const genresSnapshot = await getDocs(query(collection(db, 'genres'), limit(10)));
        setGenres(genresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Genre)));

        const songsSnapshot = await getDocs(query(collection(db, 'songs'), limit(10)));
        setRecentSongs(songsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Song)));
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    fetchData();
  }, [profile]);

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <div className="bg-bento-panel border border-bento-border rounded-2xl p-8 max-w-md w-full shadow-2xl">
          <div className="w-16 h-16 bg-bento-hover rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-bento-accent text-3xl">♫</span>
          </div>
          <h2 className="text-2xl font-bold text-bento-text mb-3">Bienvenido a MusicFlow</h2>
          <p className="text-bento-dim text-sm mb-8">
            Inicia sesión para descubrir nueva música, crear tus playlists y disfrutar de recomendaciones personalizadas por IA.
          </p>
          <button 
            onClick={signInWithGoogle}
            className="w-full bg-bento-text text-bento-bg font-bold py-3 rounded-full hover:scale-[1.02] transition-transform"
          >
            Iniciar Sesión con Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      <section className="bg-bento-panel rounded-xl border border-bento-border overflow-hidden">
        <div className="p-4 text-[13px] font-bold uppercase tracking-wider text-bento-dim flex justify-between items-center border-b border-bento-border">
          Géneros <span>({genres.length})</span>
        </div>
        <div className="p-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {genres.map(genre => (
            <Link key={genre.id} to={`/genre/${genre.id}`} className="px-3 py-2.5 rounded-md text-sm cursor-pointer hover:bg-bento-hover transition-colors text-bento-text relative overflow-hidden group">
              <div className="flex items-center gap-2 relative z-10 w-full">
                <span className="truncate font-semibold drop-shadow-md">{genre.name}</span>
              </div>
              {genre.imageUrl && (
                <div 
                  className="absolute inset-0 z-0 opacity-20 group-hover:opacity-40 transition-opacity bg-cover bg-center"
                  style={{ backgroundImage: `url(${genre.imageUrl})` }}
                />
              )}
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-bento-panel rounded-xl border border-bento-border overflow-hidden">
        <div className="p-4 text-[13px] font-bold uppercase tracking-wider text-bento-dim border-b border-bento-border">
          Canciones Recientes
        </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {recentSongs.map(song => (
            <div key={song.id} className="bg-bento-panel hover:bg-bento-hover border border-bento-border transition-colors rounded-lg p-3 cursor-pointer group relative flex flex-col">
              <div className="aspect-square bg-gradient-to-br from-[#333] to-[#111] rounded-md mb-3 overflow-hidden shadow-[0_10px_20px_rgba(0,0,0,0.3)] relative flex-shrink-0">
                {song.imageUrl ? (
                  <img src={song.imageUrl} alt={song.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-bento-accent opacity-40 font-bold text-4xl">♫</div>
                )}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    playSong(song, recentSongs);
                  }}
                  className="absolute bottom-2 right-2 bg-bento-accent text-bento-bg rounded-full p-2.5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-xl"
                >
                  <Play className="w-4 h-4 fill-current" />
                </button>
              </div>
              <h3 className="font-bold text-[14px] truncate text-bento-text">{song.name}</h3>
              <p className="text-[12px] text-bento-dim truncate">{song.artist}</p>
              <div className="flex justify-between items-center mt-1 text-[10px] text-bento-dim">
                <span className="truncate mr-2">{song.album}</span>
                <span>{song.duration}</span>
              </div>
              <div className="text-[10px] text-bento-dim truncate">{song.releaseDate}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
