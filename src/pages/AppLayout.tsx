import { useAuth } from '@/contexts/AuthContext';
import { AppSidebar } from '@/components/AppSidebar';
import { Outlet } from 'react-router-dom';
import { LoginPage } from './LoginPage';

export function AppLayout() {
  const { user } = useAuth();

  if (!user) return <LoginPage />;

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
