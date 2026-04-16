import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { usePlayer, Song } from '../contexts/PlayerContext';
import { Play, Trash2 } from 'lucide-react';

export default function PlaylistDetail() {
  const { id } = useParams<{ id: string }>();
  const { profile, signInWithGoogle } = useAuth();
  const { playSong } = usePlayer();
  
  const [playlist, setPlaylist] = useState<any>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    const fetchPlaylist = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'playlists', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPlaylist({ id: docSnap.id, ...data });
          
          // Fetch all songs to map IDs
          const songsSnap = await getDocs(collection(db, 'songs'));
          const allS = songsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Song));
          setAllSongs(allS);
          
          // Filter playlist songs
          const pSongs = data.songIds.map((sId: string) => allS.find(s => s.id === sId)).filter(Boolean) as Song[];
          setSongs(pSongs);
        } else {
          setError("Playlist no encontrada");
        }
      } catch (err) {
        console.error("Error fetching playlist", err);
        setError("Error al cargar la playlist. Verifica tus permisos.");
      }
    };
    fetchPlaylist();
  }, [id, profile]);

  const handleAddSong = async (songId: string) => {
    if (!playlist || !id) return;
    const newSongIds = [...playlist.songIds, songId];
    await updateDoc(doc(db, 'playlists', id), { songIds: newSongIds });
    setPlaylist({ ...playlist, songIds: newSongIds });
    
    const newSong = allSongs.find(s => s.id === songId);
    if (newSong) setSongs([...songs, newSong]);
  };

  const handleRemoveSong = async (songId: string) => {
    if (!playlist || !id) return;
    const newSongIds = playlist.songIds.filter((id: string) => id !== songId);
    await updateDoc(doc(db, 'playlists', id), { songIds: newSongIds });
    setPlaylist({ ...playlist, songIds: newSongIds });
    setSongs(songs.filter(s => s.id !== songId));
  };

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <div className="bg-bento-panel border border-bento-border rounded-2xl p-8 max-w-md w-full shadow-2xl">
          <div className="w-16 h-16 bg-bento-hover rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-bento-accent text-3xl">♫</span>
          </div>
          <h2 className="text-2xl font-bold text-bento-text mb-3">Ver Playlist</h2>
          <p className="text-bento-dim text-sm mb-8">
            Inicia sesión para ver y escuchar esta playlist.
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

  if (error) {
    return <div className="p-8 text-center text-red-500 text-sm">{error}</div>;
  }

  if (!playlist) return <div className="p-8 text-center text-bento-dim text-sm">Cargando...</div>;

  const isOwner = profile?.uid === playlist.userId;

  return (
    <div className="pb-12 flex flex-col gap-6">
      <div className="bg-bento-panel rounded-xl border border-bento-border overflow-hidden grid md:grid-cols-[auto_1fr] gap-6 p-6">
        <div className="w-48 h-48 md:w-60 md:h-60 bg-gradient-to-br from-[#333] to-[#111] rounded-lg shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex items-center justify-center flex-shrink-0 relative mx-auto md:mx-0">
          {playlist.imageUrl ? (
            <img src={playlist.imageUrl} alt={playlist.name} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <span className="text-bento-accent opacity-40 text-6xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">♫</span>
          )}
        </div>
        <div className="flex flex-col justify-center text-center md:text-left">
          <span className="text-[11px] font-bold uppercase tracking-wider text-bento-dim mb-2 hidden md:block">Playlist</span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-bento-text">{playlist.name}</h1>
          <p className="text-lg text-bento-dim mb-6">
            {profile?.displayName || 'Usuario'} • {songs.length} canciones
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
        <div className="grid grid-cols-[16px_1fr_40px] md:grid-cols-[16px_minmax(120px,_1fr)_minmax(120px,_1fr)_minmax(120px,_1fr)_minmax(120px,_1fr)] gap-4 px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-bento-dim border-b border-bento-border">
          <div>#</div>
          <div>Título</div>
          <div className="hidden md:block">Álbum</div>
          <div className="hidden md:block">Duración</div>
          <div></div>
        </div>

        <div className="flex flex-col">
          {songs.map((song, index) => (
            <div key={`${song.id}-${index}`} className="grid grid-cols-[16px_1fr_40px] md:grid-cols-[16px_minmax(120px,_1fr)_minmax(120px,_1fr)_minmax(120px,_1fr)_minmax(120px,_1fr)] gap-4 px-6 py-3 text-sm text-bento-dim hover:bg-bento-hover border-b border-bento-border/50 last:border-0 group items-center transition-colors">
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
              <div className="hidden md:flex items-center text-[13px]">{song.duration}</div>
              <div className="flex items-center justify-end">
                {isOwner && (
                  <button 
                    onClick={() => handleRemoveSong(song.id)}
                    className="opacity-0 group-hover:opacity-100 text-bento-dim hover:text-bento-text transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {songs.length === 0 && (
            <div className="p-8 text-center text-bento-dim text-sm">
              No hay canciones en esta playlist.
            </div>
          )}
        </div>
      </div>

      {isOwner && (
        <div className="bg-bento-panel rounded-xl border border-bento-border overflow-hidden">
          <div className="p-4 text-[13px] font-bold uppercase tracking-wider text-bento-dim border-b border-bento-border flex justify-between items-center">
            Recomendaciones
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="text-[11px] bg-bento-bg border border-bento-border px-3 py-1 rounded-full text-bento-text hover:bg-bento-hover transition-colors"
            >
              {isAdding ? 'Cerrar' : 'Buscar más'}
            </button>
          </div>
          
          {isAdding && (
            <div className="flex flex-col p-2">
              {allSongs.filter(s => !playlist.songIds.includes(s.id)).slice(0, 10).map(song => (
                <div key={song.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-bento-hover transition-colors">
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
                      <span className="text-[11px] text-bento-dim truncate">{song.artist}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleAddSong(song.id)}
                    className="border border-bento-dim text-bento-text px-4 py-1.5 rounded-full text-[11px] font-bold hover:border-bento-text hover:bg-bento-bg transition-all flex-shrink-0 ml-2"
                  >
                    Agregar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
