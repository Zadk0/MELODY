import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { usePlayer, Song } from '../contexts/PlayerContext';
import { Play, Search as SearchIcon, Sparkles } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { useAuth } from '../contexts/AuthContext';

export default function Search() {
  const [query, setQuery] = useState('');
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<Song[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { playSong } = usePlayer();
  const { profile, signInWithGoogle } = useAuth();

  useEffect(() => {
    if (!profile) return;
    const fetchSongs = async () => {
      try {
        const snap = await getDocs(collection(db, 'songs'));
        const songs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Song));
        setAllSongs(songs);
        setFilteredSongs(songs);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    fetchSongs();
  }, [profile]);

  useEffect(() => {
    if (!query) {
      setFilteredSongs(allSongs);
      return;
    }
    const lowerQ = query.toLowerCase();
    setFilteredSongs(allSongs.filter(s => 
      s.name.toLowerCase().includes(lowerQ) || 
      s.artist.toLowerCase().includes(lowerQ) ||
      s.album.toLowerCase().includes(lowerQ)
    ));
  }, [query, allSongs]);

  const getAiRecommendations = async () => {
    if (allSongs.length === 0) return;
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const catalog = allSongs.map(s => `${s.id}: ${s.name} by ${s.artist} (Genre: ${s.genreId})`).join('\n');
      
      const prompt = `
        You are a music recommendation engine. 
        Here is our catalog of songs:
        ${catalog}
        
        Based on general music tastes and similarities, recommend 3 songs from this catalog that go well together.
        Return ONLY a JSON array of the song IDs. Example: ["id1", "id2", "id3"]
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const recommendedIds = JSON.parse(response.text.trim());
      const recommendedSongs = allSongs.filter(s => recommendedIds.includes(s.id));
      setAiRecommendations(recommendedSongs);
    } catch (error) {
      console.error("AI Recommendation error", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <div className="bg-bento-panel border border-bento-border rounded-2xl p-8 max-w-md w-full shadow-2xl">
          <div className="w-16 h-16 bg-bento-hover rounded-full flex items-center justify-center mx-auto mb-6">
            <SearchIcon className="text-bento-accent w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-bento-text mb-3">Buscar Música</h2>
          <p className="text-bento-dim text-sm mb-8">
            Inicia sesión para buscar canciones, artistas y álbumes en nuestro catálogo.
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
      <div className="relative max-w-md">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-bento-dim w-5 h-5" />
        <input 
          type="text" 
          placeholder="¿Qué quieres escuchar?" 
          className="w-full bg-bento-bg border border-bento-border text-bento-text rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:border-bento-accent text-sm"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {profile && (
        <section className="bg-gradient-to-b from-[#1e1e1e] to-[#121212] border border-[rgba(29,185,84,0.2)] rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 text-[13px] font-bold uppercase tracking-wider text-bento-dim flex justify-between items-center">
            Recomendado por IA
            <span className="bg-bento-accent text-bento-bg text-[9px] px-1.5 py-0.5 rounded">PRO</span>
          </div>
          
          <div className="px-4 pb-3 text-xs text-bento-dim">
            Basado en el catálogo disponible:
          </div>

          <div className="px-4 pb-4">
            <button 
              onClick={getAiRecommendations}
              disabled={isAiLoading}
              className="bg-bento-text text-bento-bg font-semibold text-xs px-4 py-2 rounded-full hover:scale-105 transition-transform disabled:opacity-50 mb-4"
            >
              {isAiLoading ? 'Generando...' : 'Generar Recomendaciones'}
            </button>

            {aiRecommendations.length > 0 && (
              <div className="flex flex-col gap-3">
                {aiRecommendations.map(song => (
                  <div key={song.id} className="p-3 bg-[rgba(255,255,255,0.05)] rounded-lg flex gap-3 items-center cursor-pointer hover:bg-[rgba(255,255,255,0.08)] transition-colors" onClick={() => playSong(song, aiRecommendations)}>
                    <div className="w-12 h-12 bg-[#333] rounded relative flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {song.imageUrl ? (
                        <img src={song.imageUrl} alt={song.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-bento-accent opacity-40 text-xl">♫</span>
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Play className="w-5 h-5 fill-white" />
                      </div>
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <h4 className="text-[13px] font-bold text-bento-text truncate">{song.name}</h4>
                      <p className="text-[11px] text-bento-dim truncate">{song.artist}</p>
                      <div className="flex justify-between items-center mt-1 text-[10px] text-bento-dim">
                        <span className="truncate mr-2">{song.album}</span>
                        <span>{song.duration}</span>
                      </div>
                      <div className="text-[10px] text-bento-dim truncate">{song.releaseDate}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="bg-bento-panel rounded-xl border border-bento-border overflow-hidden">
        <div className="p-4 text-[13px] font-bold uppercase tracking-wider text-bento-dim border-b border-bento-border">
          Explorar todo
        </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredSongs.map(song => (
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
                    playSong(song, filteredSongs);
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
          {filteredSongs.length === 0 && (
            <p className="text-bento-dim col-span-full text-sm">No se encontraron resultados.</p>
          )}
        </div>
      </section>
    </div>
  );
}
