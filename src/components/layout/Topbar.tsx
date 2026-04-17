import React from 'react';
import { ChevronLeft, ChevronRight, User as UserIcon, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Topbar() {
  const { user, profile, signInWithGoogle, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="h-[60px] flex items-center justify-between px-6 border-b border-bento-border bg-bento-bg shrink-0">
      <div className="flex items-center gap-4">
        <div className="font-extrabold text-xl text-bento-accent tracking-tight mr-4">
          MUSICFLOW AI
        </div>
        <div className="flex gap-2 hidden sm:flex">
          <button onClick={() => navigate(-1)} className="bg-transparent text-bento-dim hover:text-bento-text transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={() => navigate(1)} className="bg-transparent text-bento-dim hover:text-bento-text transition-colors">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            {profile?.role === 'admin' && (
              <button 
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 bg-bento-accent/10 text-bento-accent hover:bg-bento-accent/20 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors"
              >
                <Settings className="w-4 h-4" />
                Panel Admin
              </button>
            )}
            <span className="text-sm font-semibold hidden sm:block text-bento-text">{profile?.displayName}</span>
            <button 
              onClick={logout}
              className="bg-bento-panel border border-bento-border p-2 rounded-full hover:bg-bento-hover transition-colors text-bento-text"
              title="Cerrar sesión"
            >
              <UserIcon className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex gap-4 items-center">
            <button className="text-bento-text hover:text-bento-dim font-semibold text-sm px-4 py-2 rounded-full border border-bento-dim transition-colors" onClick={signInWithGoogle}>
              Registrarse
            </button>
            <button 
              onClick={signInWithGoogle}
              className="bg-bento-text text-bento-bg font-semibold text-sm px-4 py-2 rounded-full hover:scale-105 transition-transform"
            >
              Iniciar Sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
