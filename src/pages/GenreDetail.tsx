import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { usePlayer, Song } from '../contexts/PlayerContext';
import { Play } from 'lucide-react';

export default function GenreDetail() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const { playSong } = usePlayer();
  
  const [genre, setGenre] = useState<any>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    const fetchGenreAndSongs = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'genres', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setGenre({ id: docSnap.id, ...docSnap.data() });
          
          const songsQ = query(collection(db, 'songs'), where("genreId", "==", id));
          const songsSnap = await getDocs(songsQ);
          setSongs(songsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Song)));
        } else {
          setError("Género no encontrado");
        }
      } catch (err) {
        console.error("Error fetching genre", err);
        setError("Error al cargar el género.");
      }
    };
    fetchGenreAndSongs();
  }, [id, profile]);

  if (!profile) return null;
  if (error) return <div className="p-8 text-center text-red-500 text-sm">{error}</div>;
  if (!genre) return <div className="p-8 text-center text-bento-dim text-sm">Cargando...</div>;

  return (
    <div className="pb-12 flex flex-col gap-6">
      <div className="bg-bento-panel rounded-xl border border-bento-border overflow-hidden grid md:grid-cols-[auto_1fr] gap-6 p-6">
        <div className="w-48 h-48 md:w-60 md:h-60 bg-gradient-to-br from-[#333] to-[#111] rounded-lg shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex items-center justify-center flex-shrink-0 relative mx-auto md:mx-0">
          {genre.imageUrl ? (
            <img src={genre.imageUrl} alt={genre.name} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <span className="text-bento-accent opacity-40 text-6xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">♫</span>
          )}
        </div>
        <div className="flex flex-col justify-center text-center md:text-left">
          <span className="text-[11px] font-bold uppercase tracking-wider text-bento-dim mb-2 hidden md:block">Género</span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-bento-text">{genre.name}</h1>
          <p className="text-lg text-bento-dim mb-6">
            {songs.length} canciones
          </p>
          <div className="flex items-center justify-center md:justify-start gap-4">
            <button 
              onClick={() => songs.length > 0 && playSong(songs[0], songs)}
              className="bg-bento-accent text-bento-bg rounded-full p-3 hover:scale-105 transition-transform"
            >
              <Play className="w-6 h-6 fill-current" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-bento-panel rounded-xl border border-bento-border overflow-hidden">
        <div className="grid grid-cols-[16px_1fr_40px] md:grid-cols-[16px_minmax(120px,_1fr)_minmax(120px,_1fr)_minmax(80px,_80px)_minmax(80px,_80px)] gap-4 px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-bento-dim border-b border-bento-border">
          <div>#</div>
          <div>Título</div>
          <div className="hidden md:block">Álbum</div>
          <div className="hidden md:block">Fecha</div>
          <div className="hidden md:block">Duración</div>
        </div>

        <div className="flex flex-col">
          {songs.map((song, index) => (
            <div key={`${song.id}-${index}`} className="grid grid-cols-[16px_1fr_40px] md:grid-cols-[16px_minmax(120px,_1fr)_minmax(120px,_1fr)_minmax(80px,_80px)_minmax(80px,_80px)] gap-4 px-6 py-3 text-sm text-bento-dim hover:bg-bento-hover border-b border-bento-border/50 last:border-0 group items-center transition-colors">
              <div className="flex items-center">
                <span className="group-hover:hidden text-[12px]">{index + 1}</span>
                <button 
                  onClick={() => playSong(song, songs)}
                  className="hidden group-hover:block text-bento-text"
                >
                  <Play className="w-4 h-4 fill-current" />
                </button>
              </div>
              <div className="flex items-center gap-3 overflow-hidden">
                {song.imageUrl ? (
                  <img src={song.imageUrl} alt={song.name} className="w-10 h-10 object-cover rounded flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 bg-bento-bg rounded flex items-center justify-center flex-shrink-0 border border-bento-border">
                    <span className="text-bento-accent opacity-40 text-sm">♫</span>
                  </div>
                )}
                <div className="flex flex-col overflow-hidden">
                  <span className="text-bento-text font-bold text-[13px] truncate">{song.name}</span>
                  <span className="text-[11px] truncate">{song.artist}</span>
                </div>
              </div>
              <div className="hidden md:flex items-center truncate text-[13px]">{song.album}</div>
              <div className="hidden md:flex items-center text-[13px]">{song.releaseDate}</div>
              <div className="hidden md:flex items-center text-[13px]">{song.duration}</div>
            </div>
          ))}
          {songs.length === 0 && (
            <div className="p-8 text-center text-bento-dim text-sm">
              No hay canciones en este género.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
