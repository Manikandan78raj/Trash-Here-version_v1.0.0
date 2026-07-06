import { motion } from 'framer-motion';
import { PlusCircle, History, Gift, Wallet, ArrowUpRight } from 'lucide-react';
import { Card, Heading, Text } from '@/components/ui';

interface QuickActionsGridProps {
  onBookPickup?: () => void;
  onViewHistory?: () => void;
  onViewRewards?: () => void;
  onViewWallet?: () => void;
}

export const QuickActionsGrid = ({
  onBookPickup,
  onViewHistory,
  onViewRewards,
  onViewWallet,
}: QuickActionsGridProps) => {
  const actions = [
    {
      title: 'Book Pickup',
      description: 'Schedule AI-verified waste collection at your doorstep',
      icon: <PlusCircle className="h-7 w-7 text-primary" />,
      onClick: onBookPickup,
      badge: '4-Step Flow',
      bgHover: 'hover:border-primary/60 hover:bg-primary/5',
      primary: true,
    },
    {
      title: 'View History',
      description: 'Review completed pickups, weights, and carbon offsets',
      icon: <History className="h-7 w-7 text-emerald-400" />,
      onClick: onViewHistory,
      badge: 'Logs',
      bgHover: 'hover:border-emerald-500/50 hover:bg-emerald-500/5',
      primary: false,
    },
    {
      title: 'Rewards Store',
      description: 'Redeem Green Points for partner discount vouchers',
      icon: <Gift className="h-7 w-7 text-purple-400" />,
      onClick: onViewRewards,
      badge: 'Catalog',
      bgHover: 'hover:border-purple-500/50 hover:bg-purple-500/5',
      primary: false,
    },
    {
      title: 'Wallet & Payouts',
      description: 'Manage cash balances, earnings, and bank withdrawals',
      icon: <Wallet className="h-7 w-7 text-amber-400" />,
      onClick: onViewWallet,
      badge: 'Finance',
      bgHover: 'hover:border-amber-500/50 hover:bg-amber-500/5',
      primary: false,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Heading level={2} className="text-xl md:text-2xl font-bold tracking-tight">
            Quick Actions
          </Heading>
          <Text variant="small" className="text-muted-foreground">
            Fast access to core marketplace services and financial tools
          </Text>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {actions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, delay: index * 0.06 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            className="h-full"
          >
            <Card
              onClick={action.onClick}
              className={`group relative h-full flex flex-col justify-between p-6 cursor-pointer border-border/60 bg-card/80 backdrop-blur-xl shadow-md transition-all duration-300 ${action.bgHover} ${action.primary ? 'border-primary/40 shadow-primary/5' : ''}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-background/90 border border-border/50 shadow-sm group-hover:scale-110 transition-transform duration-300">
                    {action.icon}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-semibold">
                      {action.badge}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                  </div>
                </div>

                <Heading
                  level={3}
                  className="text-lg font-bold font-heading group-hover:text-primary transition-colors"
                >
                  {action.title}
                </Heading>

                <Text
                  variant="small"
                  className="text-muted-foreground text-xs mt-1.5 block line-clamp-2"
                >
                  {action.description}
                </Text>
              </div>

              <div className="mt-6 pt-3 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                <span>Launch Service</span>
                <span className="font-mono text-primary">→</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
