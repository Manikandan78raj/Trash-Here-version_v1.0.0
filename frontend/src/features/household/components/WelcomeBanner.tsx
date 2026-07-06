import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, Award } from 'lucide-react';
import { Card, Heading, Text, Button, Skeleton, Badge } from '@/components/ui';
import { useUserProfile, useEcoScore } from '../api/household.api';

export const WelcomeBanner = () => {
  const {
    data: profile,
    isLoading: isProfileLoading,
    isError: isProfileError,
    refetch: refetchProfile,
  } = useUserProfile();

  const {
    data: ecoMetrics,
    isLoading: isEcoLoading,
    isError: isEcoError,
    refetch: refetchEco,
  } = useEcoScore();

  const isLoading = isProfileLoading || isEcoLoading;
  const isError = isProfileError || isEcoError;

  if (isLoading) {
    return (
      <Card className="p-6 md:p-8 border-border/50 bg-card/60 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 w-full md:w-2/3">
            <Skeleton variant="text" width="60%" height="2rem" />
            <Skeleton variant="text" width="80%" height="1.2rem" />
          </div>
          <Skeleton variant="circular" width="64px" height="64px" />
        </div>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="p-6 md:p-8 border-destructive/30 bg-destructive/5 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Heading level={3} className="text-destructive">
              Unable to load profile data
            </Heading>
            <Text variant="small" className="text-muted-foreground mt-1">
              There was a network exception communicating with the enterprise profile service.
            </Text>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={() => {
              void refetchProfile();
              void refetchEco();
            }}
          >
            Retry Connection
          </Button>
        </div>
      </Card>
    );
  }

  const userName = profile?.fullName || 'Eco Citizen';
  const tierLevel = ecoMetrics?.tierLevel || 'Sustainability Starter';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Card className="relative overflow-hidden p-6 md:p-8 border-primary/20 bg-gradient-to-br from-card/90 via-card/80 to-primary/5 backdrop-blur-2xl shadow-xl">
        {/* Decorative background glow */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="default" size="sm" className="font-semibold tracking-wide">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                {tierLevel}
              </Badge>
              <Text variant="muted" className="text-xs font-mono">
                ID: {profile?.id ? `${profile.id.slice(0, 8)}...` : 'TRSH-8842'}
              </Text>
            </div>

            <Heading
              level={1}
              className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight"
            >
              Welcome back, <span className="text-primary font-heading">{userName}</span>
            </Heading>

            <Text variant="default" className="text-muted-foreground max-w-2xl">
              Your AI-powered waste management dashboard is ready. Schedule pickups, track your
              carbon offset, and redeem green rewards in real time.
            </Text>
          </div>

          <div className="flex items-center gap-4 self-end md:self-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/20 border-2 border-primary shadow-lg shadow-primary/20">
              <Award className="h-8 w-8 text-primary" />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
