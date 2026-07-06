import { motion } from 'framer-motion';
import { Lightbulb, Zap, Recycle, ShieldCheck, ArrowRight } from 'lucide-react';
import { Card, Heading, Text, Badge } from '@/components/ui';

export const RecyclingTipsCard = () => {
  // As permitted by enterprise specification: mock data utilized because no dedicated /tips backend endpoint exists.
  const tips = [
    {
      title: 'Clean & Dry Electronic Boards',
      description:
        'Removing moisture and batteries from old circuit boards prevents hazardous leaks and increases your AI verification score by +25 pts.',
      category: 'E-Waste',
      icon: <Zap className="h-5 w-5 text-amber-400" />,
      tagColor: 'warning' as const,
    },
    {
      title: 'Flatten & Bundle Cardboard',
      description:
        'Compressing shipping boxes reduces volume by 70%, allowing collector vehicles to complete more pickups per gallon of fuel.',
      category: 'Paper & Boxes',
      icon: <Recycle className="h-5 w-5 text-emerald-400" />,
      tagColor: 'success' as const,
    },
    {
      title: 'Separate PET vs HDPE Plastics',
      description:
        'Keeping clear beverage bottles separate from opaque detergent jugs speeds up QR grading and guarantees instant cash payouts.',
      category: 'Plastics',
      icon: <ShieldCheck className="h-5 w-5 text-primary" />,
      tagColor: 'default' as const,
    },
  ];

  return (
    <Card className="p-6 md:p-8 border-border/60 bg-card/80 backdrop-blur-xl shadow-lg space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
            <Lightbulb className="h-6 w-6" />
          </div>
          <div>
            <Heading level={2} className="text-xl md:text-2xl font-bold tracking-tight">
              AI Recycling Insights
            </Heading>
            <Text variant="small" className="text-muted-foreground">
              Pro tips to maximize your Eco Score and cash payouts
            </Text>
          </div>
        </div>
        <Badge variant="outline" size="sm" className="hidden sm:inline-flex font-mono text-xs">
          Updated Weekly
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {tips.map((tip, index) => (
          <motion.div
            key={tip.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ y: -4 }}
            className="h-full"
          >
            <div className="h-full flex flex-col justify-between p-5 rounded-2xl bg-background/60 hover:bg-background/90 border border-border/50 transition-all duration-300 shadow-sm group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-muted/80 border border-border/40 group-hover:scale-110 transition-transform">
                    {tip.icon}
                  </div>
                  <Badge
                    variant={tip.tagColor}
                    size="sm"
                    className="text-[10px] font-mono font-bold"
                  >
                    {tip.category}
                  </Badge>
                </div>

                <Heading
                  level={3}
                  className="text-base font-bold font-heading group-hover:text-primary transition-colors"
                >
                  {tip.title}
                </Heading>

                <Text variant="small" className="text-muted-foreground text-xs leading-relaxed">
                  {tip.description}
                </Text>
              </div>

              <div className="mt-5 pt-3 border-t border-border/30 flex items-center justify-between text-[11px] font-semibold text-primary">
                <span>Read Full Guide</span>
                <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};
