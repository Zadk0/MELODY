import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import PlayerBar from './PlayerBar';
import { Home, Search, Library } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Layout() {
  const { profile } = useAuth();

  return (
    <div className="h-screen flex flex-col bg-bento-bg text-bento-text overflow-hidden font-sans">
      <Topbar />
      <div className="flex-1 flex overflow-hidden p-3 gap-3 pb-24 md:pb-3">
        <div className="hidden md:flex w-[220px] bg-bento-panel rounded-xl border border-bento-border overflow-hidden flex-col">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col bg-bento-panel rounded-xl border border-bento-border overflow-hidden relative">
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <Outlet />
          </div>
        </div>
      </div>
      
      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-20 left-0 right-0 bg-bento-panel/90 backdrop-blur-md border-t border-bento-border flex justify-around p-3 z-50">
        <NavLink to="/" className={({isActive}) => `flex flex-col items-center gap-1 text-xs ${isActive ? 'text-bento-accent' : 'text-bento-dim'}`}>
          <Home className="w-6 h-6" />
          Inicio
        </NavLink>
        <NavLink to="/search" className={({isActive}) => `flex flex-col items-center gap-1 text-xs ${isActive ? 'text-bento-accent' : 'text-bento-dim'}`}>
          <Search className="w-6 h-6" />
          Buscar
        </NavLink>
        {profile && (
          <NavLink to="/library" className={({isActive}) => `flex flex-col items-center gap-1 text-xs ${isActive ? 'text-bento-accent' : 'text-bento-dim'}`}>
            <Library className="w-6 h-6" />
            Biblioteca
          </NavLink>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50">
        <PlayerBar />
      </div>
    </div>
  );
}
