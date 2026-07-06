import React, { useState } from 'react';
import { Download, FileText, CheckCircle2, Clock, Loader2, Database } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useRequestGdprExport } from '../api/hub.api';

interface ExportJob {
  id: string;
  requestedAt: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  downloadUrl?: string;
  expiresAt?: string;
}

export const GdprTab: React.FC = () => {
  const exportMutation = useRequestGdprExport();

  // Local state to track export jobs in current session
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([
    {
      id: 'exp-2026-06-01-09812',
      requestedAt: '2026-06-01T14:32:00Z',
      status: 'COMPLETED',
      downloadUrl: '#',
      expiresAt: '2026-06-08T14:32:00Z',
    },
  ]);

  const handleRequestExport = () => {
    exportMutation.mutate(undefined, {
      onSuccess: (data) => {
        const newJob: ExportJob = {
          id: data.exportId || `exp-${Date.now()}`,
          requestedAt: new Date().toISOString(),
          status: 'PROCESSING',
        };
        setExportJobs((prev) => [newJob, ...prev]);
      },
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. GDPR Overview Banner */}
      <Card className="p-6 border-border/60 bg-gradient-to-br from-card to-muted/30 shadow-lg space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-extrabold text-foreground">
              GDPR & CCPA Data Portability Center
            </h3>
            <p className="text-xs text-muted-foreground">
              Full transparency over your enterprise waste records, GPS telemetry logs, and ledger
              transactions.
            </p>
          </div>
        </div>
        <p className="text-xs text-foreground/80 leading-relaxed max-w-3xl">
          In compliance with General Data Protection Regulation (GDPR) Article 15 & 20, you have the
          right to request a complete machine-readable archive (JSON & CSV format) of all personal
          and household data processed by Trash Here Enterprise.
        </p>
      </Card>

      {/* 2. Request Data Export Card */}
      <Card className="p-6 border-border/60 bg-card shadow-lg space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
          <div className="space-y-1">
            <h4 className="font-heading text-md font-extrabold text-foreground flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" /> Generate Data Archive
            </h4>
            <p className="text-xs text-muted-foreground max-w-xl">
              Initiates an asynchronous background worker to compile your profile records, pickup
              history, rewards vouchers, and financial ledgers.
            </p>
          </div>
          <Button
            onClick={handleRequestExport}
            disabled={exportMutation.isPending}
            className="rounded-2xl px-6 font-extrabold shadow-md glow-primary self-start md:self-center"
          >
            {exportMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Compiling Archive...
              </>
            ) : (
              'Request Data Export'
            )}
          </Button>
        </div>

        {/* What is included checklist */}
        <div className="space-y-3">
          <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Archive Contents (ZIP Bundle)
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                title: 'Profile & KYC',
                desc: 'Names, emails, phone, roles, and verification logs',
              },
              { title: 'Waste Pickups', desc: 'GPS coordinates, weight receipts, and timestamps' },
              { title: 'Wallet Ledger', desc: 'Transaction history, payouts, and stripe invoices' },
              {
                title: 'Rewards & ESG',
                desc: 'Green points earned, redeemed coupons, and CO₂ savings',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl border border-border/40 bg-muted/20 space-y-1"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {item.title}
                </div>
                <p className="text-[11px] text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 3. Export History Table */}
      <Card className="p-6 border-border/60 bg-card shadow-lg space-y-4">
        <h4 className="font-heading text-md font-extrabold text-foreground flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" /> Export Request History
        </h4>
        <p className="text-xs text-muted-foreground">
          Download links remain valid for 7 days before being automatically purged from secure cloud
          storage.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="pb-3 pl-2">Export ID</th>
                <th className="pb-3">Requested Date</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Expires At</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 text-xs">
              {exportJobs.map((job) => (
                <tr key={job.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 pl-2 font-mono font-bold text-foreground">{job.id}</td>
                  <td className="py-3.5 text-muted-foreground">
                    {new Date(job.requestedAt).toLocaleString()}
                  </td>
                  <td className="py-3.5">
                    {job.status === 'PROCESSING' && (
                      <Badge variant="warning" className="flex items-center gap-1 w-fit">
                        <Loader2 className="h-3 w-3 animate-spin" /> Processing (202 Accepted)
                      </Badge>
                    )}
                    {job.status === 'COMPLETED' && (
                      <Badge variant="success" className="flex items-center gap-1 w-fit">
                        <CheckCircle2 className="h-3 w-3" /> Ready for Download
                      </Badge>
                    )}
                  </td>
                  <td className="py-3.5 text-muted-foreground">
                    {job.expiresAt
                      ? new Date(job.expiresAt).toLocaleDateString()
                      : '7 days after completion'}
                  </td>
                  <td className="py-3.5 text-right pr-2">
                    {job.status === 'COMPLETED' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => alert('Downloading encrypted GDPR archive...')}
                        className="rounded-xl text-xs font-bold border-primary/40 hover:bg-primary/10"
                      >
                        <Download className="h-3.5 w-3.5 mr-1 text-primary" /> Download ZIP
                      </Button>
                    ) : (
                      <span className="text-[11px] text-muted-foreground italic flex items-center justify-end gap-1">
                        <Clock className="h-3 w-3" /> Compiling...
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
