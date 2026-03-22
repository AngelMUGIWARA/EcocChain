import { useAuth } from '@/contexts/AuthContext';
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
  if (!user) return null;

  const DashboardComponent = DASHBOARD_MAP[user.rol];
  return <DashboardComponent />;
};

export default Index;
