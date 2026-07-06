import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Truck, Navigation, DollarSign, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { CollectorDashboardTab } from '../components/CollectorDashboardTab';
import { CollectorRouteTab } from '../components/CollectorRouteTab';
import { CollectorPayoutsTab } from '../components/CollectorPayoutsTab';
import { CollectorScannerModal } from '../components/CollectorScannerModal';
import { logisticsSocketService } from '../services/logistics-socket.service';

export const CollectorWorkspacePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'route' | 'payouts'>('dashboard');
  const queryClient = useQueryClient();

  // Scanner modal state
  const [scannerOpen, setScannerOpen] = useState<boolean>(false);
  const [scannerJob, setScannerJob] = useState<{
    id: string;
    lat?: number;
    lng?: number;
    customerName?: string;
    addressLabel?: string;
    weight?: number;
  }>({ id: '' });

  useEffect(() => {
    // Connect to /logistics WebSocket on mount for live GPS and status updates
    logisticsSocketService.connect(queryClient);
    return () => {
      logisticsSocketService.disconnect();
    };
  }, [queryClient]);

  const handleOpenScanner = (job: {
    id: string;
    lat?: number;
    lng?: number;
    customerName?: string;
    addressLabel?: string;
    weight?: number;
  }) => {
    setScannerJob(job);
    setScannerOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Workspace Header & Tab Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground">
              Collector & Fleet Workspace
            </h1>
            <Badge variant="success" className="text-xs animate-pulse flex items-center gap-1">
              <Activity className="h-3 w-3" /> LIVE FLEET GPS
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage nearby dispatch feeds, polyline waypoint routing, geofence QR verification, and
            Stripe Connect payouts.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-muted/60 border border-border/60 self-start md:self-center shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'dashboard'
                ? 'bg-primary text-primary-foreground shadow-sm glow-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            }`}
          >
            <Truck className="h-4 w-4" />
            <span>Fleet Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('route')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'route'
                ? 'bg-primary text-primary-foreground shadow-sm glow-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            }`}
          >
            <Navigation className="h-4 w-4" />
            <span>Polyline Route</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payouts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'payouts'
                ? 'bg-primary text-primary-foreground shadow-sm glow-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            }`}
          >
            <DollarSign className="h-4 w-4" />
            <span>Stripe Payouts</span>
          </button>
        </div>
      </div>

      {/* Tab Content Rendering */}
      <div className="pt-2">
        {activeTab === 'dashboard' && (
          <CollectorDashboardTab
            onNavigateToRoute={() => setActiveTab('route')}
            onOpenScanner={handleOpenScanner}
          />
        )}

        {activeTab === 'route' && <CollectorRouteTab onOpenScanner={handleOpenScanner} />}

        {activeTab === 'payouts' && <CollectorPayoutsTab />}
      </div>

      {/* Geofence QR Code Scanner Modal */}
      <CollectorScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        pickupId={scannerJob.id}
        expectedLat={scannerJob.lat}
        expectedLng={scannerJob.lng}
        customerName={scannerJob.customerName}
        addressLabel={scannerJob.addressLabel}
        estimatedWeightKg={scannerJob.weight}
      />
    </div>
  );
};

export default CollectorWorkspacePage;
