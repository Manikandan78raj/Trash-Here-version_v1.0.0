import React, { useState } from 'react';
import { useAdminConfigs, useAdminUpdateConfig, type SystemConfigDto } from '../api/admin.api';
import { Sliders, Edit2, Check, X } from 'lucide-react';

export const AdminConfigPage: React.FC = () => {
  const { data: configs, isLoading } = useAdminConfigs();
  const updateConfig = useAdminUpdateConfig();

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono animate-pulse">
        Loading Dynamic Platform Economic Parameters...
      </div>
    );
  }

  const handleStartEdit = (cfg: SystemConfigDto) => {
    setEditingKey(cfg.key);
    setEditValue(cfg.value);
  };

  const handleSaveEdit = (cfg: SystemConfigDto) => {
    updateConfig.mutate(
      {
        key: cfg.key,
        value: editValue,
        description: cfg.description,
      },
      {
        onSuccess: () => {
          setEditingKey(null);
        },
      },
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 rounded-[30px] bg-slate-900/80 backdrop-blur-md border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-[#D7FF43]" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Dynamic Platform Economic Parameters
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Zero-downtime hot reloading • Live tuning of platform fee structures and dispatch radii
          </p>
        </div>
      </div>

      {/* Config Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {configs?.map((cfg) => {
          const isEditing = editingKey === cfg.key;

          return (
            <div
              key={cfg.id}
              className="p-6 rounded-[30px] bg-slate-900/70 border border-slate-800/80 hover:border-[#D7FF43]/30 transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="font-mono font-bold text-sm text-[#D7FF43] tracking-wide">
                    {cfg.key}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Updated by {cfg.updatedBy}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{cfg.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                {isEditing ? (
                  <div className="flex items-center space-x-2 w-full">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-[#D7FF43] text-white text-sm font-mono focus:outline-none"
                    />
                    <button
                      onClick={() => handleSaveEdit(cfg)}
                      disabled={updateConfig.isPending}
                      className="p-2 rounded-xl bg-[#D7FF43] text-slate-950 hover:bg-[#c2eb36] transition-all font-bold text-xs"
                      title="Save"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingKey(null)}
                      className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-mono">
                        CURRENT VALUE
                      </span>
                      <span className="text-xl font-extrabold text-white font-mono">
                        {cfg.value}
                      </span>
                    </div>
                    <button
                      onClick={() => handleStartEdit(cfg)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center space-x-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
