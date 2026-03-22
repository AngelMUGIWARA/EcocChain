import { useAuth } from '@/contexts/AuthContext';
import { AppSidebar } from '@/components/AppSidebar';
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
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
