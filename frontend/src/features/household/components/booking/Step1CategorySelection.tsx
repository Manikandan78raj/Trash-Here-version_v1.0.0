import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Check,
  Plus,
  Minus,
  Recycle,
  Zap,
  Box,
  FileText,
  Trash2,
  DollarSign,
  Award,
  Leaf,
  ArrowRight,
} from 'lucide-react';
import {
  Card,
  Heading,
  Text,
  Button,
  Input,
  Skeleton,
  Badge,
  EmptyState,
  ErrorState,
} from '@/components/ui';
import { useWasteCategories, type WasteCategory } from '../../api/household.api';

export interface BookingItemState {
  categoryId: string;
  categoryName: string;
  pricePerKg: number;
  pointsPerKg: number;
  co2SavedPerKg: number;
  estimatedWeightKg: number;
}

export interface BookingFormValues {
  items: BookingItemState[];
  images: any[];
  addressId: string;
  selectedDate: string;
  timeSlot: string;
  notes?: string;
}

interface Step1CategorySelectionProps {
  selectedItems: BookingItemState[];
  onChange: (items: BookingItemState[]) => void;
  onNext: () => void;
}

export const Step1CategorySelection: React.FC<Step1CategorySelectionProps> = ({
  selectedItems,
  onChange,
  onNext,
}) => {
  const { data: categories, isLoading, isError, refetch } = useWasteCategories();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  // Map category icons based on slug or name
  const getCategoryIcon = (slugOrName: string) => {
    const lower = slugOrName.toLowerCase();
    if (lower.includes('electric') || lower.includes('e-waste') || lower.includes('circuit')) {
      return <Zap className="h-6 w-6 text-amber-400" />;
    }
    if (lower.includes('paper') || lower.includes('cardboard') || lower.includes('box')) {
      return <FileText className="h-6 w-6 text-emerald-400" />;
    }
    if (lower.includes('plastic') || lower.includes('hdpe') || lower.includes('pet')) {
      return <Recycle className="h-6 w-6 text-primary" />;
    }
    if (lower.includes('metal') || lower.includes('copper') || lower.includes('aluminum')) {
      return <Box className="h-6 w-6 text-purple-400" />;
    }
    return <Trash2 className="h-6 w-6 text-blue-400" />;
  };

  // Filter categories by search and filter tab
  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    return categories.filter((cat) => {
      const matchesSearch =
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedFilter === 'ALL') return true;
      if (selectedFilter === 'PLASTIC' && cat.name.toLowerCase().includes('plastic')) return true;
      if (
        selectedFilter === 'PAPER' &&
        (cat.name.toLowerCase().includes('paper') || cat.name.toLowerCase().includes('cardboard'))
      )
        return true;
      if (
        selectedFilter === 'E-WASTE' &&
        (cat.name.toLowerCase().includes('e-waste') || cat.name.toLowerCase().includes('electric'))
      )
        return true;
      if (
        selectedFilter === 'METALS' &&
        (cat.name.toLowerCase().includes('metal') ||
          cat.name.toLowerCase().includes('copper') ||
          cat.name.toLowerCase().includes('aluminum'))
      )
        return true;

      return selectedFilter === 'ALL';
    });
  }, [categories, searchQuery, selectedFilter]);

  // Toggle selection or update weight
  const handleToggleCategory = (cat: WasteCategory) => {
    const existingIndex = selectedItems.findIndex((it) => it.categoryId === cat.id);
    if (existingIndex >= 0) {
      // Remove item
      const updated = selectedItems.filter((it) => it.categoryId !== cat.id);
      onChange(updated);
    } else {
      // Add item with default weight of 5 kg
      const newItem: BookingItemState = {
        categoryId: cat.id,
        categoryName: cat.name,
        pricePerKg: cat.pricePerKg,
        pointsPerKg: cat.pointsPerKg,
        co2SavedPerKg: cat.co2SavedPerKg,
        estimatedWeightKg: 5,
      };
      onChange([...selectedItems, newItem]);
    }
  };

  const handleWeightChange = (categoryId: string, delta: number) => {
    const updated = selectedItems.map((item) => {
      if (item.categoryId === categoryId) {
        const newWeight = Math.max(1, Math.min(500, item.estimatedWeightKg + delta));
        return { ...item, estimatedWeightKg: newWeight };
      }
      return item;
    });
    onChange(updated);
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Skeleton variant="rectangular" height="44px" className="w-full sm:w-80 rounded-xl" />
          <div className="flex gap-2">
            <Skeleton variant="rectangular" width="80px" height="44px" className="rounded-xl" />
            <Skeleton variant="rectangular" width="80px" height="44px" className="rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rectangular" height="180px" className="rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (isError || !categories) {
    return (
      <Card className="p-8 border-destructive/30 bg-destructive/5 text-center space-y-4">
        <ErrorState
          title="Failed to Load Waste Categories"
          message="We couldn't connect to the pricing engine. Please verify your network connection and retry."
          onRetry={() => refetch()}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search waste categories (e.g., E-Waste, Copper, Cardboard)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 h-11 bg-background/80 backdrop-blur-md rounded-xl"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted/60 rounded-xl border border-border/40">
          {['ALL', 'PLASTIC', 'PAPER', 'E-WASTE', 'METALS'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setSelectedFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all duration-200 ${
                selectedFilter === tab
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Category Grid */}
      {filteredCategories.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-border/60">
          <EmptyState
            title="No Categories Found"
            description={`No waste categories matched "${searchQuery}". Try adjusting your filters or search keywords.`}
            actionLabel="Reset Filters"
            onAction={() => {
              setSearchQuery('');
              setSelectedFilter('ALL');
            }}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCategories.map((cat) => {
            const selectedItem = selectedItems.find((it) => it.categoryId === cat.id);
            const isSelected = !!selectedItem;

            return (
              <motion.div
                key={cat.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  onClick={() => handleToggleCategory(cat)}
                  className={`p-5 rounded-2xl cursor-pointer border transition-all duration-300 relative overflow-hidden group ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-lg glow-primary/20'
                      : 'border-border/60 bg-card/80 hover:bg-card hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`p-3 rounded-2xl border transition-transform duration-300 group-hover:scale-110 ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-muted/80 border-border/40'
                        }`}
                      >
                        {getCategoryIcon(cat.name)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Heading level={3} className="text-base font-bold font-heading">
                            {cat.name}
                          </Heading>
                          {isSelected && (
                            <Badge variant="default" size="sm" className="font-mono text-[10px]">
                              Selected
                            </Badge>
                          )}
                        </div>
                        <Text variant="muted" className="text-xs line-clamp-2">
                          {cat.description}
                        </Text>
                      </div>
                    </div>

                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center border transition-colors ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border/60 text-transparent'
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  {/* Pricing and Eco Multipliers */}
                  <div className="mt-4 pt-3 border-t border-border/40 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-emerald-400 font-bold">
                        <DollarSign className="h-3.5 w-3.5" />${cat.pricePerKg.toFixed(2)} / kg
                      </span>
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        <Award className="h-3.5 w-3.5" />
                        {cat.pointsPerKg} pts / kg
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Leaf className="h-3.5 w-3.5 text-emerald-500" />+{cat.co2SavedPerKg} kg CO₂
                    </span>
                  </div>

                  {/* Weight Adjuster (if selected) */}
                  {isSelected && selectedItem && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-4 pt-3 border-t border-primary/20 flex items-center justify-between bg-background/60 p-3 rounded-xl"
                    >
                      <span className="text-xs font-mono font-bold text-foreground">
                        Est. Weight:
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleWeightChange(cat.id, -1)}
                          className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted-foreground/20 text-foreground transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="font-mono font-bold text-sm w-12 text-center text-primary">
                          {selectedItem.estimatedWeightKg} kg
                        </span>
                        <button
                          type="button"
                          onClick={() => handleWeightChange(cat.id, 1)}
                          className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted-foreground/20 text-foreground transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Footer Action Bar */}
      <div className="pt-4 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <Text variant="default" className="font-bold">
            {selectedItems.length} {selectedItems.length === 1 ? 'Category' : 'Categories'} Selected
          </Text>
          <Text variant="muted" className="text-xs font-mono">
            Total Estimated Weight:{' '}
            <span className="text-primary font-bold">
              {selectedItems.reduce((acc, item) => acc + item.estimatedWeightKg, 0)} kg
            </span>
          </Text>
        </div>

        <Button
          onClick={onNext}
          disabled={selectedItems.length === 0}
          size="lg"
          className="w-full sm:w-auto font-bold tracking-wide group"
        >
          Proceed to AI Photo Upload
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};
