import { useAuth } from '@/contexts/AuthContext';
import { LoginPage } from './LoginPage';
import { AppSidebar } from '@/components/AppSidebar';
import { EmpresaDashboard } from './dashboard/EmpresaDashboard';
import { TransportistaDashboard } from './dashboard/TransportistaDashboard';
import { AcopioDashboard } from './dashboard/AcopioDashboard';
import { RecicladoraDashboard } from './dashboard/RecicladoraDashboard';
import { CompradoraDashboard } from './dashboard/CompradoraDashboard';

const DASHBOARD_MAP = {
  empresa: EmpresaDashboard,
  transportista: TransportistaDashboard,
  acopio: AcopioDashboard,
  recicladora: RecicladoraDashboard,
  compradora: CompradoraDashboard,
} as const;

const Index = () => {
  const { user } = useAuth();

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
