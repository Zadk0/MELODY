import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Trash2 } from 'lucide-react';

export default function AdminPanel() {
  const { profile } = useAuth();
  const [genres, setGenres] = useState<any[]>([]);
  const [songs, setSongs] = useState<any[]>([]);
  
  const [newGenre, setNewGenre] = useState({ name: '', imageUrl: '' });
  const [newSong, setNewSong] = useState({
    name: '', artist: '', duration: '', releaseDate: '', genreId: '', album: '', musicUrl: '', imageUrl: ''
  });

  const fetchData = async () => {
    const gSnap = await getDocs(collection(db, 'genres'));
    setGenres(gSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    const sSnap = await getDocs(collection(db, 'songs'));
    setSongs(sSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchData();
    }
  }, [profile]);

  if (profile?.role !== 'admin') {
    return <div className="p-8 text-center text-bento-dim text-sm">Acceso denegado. Solo administradores.</div>;
  }

  const handleAddGenre = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'genres'), newGenre);
      setNewGenre({ name: '', imageUrl: '' });
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Error al agregar género');
    }
  };

  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'songs'), newSong);
      setNewSong({ name: '', artist: '', duration: '', releaseDate: '', genreId: '', album: '', musicUrl: '', imageUrl: '' });
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Error al agregar canción');
    }
  };

  const handleDelete = async (collectionName: string, id: string) => {
    if (confirm('¿Estás seguro?')) {
      await deleteDoc(doc(db, collectionName, id));
      fetchData();
    }
  };

  return (
    <div className="pb-12 flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-bento-text">Panel de Administrador</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <section className="bg-bento-panel rounded-xl border border-bento-border overflow-hidden flex flex-col">
          <div className="p-4 text-[13px] font-bold uppercase tracking-wider text-bento-dim border-b border-bento-border">
            Agregar Género
          </div>
          <div className="p-6 flex flex-col gap-6 flex-1">
            <form onSubmit={handleAddGenre} className="flex flex-col gap-4">
              <input required placeholder="Nombre del género" className="bg-bento-bg border border-bento-border text-bento-text px-4 py-2 rounded-md focus:outline-none focus:border-bento-accent text-sm" value={newGenre.name} onChange={e => setNewGenre({...newGenre, name: e.target.value})} />
              <input placeholder="URL de imagen (opcional)" className="bg-bento-bg border border-bento-border text-bento-text px-4 py-2 rounded-md focus:outline-none focus:border-bento-accent text-sm" value={newGenre.imageUrl} onChange={e => setNewGenre({...newGenre, imageUrl: e.target.value})} />
              <button type="submit" className="bg-bento-accent text-bento-bg font-semibold text-sm px-4 py-2 rounded-md hover:scale-[1.02] transition-transform">Agregar Género</button>
            </form>

            <div className="mt-auto pt-6 border-t border-bento-border">
              <h3 className="font-semibold mb-4 text-sm text-bento-text">Géneros ({genres.length}/10)</h3>
              <ul className="flex flex-col gap-2">
                {genres.map(g => (
                  <li key={g.id} className="flex justify-between items-center bg-bento-bg border border-bento-border p-3 rounded-md group">
                    <span className="text-sm text-bento-text">{g.name}</span>
                    <button onClick={() => handleDelete('genres', g.id)} className="text-bento-dim hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-bento-panel rounded-xl border border-bento-border overflow-hidden flex flex-col">
          <div className="p-4 text-[13px] font-bold uppercase tracking-wider text-bento-dim border-b border-bento-border">
            Agregar Canción
          </div>
          <div className="p-6 flex flex-col gap-6 flex-1">
            <form onSubmit={handleAddSong} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Nombre" className="bg-bento-bg border border-bento-border text-bento-text px-4 py-2 rounded-md focus:outline-none focus:border-bento-accent text-sm" value={newSong.name} onChange={e => setNewSong({...newSong, name: e.target.value})} />
                <input required placeholder="Artista" className="bg-bento-bg border border-bento-border text-bento-text px-4 py-2 rounded-md focus:outline-none focus:border-bento-accent text-sm" value={newSong.artist} onChange={e => setNewSong({...newSong, artist: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Duración (ej. 3:45)" className="bg-bento-bg border border-bento-border text-bento-text px-4 py-2 rounded-md focus:outline-none focus:border-bento-accent text-sm" value={newSong.duration} onChange={e => setNewSong({...newSong, duration: e.target.value})} />
                <input required type="date" className="bg-bento-bg border border-bento-border text-bento-text px-4 py-2 rounded-md focus:outline-none focus:border-bento-accent text-sm" value={newSong.releaseDate} onChange={e => setNewSong({...newSong, releaseDate: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select required className="bg-bento-bg border border-bento-border text-bento-text px-4 py-2 rounded-md focus:outline-none focus:border-bento-accent text-sm" value={newSong.genreId} onChange={e => setNewSong({...newSong, genreId: e.target.value})}>
                  <option value="">Seleccionar Género</option>
                  {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
                <input required placeholder="Álbum" className="bg-bento-bg border border-bento-border text-bento-text px-4 py-2 rounded-md focus:outline-none focus:border-bento-accent text-sm" value={newSong.album} onChange={e => setNewSong({...newSong, album: e.target.value})} />
              </div>
              <input required placeholder="URL de música (mp3)" className="bg-bento-bg border border-bento-border text-bento-text px-4 py-2 rounded-md focus:outline-none focus:border-bento-accent text-sm" value={newSong.musicUrl} onChange={e => setNewSong({...newSong, musicUrl: e.target.value})} />
              <input placeholder="URL de imagen (opcional)" className="bg-bento-bg border border-bento-border text-bento-text px-4 py-2 rounded-md focus:outline-none focus:border-bento-accent text-sm" value={newSong.imageUrl} onChange={e => setNewSong({...newSong, imageUrl: e.target.value})} />
              <button type="submit" className="bg-bento-accent text-bento-bg font-semibold text-sm px-4 py-2 rounded-md hover:scale-[1.02] transition-transform mt-2">Agregar Canción</button>
            </form>

            <div className="mt-auto pt-6 border-t border-bento-border">
              <h3 className="font-semibold mb-4 text-sm text-bento-text">Canciones ({songs.length})</h3>
              <ul className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-2">
                {songs.map(s => (
                  <li key={s.id} className="flex justify-between items-center bg-bento-bg border border-bento-border p-3 rounded-md group">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-bento-text">{s.name}</span>
                      <span className="text-[11px] text-bento-dim">{s.artist}</span>
                    </div>
                    <button onClick={() => handleDelete('songs', s.id)} className="text-bento-dim hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
