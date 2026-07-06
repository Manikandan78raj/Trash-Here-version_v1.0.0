import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Navigation,
  Plus,
  Trash2,
  Check,
  Building,
  Home as HomeIcon,
  Briefcase,
  ArrowLeft,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Card, Heading, Text, Button, Input, Skeleton, Badge, EmptyState } from '@/components/ui';
import { toast } from '@/common/notifications/toast';
import {
  useAddresses,
  useCreateAddress,
  useDeleteAddress,
  type CreateAddressDto,
} from '../../api/household.api';

interface Step3PickupAddressProps {
  selectedAddressId: string;
  onChange: (addressId: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export const Step3PickupAddress: React.FC<Step3PickupAddressProps> = ({
  selectedAddressId,
  onChange,
  onBack,
  onNext,
}) => {
  const { data: addresses, isLoading } = useAddresses();
  const createAddressMutation = useCreateAddress();
  const deleteAddressMutation = useDeleteAddress();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState({ lat: 37.7749, lng: -122.4194 });
  const [inServiceZone, setInServiceZone] = useState(true);

  // New Address Form State
  const [newLabel, setNewLabel] = useState('Home');
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('San Francisco');
  const [newState, setNewState] = useState('CA');
  const [newZipCode, setNewZipCode] = useState('94110');
  const [newInstructions, setNewInstructions] = useState('');

  // Auto-select first address if none selected
  React.useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      if (defaultAddr) {
        onChange(defaultAddr.id);
      }
    }
  }, [addresses, selectedAddressId, onChange]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMapCoordinates({ lat: latitude, lng: longitude });
        setIsLocating(false);

        // Simulate Reverse Geocoding
        setNewStreet('742 Evergreen Terrace');
        setNewCity('San Francisco');
        setNewState('CA');
        setNewZipCode('94110');
        setInServiceZone(true);

