import React, { useState } from 'react';
import {
  useRecyclerInventory,
  useRecyclerBatches,
  useCreateBatch,
  type WarehouseInventoryDto,
  type MaterialBatchDto,
} from '../api/recycler.api';
import { Package, Layers, Plus, CheckCircle2, Box } from 'lucide-react';
import { VirtualizedTable } from '../../../common/components';

export const WarehouseInventoryMatrix: React.FC = () => {
  const { data: inventory = [], isLoading: isInvLoading } = useRecyclerInventory();
  const { data: batches = [], isLoading: isBatchesLoading } = useRecyclerBatches();
  const createBatchMutation = useCreateBatch();

  const [showModal, setShowModal] = useState(false);
  const [categoryId, setCategoryId] = useState('cat-pet-1');
  const [weightKg, setWeightKg] = useState(5000);
  const [warehouseLocation, setWarehouseLocation] = useState('BAY-A1');

  const totalStockKg = inventory.reduce((sum: number, item: WarehouseInventoryDto) => sum + item.totalWeightKg, 0);
  const availableStockKg = inventory.reduce((sum: number, item: WarehouseInventoryDto) => sum + item.availableWeightKg, 0);
  const allocatedStockKg = inventory.reduce((sum: number, item: WarehouseInventoryDto) => sum + item.allocatedWeightKg, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBatchMutation.mutate(
      { categoryId, weightKg, warehouseLocation },
      {
        onSuccess: () => {
          setShowModal(false);
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      {/* Aggregated Stock Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-[30px] bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Facility Stock</span>
            <div className="p-2.5 rounded-xl bg-[#D7FF43]/10 text-[#D7FF43]">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
            {isInvLoading ? '...' : `${(totalStockKg / 1000).toFixed(1)} Tons`}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            <span className="text-[#D7FF43] font-bold">{totalStockKg.toLocaleString()} kg</span> raw intake + processed stock
          </p>
        </div>

        <div className="p-6 rounded-[30px] bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Available For Processing</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
            {isInvLoading ? '...' : `${(availableStockKg / 1000).toFixed(1)} Tons`}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Ready for allocation to shop-floor shredding & washing lines
          </p>
        </div>

        <div className="p-6 rounded-[30px] bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Allocated To Machines</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Box className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono tracking-tight">
            {isInvLoading ? '...' : `${(allocatedStockKg / 1000).toFixed(1)} Tons`}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Currently undergoing active manufacturing & pelletizing
          </p>
        </div>
      </div>

      {/* Inventory & Lot Batches Table */}
      <div className="rounded-[30px] bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h4 className="text-lg font-bold text-white flex items-center space-x-2">
              <Layers className="w-5 h-5 text-[#D7FF43]" />
              <span>Traceable Material Lot Batches</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              FIFO / LIFO warehouse lot traceability and purity verification.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-[#D7FF43] hover:bg-[#c5ec36] text-slate-950 font-bold text-sm tracking-wide transition-all shadow-lg hover:shadow-[#D7FF43]/20 flex items-center space-x-2 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Lot Batch</span>
          </button>
        </div>

        {isBatchesLoading ? (
          <div className="flex justify-center items-center py-12 text-slate-400 animate-pulse">
            Loading warehouse lot inventory...
          </div>
        ) : batches.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-slate-950/40 border border-slate-800/50">
            <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No material lot batches registered in warehouse.</p>
            <p className="text-xs text-slate-500 mt-1">Click "Create Lot Batch" to log accepted waste into inventory.</p>
          </div>
        ) : (
          <VirtualizedTable
            data={batches}
            height="450px"
            rowHeight={56}
            columns={[
              {
                header: 'Lot Batch Number',
                accessor: (batch: MaterialBatchDto) => (
                  <span className="font-mono font-bold text-white">{batch.batchNumber}</span>
                ),
              },
              {
                header: 'Category',
                accessor: (batch: MaterialBatchDto) => (
                  <span className="text-slate-300 font-medium">{batch.category?.name || batch.categoryId}</span>
                ),
              },
              {
                header: 'Weight (kg)',
                accessor: (batch: MaterialBatchDto) => (
                  <span className="font-mono text-[#D7FF43] font-bold">{batch.weightKg.toLocaleString()} kg</span>
                ),
              },
              {
                header: 'Purity %',
                accessor: (batch: MaterialBatchDto) => (
                  <span className="font-mono text-emerald-400">{batch.purityPercent}%</span>
                ),
              },
              {
                header: 'Bay Location',
                accessor: (batch: MaterialBatchDto) => (
                  <span className="font-mono text-slate-400">{batch.warehouseLocation || 'BAY-A1'}</span>
                ),
              },
              {
                header: 'Status',
                accessor: (batch: MaterialBatchDto) => (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    {batch.status === 'READY_FOR_SALE' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mr-1" />}
                    {batch.status}
                  </span>
                ),
              },
            ]}
          />
        )}
      </div>

      {/* Create Lot Batch Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[30px] bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Plus className="w-5 h-5 text-[#D7FF43]" />
                <span>Create Material Lot Batch</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Waste Category ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. cat-pet-1 or cat-aluminum-1"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-[#D7FF43]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-[#D7FF43]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Warehouse Bay Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BAY-A1"
                  value={warehouseLocation}
                  onChange={(e) => setWarehouseLocation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-[#D7FF43]"
                />
              </div>
              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createBatchMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-[#D7FF43] hover:bg-[#c5ec36] text-slate-950 font-bold text-sm transition-all shadow"
                >
                  {createBatchMutation.isPending ? 'Creating...' : 'Confirm Lot Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
