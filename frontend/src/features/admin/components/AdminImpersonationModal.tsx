import React, { useState } from 'react';
import { useAdminStartImpersonation } from '../api/admin.api';
import { ShieldAlert, UserCheck, Lock, AlertOctagon } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminImpersonationModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const startImpersonation = useAdminStartImpersonation();
  const [targetUserId, setTargetUserId] = useState('');
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleStartSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId || !reason) return;

    startImpersonation.mutate(
      { targetUserId, reason },
      {
        onSuccess: () => {
          setTargetUserId('');
          setReason('');
          onClose();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md p-8 rounded-[35px] bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-400 animate-pulse" />
            <span>Support Impersonation</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm font-mono"
          >
            ✕
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <AlertOctagon className="w-4 h-4" />
            <span>SOC 2 Type II Audit Notice</span>
          </div>
          <p className="text-[11px] text-amber-200/80 leading-relaxed">
            All impersonation sessions emit an immutable cryptographic audit trail. Impersonating a SUPER_ADMIN account is strictly prohibited by platform security rules.
          </p>
        </div>

        <form onSubmit={handleStartSession} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Target User ID
            </label>
            <input
              type="text"
              required
              placeholder="e.g. usr-household-123"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-[#D7FF43]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Mandatory Audit Reason
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ticket #4012 - Debugging wallet balance"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-[#D7FF43]"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={startImpersonation.isPending}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center space-x-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>{startImpersonation.isPending ? 'Starting...' : 'Start Secure Session'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
