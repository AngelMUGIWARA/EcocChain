import { useAuth } from '@/contexts/AuthContext';
import { LoginPage } from './LoginPage';
import { AppSidebar } from '@/components/AppSidebar';
import { EmpresaDashboard } from './dashboard/EmpresaDashboard';
import { TransportistaDashboard } from './dashboard/TransportistaDashboard';
import { AcopioDashboard } from './dashboard/AcopioDashboard';
import { RecicladoraDashboard } from './dashboard/RecicladoraDashboard';
import { CompradoraDashboard } from './dashboard/CompradoraDashboard';
import { Leaf, Loader2 } from 'lucide-react';

const DASHBOARD_MAP = {
  empresa: EmpresaDashboard,
  transportista: TransportistaDashboard,
  acopio: AcopioDashboard,
  recicladora: RecicladoraDashboard,
  compradora: CompradoraDashboard,
} as const;

const Index = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background gap-3 text-muted-foreground">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Leaf className="h-5 w-5" />
        </div>
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (!user) return <LoginPage />;

  const DashboardComponent = DASHBOARD_MAP[user.rol];

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <DashboardComponent />
      </main>
    </div>
  );
};

export default Index;
