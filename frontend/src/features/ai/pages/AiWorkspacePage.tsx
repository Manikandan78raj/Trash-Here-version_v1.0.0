import React, { useState } from 'react';
import { WasteDetectionDashboard } from '../components/WasteDetectionDashboard';
import { AiScannerModal } from '../components/AiScannerModal';

export const AiWorkspacePage: React.FC = () => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <WasteDetectionDashboard onOpenScanner={() => setIsScannerOpen(true)} />
        <AiScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onScanComplete={(jobId) => {
            console.log('Scan initiated with job ID:', jobId);
            setIsScannerOpen(false);
          }}
        />
      </div>
    </div>
  );
};
