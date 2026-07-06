import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Sparkles,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Plus,
  ArrowRight,
  ShieldAlert,
  Trash2,
  Recycle,
  Leaf,
  DollarSign,
} from 'lucide-react';

import {
  Heading,
  Text,
  Caption,
  Code,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Badge,
  Chip,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  Skeleton,
  EmptyState,
  ErrorState,
  SuccessState,
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui';
import { toast } from '@/common/notifications/toast';

const demoFormSchema = z.object({
  pickupAddress: z.string().min(5, 'Address must be at least 5 characters long'),
  wasteWeightKg: z
    .number()
    .min(1, 'Weight must be at least 1 kg')
    .max(1000, 'Max weight is 1000 kg'),
  category: z.string().min(1, 'Please select a waste category'),
});

type DemoFormValues = z.infer<typeof demoFormSchema>;

export const DesignSystemShowcase: React.FC = () => {
  const [selectedChips, setSelectedChips] = useState<string[]>(['E-Waste', 'Plastic']);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  const form = useForm<DemoFormValues>({
    resolver: zodResolver(demoFormSchema),
    defaultValues: {
      pickupAddress: '',
      wasteWeightKg: 10,
      category: 'E-Waste',
    },
  });

  const onSubmitForm = (data: DemoFormValues) => {
    setIsLoadingDemo(true);
    setTimeout(() => {
      setIsLoadingDemo(false);
      toast.success(
        'Pickup Request Simulated!',
        `Scheduled ${data.wasteWeightKg}kg of ${data.category} at ${data.pickupAddress}`,
      );
    }, 1200);
  };

  const toggleChip = (category: string) => {
    if (selectedChips.includes(category)) {
      setSelectedChips(selectedChips.filter((c) => c !== category));
    } else {
      setSelectedChips([...selectedChips, category]);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* 1. Header Section */}
      <div className="space-y-4 border-b border-border/40 pb-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink isHome to="/">
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Design System & Architecture</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs font-bold uppercase tracking-wider text-primary mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              Milestone 2 Verified Architecture
            </div>
            <Heading level={1} className="text-4xl md:text-5xl font-black">
              Apple <span className="text-primary">+</span> Airbnb{' '}
              <span className="text-primary">+</span> Linear
            </Heading>
            <Text variant="lead" className="mt-2 max-w-2xl text-muted-foreground">
              Trash Here Enterprise design system tokens, 30px+ rounded cards, lime green{' '}
              <Code>#D7FF43</Code> accents, and responsive primitives.
            </Text>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="lg"
              leftIcon={<CheckCircle className="h-5 w-5" />}
              onClick={() =>
                toast.success(
                  'System Architecture Online',
                  'All 18 design primitives compiled with zero TypeScript errors.',
                )
              }
            >
              Test Global Toast
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Color Palette & Design Tokens */}
      <section className="space-y-6">
        <div>
          <Caption>Section 01</Caption>
          <Heading level={2} className="text-2xl font-bold mt-1">
            Color Palette & Tokens
          </Heading>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-primary text-primary-foreground border-0 shadow-lg glow-primary">
            <div className="h-24 flex items-end justify-between font-bold">
              <span className="text-2xl font-black">#D7FF43</span>
              <span className="text-xs uppercase tracking-widest bg-black/10 px-2 py-1 rounded-lg">
                Primary Accent
              </span>
            </div>
          </Card>
          <Card className="p-6 bg-[#111111] text-white border-border/40 shadow-md">
            <div className="h-24 flex items-end justify-between font-bold">
              <span className="text-2xl font-black">#111111</span>
              <span className="text-xs uppercase tracking-widest bg-white/10 px-2 py-1 rounded-lg">
                Deep Black
              </span>
            </div>
          </Card>
          <Card className="p-6 bg-card text-foreground border-border/80 shadow-sm">
            <div className="h-24 flex items-end justify-between font-bold">
              <span className="text-2xl font-black">Card BG</span>
              <span className="text-xs uppercase tracking-widest bg-muted px-2 py-1 rounded-lg">
                30px+ Rounded
              </span>
            </div>
          </Card>
          <Card className="p-6 glass-card text-foreground">
            <div className="h-24 flex items-end justify-between font-bold">
              <span className="text-2xl font-black">Glassmorphism</span>
              <span className="text-xs uppercase tracking-widest bg-primary/20 text-primary px-2 py-1 rounded-lg">
                Blur-xl
              </span>
            </div>
          </Card>
        </div>
      </section>

      {/* 3. Typography & Buttons */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <Caption>Section 02</Caption>
            <CardTitle className="mt-1">Typography Hierarchy</CardTitle>
            <CardDescription>
              Poppins font headings combined with clean Inter body copy.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 divide-y divide-border/40">
            <div className="pt-2">
              <Heading level={1}>Heading 1 — Poppins Bold</Heading>
            </div>
            <div className="pt-2">
              <Heading level={3}>Heading 3 — Poppins Semibold</Heading>
            </div>
            <div className="pt-2">
              <Text variant="default">
                Body Text — Inter readable font for clean data tables and enterprise UI clarity.
              </Text>
            </div>
            <div className="pt-2">
              <Text variant="muted">
                Muted Text — For descriptions, helper notes, and timestamp annotations.
              </Text>
            </div>
            <div className="pt-2 flex items-center gap-2">
              <Caption>Status Tag</Caption> <Code>npm run build</Code>
            </div>
          </CardContent>
          <CardFooter>
            <Text variant="small">Enterprise Typography v1.0</Text>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <Caption>Section 03</Caption>
            <CardTitle className="mt-1">Button Variants & Micro-interactions</CardTitle>
            <CardDescription>
              Framer Motion spring animations with lime green glow effects.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
                Primary Glow
              </Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Outline
              </Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger" leftIcon={<Trash2 className="h-4 w-4" />}>
                Danger
              </Button>
              <Button variant="glass">Glass Button</Button>
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border/40">
              <Button size="sm" variant="primary">
                Small
              </Button>
              <Button size="md" variant="primary">
                Medium
              </Button>
              <Button size="lg" variant="primary">
                Large 30px
              </Button>
              <Button size="md" variant="outline" isLoading={true}>
                Loading State
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Text variant="small">All variants interactive and accessible</Text>
          </CardFooter>
        </Card>
      </section>

      {/* 4. Inputs, Forms & Zod Validation */}
      <section className="space-y-6">
        <div>
          <Caption>Section 04</Caption>
          <Heading level={2} className="text-2xl font-bold mt-1">
            Form Validation & Inputs
          </Heading>
        </div>
        <Card className="p-8 max-w-2xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-6">
              <FormField
                control={form.control}
                name="pickupAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pickup Street Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. 1600 Amphitheatre Pkwy, Mountain View"
                        leftIcon={<Search className="h-4 w-4" />}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="wasteWeightKg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Weight (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waste Category</FormLabel>
                      <FormControl>
                        <Input placeholder="E-Waste, Plastic, Organic..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoadingDemo}
                className="w-full"
              >
                Simulate Schedule Pickup
              </Button>
            </form>
          </Form>
        </Card>
      </section>

      {/* 5. Data Tables, Badges & Chips */}
      <section className="space-y-6">
        <div>
          <Caption>Section 05</Caption>
          <Heading level={2} className="text-2xl font-bold mt-1">
            Linear Data Tables, Badges & Chips
          </Heading>
        </div>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-2 flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-primary" /> Filter Categories:
          </span>
          {['E-Waste', 'Plastic', 'Organic', 'Metal', 'Hazardous'].map((cat) => (
            <Chip
              key={cat}
              selected={selectedChips.includes(cat)}
              onClick={() => toggleChip(cat)}
              onRemove={selectedChips.includes(cat) ? () => toggleChip(cat) : undefined}
            >
              {cat}
            </Chip>
          ))}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pickup ID</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Est. Payout</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-mono font-bold">#REQ-8921</TableCell>
              <TableCell className="font-semibold flex items-center gap-2">
                <Recycle className="h-4 w-4 text-primary" /> E-Waste
              </TableCell>
              <TableCell>45.0 kg</TableCell>
              <TableCell>
                <Badge variant="success">Completed</Badge>
              </TableCell>
              <TableCell className="font-bold text-green-600 dark:text-green-400">
                $112.50
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono font-bold">#REQ-8922</TableCell>
              <TableCell className="font-semibold flex items-center gap-2">
                <Leaf className="h-4 w-4 text-amber-500" /> Organic
              </TableCell>
              <TableCell>120.0 kg</TableCell>
              <TableCell>
                <Badge variant="default">En Route</Badge>
              </TableCell>
              <TableCell className="font-bold">$24.00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono font-bold">#REQ-8923</TableCell>
              <TableCell className="font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-500" /> Metal
              </TableCell>
              <TableCell>310.0 kg</TableCell>
              <TableCell>
                <Badge variant="warning">Pending</Badge>
              </TableCell>
              <TableCell className="font-bold">$465.00</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      {/* 6. Overlays: Dialogs, Drawers & Toasts */}
      <section className="space-y-6">
        <div>
          <Caption>Section 06</Caption>
          <Heading level={2} className="text-2xl font-bold mt-1">
            Dialogs, Drawers & Notifications
          </Heading>
        </div>
        <Card className="p-8 flex flex-wrap gap-6 items-center">
          {/* Dialog Modal Demo */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="primary" size="md">
                Open Apple Modal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Eco-Pickup</DialogTitle>
                <DialogDescription>
                  Your assigned collector is 3 minutes away. Please ensure QR code is ready for
                  contactless verification.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 flex items-center justify-center">
                <div className="h-40 w-40 rounded-3xl bg-muted border-2 border-dashed border-primary flex items-center justify-center text-xs font-mono text-muted-foreground">
                  [SIMULATED QR CODE]
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button variant="primary">Verify & Complete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Drawer Demo */}
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline" size="md">
                Open Slide-Over Drawer
              </Button>
            </DrawerTrigger>
            <DrawerContent side="right">
              <DrawerHeader>
                <DrawerTitle>Collector Vehicle Profile</DrawerTitle>
                <DrawerDescription>
                  Detailed inspection of assigned transport unit.
                </DrawerDescription>
              </DrawerHeader>
              <div className="py-6 space-y-4 flex-1">
                <Card className="p-4 bg-muted/40 border-0">
                  <Text variant="small">License Plate</Text>
                  <Text className="font-mono font-bold text-lg">CA-8829-ECO</Text>
                </Card>
                <Card className="p-4 bg-muted/40 border-0">
                  <Text variant="small">Max Capacity</Text>
                  <Text className="font-bold text-lg">1,500 kg Heavy Freight</Text>
                </Card>
              </div>
              <DrawerFooter>
                <Button variant="primary" className="w-full">
                  Contact Driver
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          {/* Toast Triggers */}
          <Button
            variant="ghost"
            leftIcon={<AlertCircle className="h-4 w-4 text-destructive" />}
            onClick={() => toast.error('Verification Failed', 'QR code expired. Please refresh.')}
          >
            Trigger Error Toast
          </Button>
          <Button
            variant="ghost"
            leftIcon={<ShieldAlert className="h-4 w-4 text-blue-500" />}
            onClick={() => toast.info('System Security', 'RBAC enterprise permissions verified.')}
          >
            Trigger Info Toast
          </Button>
        </Card>
      </section>

      {/* 7. States: Skeletons, Empty, Error, Success */}
      <section className="space-y-6">
        <div>
          <Caption>Section 07</Caption>
          <Heading level={2} className="text-2xl font-bold mt-1">
            Loading Skeletons & System States
          </Heading>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 space-y-4">
            <Skeleton variant="rectangular" height={160} />
            <Skeleton variant="text" />
            <Skeleton variant="text" width="60%" />
          </Card>

          <EmptyState
            title="No Active Pickups"
            description="You have not scheduled any waste collections for this week."
            actionLabel="Book New Pickup"
            onAction={() => toast.success('Redirecting to booking flow...')}
          />

          <ErrorState
            title="Connection Timeout"
            message="Unable to reach telematics satellite. Retrying connection in background."
            onRetry={() => toast.info('Reconnecting to telematics node...')}
          />

          <SuccessState
            title="Reward Redeemed!"
            description="You earned +500 Eco Points and offset 42kg of CO2."
            actionLabel="View Wallet Balance"
            onAction={() => toast.info('Opening wallet view...')}
          />
        </div>
      </section>
    </div>
  );
};
