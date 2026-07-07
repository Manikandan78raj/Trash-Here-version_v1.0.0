import React, { useState } from 'react';
import { useAdminAuditLogs } from '../api/admin.api';
import { AdminImpersonationModal } from './AdminImpersonationModal';
import { ShieldCheck, Terminal, UserCheck, Filter } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';

export const AdminAuditLogPage: React.FC = () => {
  const { data: logs, isLoading } = useAdminAuditLogs();
  const [showImpersonateModal, setShowImpersonateModal] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const filteredLogs = logs?.filter((log) => {
    if (filterSeverity === 'ALL') return true;
    return log.severity === filterSeverity;
  }) || [];

  const parentRef = React.useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: filteredLogs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 110,
    overscan: 5,
  });

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono animate-pulse">
        Loading Immutable Security Audit Ledger...
      </div>
    );
  }

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse';
      case 'HIGH':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
      case 'WARNING':
        return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border border-slate-700';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 rounded-[30px] bg-slate-900/80 backdrop-blur-md border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-[#D7FF43]" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Immutable Security Audit Ledger
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            SOC 2 Type II / GDPR compliance trail • SHA-256 cryptographic logging • Zero-deletion retention
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <button
            onClick={() => setShowImpersonateModal(true)}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center space-x-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>Launch Impersonation</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center space-x-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
        <Filter className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Severity Filter:</span>
        <div className="flex space-x-2">
          {['ALL', 'INFO', 'WARNING', 'HIGH', 'CRITICAL'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                filterSeverity === sev
                  ? 'bg-[#D7FF43] text-slate-950 font-bold shadow-md shadow-[#D7FF43]/10'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table / Cards */}
      {filteredLogs.length === 0 ? (
        <div className="p-12 text-center text-slate-500 font-mono rounded-[30px] bg-slate-900/40 border border-slate-800">
          No audit logs found matching selected criteria.
        </div>
      ) : (
        <div
          ref={parentRef}
          className="max-h-[650px] overflow-y-auto pr-2"
          style={{ position: 'relative' }}
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const log = filteredLogs[virtualRow.index];
              return (
                <div
                  key={log.id}
                  data-index={virtualRow.index}
                  data-testid="audit-log-row"
                  ref={rowVirtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="pb-3"
                >
                  <div className="p-5 rounded-[25px] bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase font-mono ${getSeverityBadge(log.severity)}`}>
                          {log.severity}
                        </span>
                        <span className="text-sm font-bold text-white tracking-wide font-mono">
                          {log.action}
                        </span>
                        <span className="text-xs text-slate-400">
                          on <strong className="text-slate-200">{log.entity}</strong> ({log.entityId})
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 font-mono flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span>Actor: <strong className="text-slate-300">{log.actorId}</strong></span>
                        <span>IP: <strong className="text-slate-300">{log.ipAddress}</strong></span>
                        <span className="text-slate-500 truncate max-w-xs">{log.userAgent}</span>
                      </div>

                      {(log.oldValue || log.newValue) && (
                        <div className="mt-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono flex items-center space-x-2 text-slate-300">
                          <Terminal className="w-3.5 h-3.5 text-[#D7FF43]" />
                          <span>
                            Diff: <span className="text-rose-400 line-through mr-2">{log.oldValue || 'none'}</span> ➔{' '}
                            <span className="text-emerald-400 ml-2">{log.newValue || 'none'}</span>
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="text-right text-xs font-mono text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <AdminImpersonationModal
        isOpen={showImpersonateModal}
        onClose={() => setShowImpersonateModal(false)}
      />
    </div>
  );
};
