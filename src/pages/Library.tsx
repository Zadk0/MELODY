import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Music } from 'lucide-react';

interface Playlist {
  id: string;
  name: string;
  userId: string;
  songIds: string[];
  imageUrl?: string;
}

export default function Library() {
  const { profile, signInWithGoogle } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!profile) return;
    const fetchPlaylists = async () => {
      try {
        const q = query(collection(db, 'playlists'), where('userId', '==', profile.uid));
        const snap = await getDocs(q);
        setPlaylists(snap.docs.map(d => ({ id: d.id, ...d.data() } as Playlist)));
      } catch (error) {
        console.error("Error fetching playlists", error);
      }
    };
    fetchPlaylists();
  }, [profile]);

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !newPlaylistName.trim()) return;
    try {
      const docRef = await addDoc(collection(db, 'playlists'), {
        name: newPlaylistName,
        userId: profile.uid,
        songIds: [],
      });
      setPlaylists([...playlists, { id: docRef.id, name: newPlaylistName, userId: profile.uid, songIds: [] }]);
      setNewPlaylistName('');
      setIsCreating(false);
    } catch (error) {
      console.error("Error creating playlist", error);
    }
  };

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <div className="bg-bento-panel border border-bento-border rounded-2xl p-8 max-w-md w-full shadow-2xl">
          <div className="w-16 h-16 bg-bento-hover rounded-full flex items-center justify-center mx-auto mb-6">
            <Music className="text-bento-accent w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-bento-text mb-3">Tu Biblioteca</h2>
          <p className="text-bento-dim text-sm mb-8">
            Inicia sesión para crear tus propias playlists y guardar tu música favorita.
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
    <div className="pb-12 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-bento-text">Tu Biblioteca</h1>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 text-sm font-semibold text-bento-text bg-bento-bg border border-bento-border px-4 py-2 rounded-full hover:bg-bento-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          Crear Playlist
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreatePlaylist} className="bg-bento-panel border border-bento-border p-4 rounded-xl flex gap-4 items-center">
          <input 
            autoFocus
            type="text" 
            placeholder="Nombre de mi playlist" 
            className="bg-bento-bg border border-bento-border text-bento-text px-4 py-2 rounded-md flex-1 focus:outline-none focus:border-bento-accent text-sm"
            value={newPlaylistName}
            onChange={e => setNewPlaylistName(e.target.value)}
          />
          <button type="submit" className="bg-bento-text text-bento-bg font-semibold text-sm px-4 py-2 rounded-full hover:scale-105 transition-transform">
            Guardar
          </button>
          <button type="button" onClick={() => setIsCreating(false)} className="text-bento-dim hover:text-bento-text text-sm px-2">
            Cancelar
          </button>
        </form>
      )}

      <section className="bg-bento-panel rounded-xl border border-bento-border overflow-hidden">
        <div className="p-4 text-[13px] font-bold uppercase tracking-wider text-bento-dim border-b border-bento-border">
          Playlists
        </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {playlists.map(playlist => (
            <div 
              key={playlist.id} 
              onClick={() => navigate(`/playlist/${playlist.id}`)}
              className="bg-bento-panel hover:bg-bento-hover border border-bento-border transition-colors rounded-lg p-3 cursor-pointer group flex flex-col"
            >
              <div className="aspect-square bg-gradient-to-br from-[#333] to-[#111] rounded-md mb-3 flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.3)] overflow-hidden">
                {playlist.imageUrl ? (
                  <img src={playlist.imageUrl} alt={playlist.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-bento-accent opacity-40 text-4xl">♫</span>
                )}
              </div>
              <h3 className="font-bold text-[14px] truncate text-bento-text">{playlist.name}</h3>
              <p className="text-[12px] text-bento-dim truncate">Playlist • {profile.displayName}</p>
            </div>
          ))}
          {playlists.length === 0 && !isCreating && (
            <div className="col-span-full text-center py-12 text-bento-dim text-sm border border-dashed border-bento-border rounded-lg m-4">
              + Crear Nueva Playlist
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