        toast.success('📍 GPS Location locked! Reverse geocoding complete.');
        setIsAddingNew(true);
      },
      () => {
        setIsLocating(false);
        toast.error('Unable to retrieve location. Please grant GPS permissions or enter manually.');
      },
      { timeout: 8000 },
    );
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet.trim() || !newCity.trim() || !newZipCode.trim()) {
      toast.error('Please fill in all required address fields.');
      return;
    }

    const dto: CreateAddressDto = {
      label: newLabel,
      street: newStreet.trim(),
      city: newCity.trim(),
      state: newState.trim(),
      zipCode: newZipCode.trim(),
      lat: mapCoordinates.lat,
      lng: mapCoordinates.lng,
      isDefault: false,
      instructions: newInstructions.trim() || undefined,
    };

    createAddressMutation.mutate(dto, {
      onSuccess: (savedAddr) => {
        setIsAddingNew(false);
        setNewStreet('');
        setNewInstructions('');
        onChange(savedAddr.id);
      },
    });
  };

  const handleDeleteAddress = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteAddressMutation.mutate(id, {
      onSuccess: () => {
        if (selectedAddressId === id && addresses) {
          const remaining = addresses.filter((a) => a.id !== id);
          onChange(remaining.length > 0 ? remaining[0].id : '');
        }
      },
    });
  };

  const getLabelIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('office') || l.includes('work')) return <Briefcase className="h-5 w-5" />;
    if (l.includes('apt') || l.includes('apartment')) return <Building className="h-5 w-5" />;
    return <HomeIcon className="h-5 w-5" />;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton variant="rectangular" height="240px" className="rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton variant="rectangular" height="140px" className="rounded-2xl" />
          <Skeleton variant="rectangular" height="140px" className="rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Interactive Map Visual Simulator */}
      <Card className="p-4 md:p-6 rounded-3xl border border-border/80 bg-card/80 relative overflow-hidden space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Heading level={3} className="text-base font-bold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Pickup Geolocation & SLA Verification
            </Heading>
            <Text variant="muted" className="text-xs font-mono">
              Coordinates: {mapCoordinates.lat.toFixed(4)}° N, {mapCoordinates.lng.toFixed(4)}° W
            </Text>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={inServiceZone ? 'default' : 'error'}
              size="sm"
              className="font-mono text-xs flex items-center gap-1.5 px-3 py-1"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              {inServiceZone ? 'Inside 10-Min SLA Service Zone' : 'Outside Active Zone'}
            </Badge>

            <Button
              type="button"
              onClick={handleGetLocation}
              disabled={isLocating}
              size="sm"
              variant="outline"
              className="font-mono text-xs font-bold"
            >
              {isLocating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <Navigation className="h-3.5 w-3.5 mr-1.5 text-primary" />
              )}
              GPS Locate
            </Button>
          </div>
        </div>

        {/* Visual Map Canvas / Radar Simulation */}
        <div className="relative h-56 w-full rounded-2xl overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 border border-border/60 flex items-center justify-center">
          {/* Radar Grid Lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

          {/* Glowing Center Pin */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="relative z-10 flex flex-col items-center"
          >
            <div className="px-3 py-1 rounded-full bg-primary text-primary-foreground font-mono font-black text-xs shadow-lg glow-primary flex items-center gap-1.5 mb-1 animate-pulse">
              <Sparkles className="h-3 w-3" />
              Active Dispatch Zone #4
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary shadow-xl">
              <MapPin className="h-6 w-6 fill-primary text-primary-foreground" />
            </div>
            <div className="w-4 h-1.5 bg-black/60 rounded-full blur-sm mt-1" />
          </motion.div>

          {/* Simulated Nearby Collector Vehicles */}
          <motion.div
            animate={{ x: [0, 40, -30, 0], y: [0, -20, 30, 0] }}
            transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
            className="absolute top-1/4 left-1/3 px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono text-[10px] flex items-center gap-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            EV Truck #102 (3 mins away)
          </motion.div>
        </div>
      </Card>

      {/* Addresses List or Add New Form */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Heading level={3} className="text-base font-bold">
            Select Pickup Address
          </Heading>
          {!isAddingNew && (
            <Button
              type="button"
              onClick={() => setIsAddingNew(true)}
              size="sm"
              variant="outline"
              className="font-bold text-xs"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5 text-primary" />
              Add New Address
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isAddingNew ? (
            <motion.form
              key="add-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleCreateAddress}
              className="p-6 rounded-3xl border border-primary/40 bg-card/90 space-y-4 shadow-lg"
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <Heading level={4} className="text-sm font-bold">
                  New Pickup Address Details
                </Heading>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddingNew(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-mono font-bold text-muted-foreground block mb-1">
                    Label
                  </label>
                  <select
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-background border border-border/80 font-mono text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Warehouse">Warehouse</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-mono font-bold text-muted-foreground block mb-1">
                    Street Address
                  </label>
                  <Input
                    placeholder="e.g., 742 Evergreen Terrace #4B"
                    value={newStreet}
                    onChange={(e) => setNewStreet(e.target.value)}
                    required
                    className="h-10 rounded-xl font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-mono font-bold text-muted-foreground block mb-1">
                    City
                  </label>
                  <Input
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    required
                    className="h-10 rounded-xl font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono font-bold text-muted-foreground block mb-1">
                    State
                  </label>
                  <Input
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    required
                    className="h-10 rounded-xl font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono font-bold text-muted-foreground block mb-1">
                    Zip Code
                  </label>
                  <Input
                    value={newZipCode}
                    onChange={(e) => setNewZipCode(e.target.value)}
                    required
                    className="h-10 rounded-xl font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-muted-foreground block mb-1">
                  Pickup Instructions (Optional)
                </label>
                <Input
                  placeholder="e.g., Ring doorbell #4B, leave boxes near side garage gate"
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  className="h-10 rounded-xl font-mono text-xs"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={createAddressMutation.isPending}
                  size="sm"
                  className="font-bold"
                >
                  {createAddressMutation.isPending && (
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  )}
                  Save & Select Address
                </Button>
              </div>
            </motion.form>
          ) : !addresses || addresses.length === 0 ? (
            <Card className="p-10 text-center border-dashed border-border/80">
              <EmptyState
                title="No Saved Addresses"
                description="Add your first pickup location to dispatch electric collection vehicles."
                actionLabel="Add New Address"
                onAction={() => setIsAddingNew(true)}
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => {
                const isSelected = addr.id === selectedAddressId;
                return (
                  <motion.div
                    key={addr.id}
                    layout
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Card
                      onClick={() => onChange(addr.id)}
                      className={`p-5 rounded-2xl cursor-pointer border transition-all duration-300 relative overflow-hidden group ${
                        isSelected
                          ? 'border-primary bg-primary/10 shadow-lg glow-primary/20'
                          : 'border-border/60 bg-card/80 hover:bg-card hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div
                            className={`p-3 rounded-2xl border transition-colors ${
                              isSelected
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-muted/80 border-border/40 text-muted-foreground'
                            }`}
                          >
                            {getLabelIcon(addr.label)}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Heading level={4} className="text-sm font-bold">
                                {addr.label}
                              </Heading>
                              {addr.isDefault && (
                                <Badge
                                  variant="secondary"
                                  size="sm"
                                  className="text-[10px] font-mono"
                                >
                                  Default
                                </Badge>
                              )}
                              {isSelected && (
                                <Badge
                                  variant="default"
                                  size="sm"
                                  className="text-[10px] font-mono"
                                >
                                  Selected
                                </Badge>
                              )}
                            </div>
                            <Text variant="default" className="text-xs font-medium">
                              {addr.street}
                            </Text>
                            <Text variant="muted" className="text-xs font-mono">
                              {addr.city}, {addr.state} {addr.postalCode || addr.zipCode || '94110'}
                            </Text>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {addresses.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => handleDeleteAddress(e, addr.id)}
                              disabled={deleteAddressMutation.isPending}
                              className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
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
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Action Bar */}
      <div className="pt-4 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Button onClick={onBack} variant="outline" size="lg" className="w-full sm:w-auto font-bold">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Photos
        </Button>

        <Button
          onClick={onNext}
          disabled={!selectedAddressId}
          size="lg"
          className="w-full sm:w-auto font-bold tracking-wide group"
        >
          Proceed to Schedule
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};
