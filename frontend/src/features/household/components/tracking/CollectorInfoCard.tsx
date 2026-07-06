import React, { useState } from 'react';
import {
  PhoneCall,
  MessageSquare,
  ShieldCheck,
  Star,
  Truck,
  Send,
  User,
  Clock,
  CheckCheck,
} from 'lucide-react';
import {
  Card,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui';
import { type CollectorProfile } from '../../api/household.api';

export interface CollectorInfoCardProps {
  collector?: CollectorProfile | null;
  status: string;
}

export const CollectorInfoCard: React.FC<CollectorInfoCardProps> = ({ collector, status }) => {
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [chatMessages, setChatMessages] = useState<
    { sender: 'user' | 'driver'; text: string; time: string }[]
  >([
    {
      sender: 'driver',
      text: "Hello! I'm your assigned waste collector today. Driving an electric van!",
      time: 'Just now',
    },
    {
      sender: 'driver',
      text: 'Please ensure E-Waste or hazardous items are separated if applicable.',
      time: 'Just now',
    },
  ]);

  // Fallback default collector if null (for pending or unassigned state)
  const isAssigned = status !== 'PENDING' && status !== 'CANCELLED';
  const displayCollector = collector || {
    id: 'col-default',
    rating: 4.98,
    totalCompleted: 1420,
    user: {
      firstName: 'Marcus',
      lastName: 'Vance',
      phone: '+18005550199',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    },
    vehicles: [
      {
        id: 'veh-1',
        vehicleType: 'Electric Waste Van (Zero Emissions)',
        plateNumber: 'ECO-2026-EV',
        capacityKg: 1500,
      },
    ],
  };

  const driverName = displayCollector.user
    ? `${displayCollector.user.firstName} ${displayCollector.user.lastName}`
    : 'Assigned Collector';
  const driverPhone = displayCollector.user?.phone || '+1 (800) 555-0199';
  const driverPhoto = displayCollector.user?.photoUrl;
  const vehicle = displayCollector.vehicles?.[0] || {
    vehicleType: 'Electric Waste Van',
    plateNumber: 'ECO-2026-EV',
  };

  const handleCallDriver = () => {
    window.location.href = `tel:${driverPhone}`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const userMsg = {
      sender: 'user' as const,
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setMessageText('');

    // Simulate driver automated reply after 1.5 seconds
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'driver',
          text: 'Got it! Thanks for letting me know. See you shortly!',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1500);
  };

  if (!isAssigned) {
    return (
      <Card className="p-6 border-border/60 bg-card/60 rounded-3xl backdrop-blur-md text-center py-10">
        <div className="h-14 w-14 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-4 animate-pulse">
          <Truck className="h-7 w-7" />
        </div>
        <h3 className="text-base font-bold text-foreground">Searching for Nearby Collector</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          Our AI dispatch engine is matching your request with an available 5-star electric waste
          van in your SLA zone.
        </p>
        <Badge variant="outline" className="mt-4 font-mono text-xs">
          <Clock className="h-3 w-3 mr-1 animate-spin" />
          Estimated match time: &lt; 2 mins
        </Badge>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6 bg-gradient-to-br from-card via-card to-primary/5 border-border/80 shadow-lg relative overflow-hidden flex flex-col justify-between h-full">
        {/* Background Glow Badge */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-6 relative z-10">
          {/* Driver Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className="h-14 w-14 rounded-2xl bg-muted border-2 border-primary/40 overflow-hidden flex items-center justify-center shadow-md">
                  {driverPhoto ? (
                    <img
                      src={driverPhoto}
                      alt={driverName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-7 w-7 text-muted-foreground" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-500 border-2 border-card flex items-center justify-center">
                  <ShieldCheck className="h-3 w-3 text-white" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-lg font-bold text-foreground">{driverName}</h3>
                  <Badge variant="success" className="text-[10px] px-1.5 py-0">
                    Pro Fleet
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs font-mono text-muted-foreground">
                  <span className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="h-3.5 w-3.5 fill-amber-500" />
                    {displayCollector.rating}
                  </span>
                  <span>•</span>
                  <span>{displayCollector.totalCompleted || 1420} Pickups</span>
                </div>
              </div>
            </div>

            <Badge variant="outline" className="font-mono text-[10px] bg-background/50">
              ID: #{displayCollector.id.slice(0, 6).toUpperCase()}
            </Badge>
          </div>

          {/* Vehicle Telemetry Specs */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-muted/30 border border-border/50">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block">
                Assigned Vehicle
              </span>
              <span className="text-xs font-bold font-heading text-foreground flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-primary" />
                {vehicle.vehicleType}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block">
                License Plate
              </span>
              <span className="text-xs font-mono font-bold text-foreground bg-background px-2 py-0.5 rounded-lg border border-border/60 inline-block">
                {vehicle.plateNumber}
              </span>
            </div>
          </div>

          {/* ETA Banner */}
          <div className="p-3 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-xs font-bold text-foreground">Estimated Arrival Time</span>
            </div>
            <span className="font-mono text-sm font-extrabold text-primary">~12 Mins</span>
          </div>
        </div>

        {/* Action Buttons: Call & Message */}
        <div className="pt-6 border-t border-border/50 mt-6 relative z-10">
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleCallDriver}
              className="w-full font-mono text-xs font-bold rounded-xl border-border/80 hover:bg-muted/50 flex items-center justify-center"
            >
              <PhoneCall className="h-4 w-4 mr-2 text-green-500" />
              Call Driver
            </Button>

            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => setIsMessageModalOpen(true)}
              className="w-full font-mono text-xs font-bold rounded-xl shadow-md glow-primary flex items-center justify-center"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
          </div>
        </div>
      </Card>

      {/* In-App Messaging Modal */}
      <Dialog
        open={isMessageModalOpen}
        onOpenChange={(val) => !val && setIsMessageModalOpen(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chat with {driverName}</DialogTitle>
            <DialogDescription>End-to-end encrypted dispatch communication</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col h-80 bg-muted/20 rounded-2xl p-4 border border-border/50 my-4 overflow-y-auto space-y-3">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col max-w-[80%] ${
                  msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                }`}
              >
                <div
                  className={`px-3.5 py-2 rounded-2xl text-xs font-medium shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none font-bold'
                      : 'bg-card text-foreground border border-border/60 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] font-mono text-muted-foreground mt-1 flex items-center gap-1">
                  {msg.time}
                  {msg.sender === 'user' && <CheckCheck className="h-3 w-3 text-primary" />}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type instructions for driver..."
              className="flex-1 h-10 px-3.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono"
            />
            <Button type="submit" variant="primary" size="sm" className="h-10 px-4 rounded-xl">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
