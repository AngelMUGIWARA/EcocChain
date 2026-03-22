import { useAuth } from '@/contexts/AuthContext';
import { FloatingNavbar } from '@/components/FloatingNavbar';
import { Outlet, Navigate } from 'react-router-dom';

export function AppLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09291D]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C8A97A]/30 border-t-[#C8A97A]" />
          <p className="text-xs text-[#FCFAEB]/30 font-normal">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-[#FCFAEB]">
      <FloatingNavbar />
      {/*
        pl-[104px] clears the fixed navbar (w-20=80px outer + m-4=16px right margin = 96px)
        plus 8px breathing room. pr/pt/pb use fixed rem values to avoid Tailwind
        shorthand overrides (p-* would reset pl).
      */}
      <main
        className="min-h-screen overflow-y-auto"
        style={{ paddingLeft: '104px', paddingRight: '2rem', paddingTop: '2rem', paddingBottom: '2rem' }}
      >
        <Outlet />
      </main>
    </div>
  );
}
