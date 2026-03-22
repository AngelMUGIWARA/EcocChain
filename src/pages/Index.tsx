import { useAuth } from '@/contexts/AuthContext';
import { LoginPage } from './LoginPage';
import { FloatingNavbar } from '@/components/FloatingNavbar';
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
    <div className="h-screen overflow-hidden bg-EcoTracer-secondary">
      <FloatingNavbar />
      <main className="h-screen ml-20 overflow-y-auto bg-EcoTracer-secondary p-6 md:p-8">
        <DashboardComponent />
      </main>
    </div>
  );
};

export default Index;
