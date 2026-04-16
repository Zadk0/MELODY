import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Library, PlusSquare, Music } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Sidebar() {
  const { profile } = useAuth();

  return (
    <div className="flex flex-col h-full bg-bento-panel">
      <div className="p-4 text-[13px] font-bold uppercase tracking-wider text-bento-dim flex justify-between items-center">
        Navegación
      </div>

      <nav className="flex flex-col flex-1 overflow-y-auto px-2">
        <NavLink to="/" className={({isActive}) => `px-3 py-2.5 rounded-md text-sm flex items-center gap-3 cursor-pointer transition-colors ${isActive ? 'text-bento-accent bg-bento-hover' : 'text-bento-text hover:bg-bento-hover'}`}>
          <Home className="w-5 h-5" />
          Inicio
        </NavLink>
        <NavLink to="/search" className={({isActive}) => `px-3 py-2.5 rounded-md text-sm flex items-center gap-3 cursor-pointer transition-colors ${isActive ? 'text-bento-accent bg-bento-hover' : 'text-bento-text hover:bg-bento-hover'}`}>
          <Search className="w-5 h-5" />
          Buscar
        </NavLink>
        {profile && (
          <NavLink to="/library" className={({isActive}) => `px-3 py-2.5 rounded-md text-sm flex items-center gap-3 cursor-pointer transition-colors ${isActive ? 'text-bento-accent bg-bento-hover' : 'text-bento-text hover:bg-bento-hover'}`}>
            <Library className="w-5 h-5" />
            Tu Biblioteca
          </NavLink>
        )}

        {profile && (
          <>
            <div className="mt-6 mb-2 px-3 text-[13px] font-bold uppercase tracking-wider text-bento-dim">
              Playlists
            </div>
            <NavLink to="/create-playlist" className={({isActive}) => `px-3 py-2.5 rounded-md text-sm flex items-center gap-3 cursor-pointer transition-colors ${isActive ? 'text-bento-accent bg-bento-hover' : 'text-bento-text hover:bg-bento-hover'}`}>
              <PlusSquare className="w-5 h-5" />
              Crear Playlist
            </NavLink>
          </>
        )}

        {profile?.role === 'admin' && (
          <div className="mt-auto pt-4 border-t border-bento-border">
            <NavLink to="/admin" className={({isActive}) => `px-3 py-2.5 rounded-md text-sm flex items-center gap-3 cursor-pointer transition-colors ${isActive ? 'text-bento-accent bg-bento-hover' : 'text-bento-text hover:bg-bento-hover'}`}>
              Admin Panel
            </NavLink>
          </div>
        )}
      </nav>
    </div>
  );
}
