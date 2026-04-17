import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Trash2, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdminPanel() {
  const { profile } = useAuth();
  const [genres, setGenres] = useState<any[]>([]);
  const [songs, setSongs] = useState<any[]>([]);
  
  const [newGenre, setNewGenre] = useState({ name: '' });
  const [genreImageFile, setGenreImageFile] = useState<File | null>(null);

  const [newSong, setNewSong] = useState({
    name: '', artist: '', duration: '', releaseDate: '', genreId: '', album: ''
  });
  const [songFile, setSongFile] = useState<File | null>(null);
  const [songImageFile, setSongImageFile] = useState<File | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{type: 'error' | 'success', text: string} | null>(null);

  // Refs para limpiar los inputs de archivo después de subir
  const genreImageInputRef = useRef<HTMLInputElement>(null);
  const songFileInputRef = useRef<HTMLInputElement>(null);
  const songImageInputRef = useRef<HTMLInputElement>(null);

  const showStatus = (type: 'error' | 'success', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 6000);
  };

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

  const uploadFile = async (file: File, folder: string) => {
    const fileRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  };

  const handleAddGenre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGenre.name) return;
    setIsUploading(true);
    setStatusMessage(null);
    try {
      let imageUrl = '';
      if (genreImageFile) {
        imageUrl = await uploadFile(genreImageFile, 'genres');
      }
      await addDoc(collection(db, 'genres'), { name: newGenre.name, imageUrl });
      
      setNewGenre({ name: '' });
      setGenreImageFile(null);
      if (genreImageInputRef.current) genreImageInputRef.current.value = '';
      
      showStatus('success', 'Género agregado correctamente.');
      fetchData();
    } catch (error) {
      console.error(error);
      showStatus('error', 'Error al agregar género. Revisa los permisos de Firebase Storage.');
    }
    setIsUploading(false);
  };

  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!songFile) {
      showStatus('error', 'Debes seleccionar un archivo de música (MP3)');
      return;
    }
    setIsUploading(true);
    setStatusMessage(null);
    try {
      const musicUrl = await uploadFile(songFile, 'songs');
      let imageUrl = '';
      if (songImageFile) {
        imageUrl = await uploadFile(songImageFile, 'covers');
      }

      const songData: any = { ...newSong, musicUrl };
      if (imageUrl) songData.imageUrl = imageUrl;

      await addDoc(collection(db, 'songs'), songData);
      
      setNewSong({ name: '', artist: '', duration: '', releaseDate: '', genreId: '', album: '' });
      setSongFile(null);
      setSongImageFile(null);
      if (songFileInputRef.current) songFileInputRef.current.value = '';
      if (songImageInputRef.current) songImageInputRef.current.value = '';
      
      showStatus('success', 'Canción agregada correctamente.');
      fetchData();
    } catch (error) {
      console.error(error);
      showStatus('error', 'Error al agregar canción. Verifica que guardaste las reglas en Firebase Storage.');
    }
    setIsUploading(false);
  };

  const handleDelete = async (collectionName: string, id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
      showStatus('success', 'Eliminado correctamente (Recuerda borrar el archivo de Storage manual).');
      fetchData();
    } catch (error) {
      console.error(error);
      showStatus('error', 'Error al eliminar el documento.');
    }
  };

  return (
    <div className="pb-12 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-bento-text">Panel de Administrador</h1>
        
        {statusMessage && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold ${
            statusMessage.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
            : 'bg-green-500/10 text-green-500 border border-green-500/20'
          }`}>
            {statusMessage.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            {statusMessage.text}
          </div>
        )}
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <section className="bg-bento-panel rounded-xl border border-bento-border overflow-hidden flex flex-col">
          <div className="p-4 text-[13px] font-bold uppercase tracking-wider text-bento-dim border-b border-bento-border">
            Agregar Género
          </div>
          <div className="p-6 flex flex-col gap-6 flex-1">
            <form onSubmit={handleAddGenre} className="flex flex-col gap-4">
              <input required placeholder="Nombre del género" className="bg-bento-bg border border-bento-border text-bento-text px-4 py-2 rounded-md focus:outline-none focus:border-bento-accent text-sm" value={newGenre.name} onChange={e => setNewGenre({...newGenre, name: e.target.value})} disabled={isUploading} />
              
              <div className="flex flex-col gap-1">
                <label className="text-xs text-bento-dim">Imagen del Género (Opcional):</label>
                <input 
                  type="file" 
                  accept="image/*"
                  ref={genreImageInputRef}
                  onChange={(e) => setGenreImageFile(e.target.files?.[0] || null)}
                  className="bg-bento-bg border border-bento-border text-bento-dim px-4 py-1.5 rounded-md text-sm file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-bento-accent file:text-bento-bg hover:file:opacity-80 transition-opacity"
                  disabled={isUploading}
                />
              </div>

              <button type="submit" disabled={isUploading} className="flex items-center justify-center gap-2 bg-bento-accent text-bento-bg font-semibold text-sm px-4 py-2 rounded-md hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100 mt-2">
                {isUploading ? 'Subiendo...' : <><Upload className="w-4 h-4" /> Agregar Género</>}
              </button>
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
                <input required placeholder="Nombre" className="bg-bento-bg border border-bento-border text-bento-text px-4 py-2 rounded-md focus:outline-none focus:border-bento-accent text-sm" value={newSong.name} onChange={e => setNewSong({...newSong, name: e.target.value})} disabled={isUploading} />
                <input required placeholder="Artista" className="bg-bento-bg border border-bento-border text-bento-text px-4 py-2 rounded-md focus:outline-none focus:border-bento-accent text-sm" value={newSong.artist} onChange={e => setNewSong({...newSong, artist: e.target.value})} disabled={isUploading} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Duración (ej. 3:45)" className="bg-bento-bg border border-bento-border text-bento-text px-4 py-2 rounded-md focus:outline-none focus:border-bento-accent text-sm" value={newSong.duration} onChange={e => setNewSong({...newSong, duration: e.target.value})} disabled={isUploading} />
                <input required type="date" className="bg-bento-bg border border-bento-border text-bento-text px-4 py-2 rounded-md focus:outline-none focus:border-bento-accent text-sm" value={newSong.releaseDate} onChange={e => setNewSong({...newSong, releaseDate: e.target.value})} disabled={isUploading} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select required className="bg-bento-bg border border-bento-border text-bento-text px-4 py-2 rounded-md focus:outline-none focus:border-bento-accent text-sm" value={newSong.genreId} onChange={e => setNewSong({...newSong, genreId: e.target.value})} disabled={isUploading}>
                  <option value="">Seleccionar Género</option>
                  {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
                <input required placeholder="Álbum" className="bg-bento-bg border border-bento-border text-bento-text px-4 py-2 rounded-md focus:outline-none focus:border-bento-accent text-sm" value={newSong.album} onChange={e => setNewSong({...newSong, album: e.target.value})} disabled={isUploading} />
              </div>

              <div className="p-3 border border-dashed border-bento-accent/50 rounded-lg bg-bento-accent/5 flex flex-col gap-2 relative">
                <label className="text-xs font-bold text-bento-accent">Archivo MP3 (Requerido):</label>
                <input 
                  required
                  type="file" 
                  accept="audio/*"
                  ref={songFileInputRef}
                  onChange={(e) => setSongFile(e.target.files?.[0] || null)}
                  className="text-bento-dim text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-bento-accent file:text-bento-bg hover:file:opacity-80 transition-opacity"
                  disabled={isUploading}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-bento-dim">Imagen de Portada (Opcional):</label>
                <input 
                  type="file" 
                  accept="image/*"
                  ref={songImageInputRef}
                  onChange={(e) => setSongImageFile(e.target.files?.[0] || null)}
                  className="bg-bento-bg border border-bento-border text-bento-dim px-4 py-1.5 rounded-md text-sm file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-bento-text file:text-bento-bg hover:file:opacity-80 transition-opacity"
                  disabled={isUploading}
                />
              </div>

              <button type="submit" disabled={isUploading} className="flex items-center justify-center gap-2 bg-bento-accent text-bento-bg font-semibold text-sm px-4 py-2 rounded-md hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100 mt-2">
                {isUploading ? 'Subiendo Archivos...' : <><Upload className="w-4 h-4" /> Agregar Canción</>}
              </button>
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
