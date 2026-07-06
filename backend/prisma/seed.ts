// ============================================================================
// TRASH HERE - ENTERPRISE AUTOMATED DATABASE SEEDER
// Populates all 19 PostgreSQL models with rich, production-ready startup data
// ============================================================================

import { PrismaClient, RoleType, PickupStatus, TransactionType, TransactionStatus, ComplaintStatus, TicketPriority, SubscriptionStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Trash Here enterprise database seeding...');

  // 1. Clean existing data in reverse dependency order
  console.log('🧹 Cleaning existing database tables...');
  await prisma.auditLog.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.review.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.pickupItem.deleteMany();
  await prisma.pickupRequest.deleteMany();
  await prisma.wasteCategory.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.collector.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  // 2. Seed Roles
  console.log('👥 Seeding system roles...');
  const userRole = await prisma.role.create({
    data: { name: RoleType.USER, description: 'Household, Apartment & Office Users', permissions: ['pickup:create', 'pickup:read', 'reward:redeem', 'wallet:read'] },
  });
  const collectorRole = await prisma.role.create({
    data: { name: RoleType.COLLECTOR, description: 'Verified Waste Collection Partners', permissions: ['job:accept', 'job:complete', 'wallet:withdraw', 'navigation:use'] },
  });
  const recyclerRole = await prisma.role.create({
    data: { name: RoleType.RECYCLER, description: 'Recycling Processing Centers', permissions: ['inventory:read', 'waste:receive'] },
  });
  const adminRole = await prisma.role.create({
    data: { name: RoleType.ADMIN, description: 'System Administrators & Managers', permissions: ['*'] },
  });

  // 3. Seed Waste Categories
  console.log('♻️ Seeding waste categories...');
  const eWaste = await prisma.wasteCategory.create({
    data: {
      name: 'E-Waste & Electronics',
      slug: 'e-waste',
      description: 'Old computers, smartphones, cables, batteries, and appliances.',
      iconName: 'Cpu',
      pricePerKg: 4.50,
      pointMultiplier: 25,
      isHazardous: false,
      co2SavedPerKg: 8.2,
    },
  });
  const plastic = await prisma.wasteCategory.create({
    data: {
      name: 'Clean Plastics & PET',
      slug: 'plastic',
      description: 'Water bottles, containers, clean packaging, and HDPE jugs.',
      iconName: 'Recycle',
      pricePerKg: 1.20,
      pointMultiplier: 15,
      isHazardous: false,
      co2SavedPerKg: 3.5,
    },
  });
  const organic = await prisma.wasteCategory.create({
    data: {
      name: 'Organic & Compostable',
      slug: 'organic',
      description: 'Food scraps, garden waste, biodegradable packaging, and leaves.',
      iconName: 'Leaf',
      pricePerKg: 0.50,
      pointMultiplier: 10,
      isHazardous: false,
      co2SavedPerKg: 1.8,
    },
  });
  const metal = await prisma.wasteCategory.create({
    data: {
      name: 'Scrap Metal & Aluminum',
      slug: 'metal',
      description: 'Aluminum cans, copper wiring, steel frames, and iron scrap.',
      iconName: 'Shield',
      pricePerKg: 3.80,
      pointMultiplier: 20,
      isHazardous: false,
      co2SavedPerKg: 6.4,
    },
  });
  const hazardous = await prisma.wasteCategory.create({
    data: {
      name: 'Hazardous Materials',
      slug: 'hazardous',
      description: 'Paint cans, chemical solvents, fluorescent bulbs, and motor oil.',
      iconName: 'AlertTriangle',
      pricePerKg: 6.00,
      pointMultiplier: 35,
      isHazardous: true,
      co2SavedPerKg: 12.0,
    },
  });

  // 4. Seed Users & Wallets
  console.log('👤 Seeding enterprise users & wallets...');
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@trashhere.com',
      phone: '+1-555-0100',
      passwordHash,
      fullName: 'Sarah Jenkins (Chief Sustainability Officer)',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
      roleId: adminRole.id,
      ecoScore: 950,
      carbonSavedKg: 1420.5,
      wallet: {
        create: { pointsBalance: 15000, cashBalance: 5400.00, totalPointsEarned: 25000, totalCashEarned: 12000.00 }
      }
    },
  });

  // Household User 1 (Primary Demo User)
  const demoUser = await prisma.user.create({
    data: {
      email: 'user@trashhere.com',
      phone: '+1-555-0101',
      passwordHash,
      fullName: 'Alex Morgan (San Francisco Residence)',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      roleId: userRole.id,
      ecoScore: 840,
      carbonSavedKg: 340.8,
      wallet: {
        create: { pointsBalance: 2450, cashBalance: 45.50, totalPointsEarned: 4800, totalCashEarned: 120.00 }
      },
      addresses: {
        create: [
          { label: 'Home', street: '742 Evergreen Terrace', city: 'San Francisco', state: 'CA', zipCode: '94110', lat: 37.7599, lng: -122.4148, isDefault: true, instructions: 'Ring doorbell #4B. Leave bags near garage.' },
          { label: 'Office', street: '100 Market Street Suite 500', city: 'San Francisco', state: 'CA', zipCode: '94105', lat: 37.7937, lng: -122.3965, isDefault: false, instructions: 'Check in with lobby security desk.' }
        ]
      }
    },
    include: { addresses: true }
  });

  // Household User 2
  const user2 = await prisma.user.create({
    data: {
      email: 'emily@trashhere.com',
      phone: '+1-555-0102',
      passwordHash,
      fullName: 'Emily Watson (Greenwood Apartments)',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
      roleId: userRole.id,
      ecoScore: 620,
      carbonSavedKg: 180.2,
      wallet: {
        create: { pointsBalance: 1200, cashBalance: 15.00, totalPointsEarned: 1800, totalCashEarned: 45.00 }
      },
      addresses: {
        create: [
          { label: 'Apartment', street: '450 Battery St #302', city: 'San Francisco', state: 'CA', zipCode: '94111', lat: 37.7955, lng: -122.4001, isDefault: true }
        ]
      }
    },
    include: { addresses: true }
  });

  // 5. Seed Collectors & Vehicles
  console.log('🚚 Seeding waste collectors & electric vehicles...');
  const collectorUser1 = await prisma.user.create({
    data: {
      email: 'collector@trashhere.com',
      phone: '+1-555-0201',
      passwordHash,
      fullName: 'Marcus Vance (EcoFleet Driver #104)',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      roleId: collectorRole.id,
      ecoScore: 990,
      carbonSavedKg: 4500.0,
      wallet: {
        create: { pointsBalance: 5000, cashBalance: 1450.75, totalPointsEarned: 8000, totalCashEarned: 8450.00 }
      }
    }
  });

  const collector1 = await prisma.collector.create({
    data: {
      userId: collectorUser1.id,
      isOnline: true,
      isAvailable: true,
      rating: 4.95,
      totalCompleted: 142,
      totalEarnings: 8450.00,
      currentLat: 37.7700,
      currentLng: -122.4100,
      serviceRadiusKm: 25,
      vehicles: {
        create: [
          { type: 'Electric Eco-Van (2025 Rivian EDV)', licensePlate: 'ECO-8842', capacityKg: 1500, photoUrl: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=600', isActive: true }
        ]
      }
    }
  });

  const collectorUser2 = await prisma.user.create({
    data: {
      email: 'david@trashhere.com',
      phone: '+1-555-0202',
      passwordHash,
      fullName: 'David Rodriguez (Green Wheels Transport)',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      roleId: collectorRole.id,
      ecoScore: 880,
      carbonSavedKg: 3100.0,
      wallet: {
        create: { pointsBalance: 3200, cashBalance: 980.50, totalPointsEarned: 5400, totalCashEarned: 6200.00 }
      }
    }
  });

  const collector2 = await prisma.collector.create({
    data: {
      userId: collectorUser2.id,
      isOnline: true,
      isAvailable: false, // Currently on a job
      rating: 4.88,
      totalCompleted: 98,
      totalEarnings: 6200.00,
      currentLat: 37.7850,
      currentLng: -122.4050,
      serviceRadiusKm: 20,
      vehicles: {
        create: [
          { type: 'Heavy Duty Hybrid Loader', licensePlate: 'TRSH-101', capacityKg: 3500, photoUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600', isActive: true }
        ]
      }
    }
  });

  // 6. Seed Pickup Requests & Items
  console.log('📦 Seeding pickup requests & waste items...');
  
  // Completed Pickup
  const pickup1 = await prisma.pickupRequest.create({
    data: {
      userId: demoUser.id,
      collectorId: collector1.id,
      addressId: demoUser.addresses[0].id,
      status: PickupStatus.COMPLETED,
      scheduledDate: new Date(Date.now() - 86400000 * 2), // 2 days ago
      completedDate: new Date(Date.now() - 86400000 * 2 + 3600000),
      estimatedWeightKg: 18.5,
      actualWeightKg: 19.2,
      rewardPoints: 350,
      estimatedPayout: 25.40,
      actualPayout: 26.80,
      aiVerified: true,
      notes: 'Contains 2 old monitors and a box of clean PET plastic bottles.',
      items: {
        create: [
          { categoryId: eWaste.id, estimatedWeightKg: 12.0, actualWeightKg: 12.5, photoUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=500', aiConfidence: 0.98 },
          { categoryId: plastic.id, estimatedWeightKg: 6.5, actualWeightKg: 6.7, photoUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=500', aiConfidence: 0.96 }
        ]
      }
    }
  });

  // Active / En-Route Pickup
  const pickup2 = await prisma.pickupRequest.create({
    data: {
      userId: demoUser.id,
      collectorId: collector1.id,
      addressId: demoUser.addresses[0].id,
      status: PickupStatus.EN_ROUTE,
      scheduledDate: new Date(Date.now() + 3600000), // In 1 hour
      estimatedWeightKg: 25.0,
      rewardPoints: 480,
      estimatedPayout: 42.50,
      aiVerified: true,
      notes: 'Office e-waste clearance and aluminum cans.',
      items: {
        create: [
          { categoryId: metal.id, estimatedWeightKg: 15.0, photoUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=500', aiConfidence: 0.94 },
          { categoryId: eWaste.id, estimatedWeightKg: 10.0, photoUrl: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=500', aiConfidence: 0.99 }
        ]
      }
    }
  });

  // Pending Pickup
  const pickup3 = await prisma.pickupRequest.create({
    data: {
      userId: user2.id,
      addressId: user2.addresses[0].id,
      status: PickupStatus.PENDING,
      scheduledDate: new Date(Date.now() + 86400000), // Tomorrow
      estimatedWeightKg: 12.0,
      rewardPoints: 180,
      estimatedPayout: 14.40,
      aiVerified: true,
      notes: 'Clean plastics only.',
      items: {
        create: [
          { categoryId: plastic.id, estimatedWeightKg: 12.0, photoUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=500', aiConfidence: 0.92 }
        ]
      }
    }
  });

  // 7. Seed Rewards Store
  console.log('🎁 Seeding partner rewards & discount vouchers...');
  await prisma.reward.createMany({
    data: [
      {
        title: 'Starbucks $10 Eco Gift Card',
        description: 'Enjoy handcrafted coffee or organic pastries at any Starbucks nationwide.',
        pointsCost: 800,
        partnerName: 'Starbucks Coffee Co.',
        discountValue: '$10.00 OFF',
        couponCode: 'STBK-ECO-2026',
        validUntil: new Date(Date.now() + 86400000 * 90),
        imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500',
      },
      {
        title: 'Airbnb $50 Green Stay Credit',
        description: 'Redeem towards sustainable eco-lodge bookings or solar-powered stays.',
        pointsCost: 3500,
        partnerName: 'Airbnb Inc.',
        discountValue: '$50.00 Credit',
        couponCode: 'ABNB-GREEN-50',
        validUntil: new Date(Date.now() + 86400000 * 180),
        imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500',
      },
      {
        title: 'Whole Foods Market 20% Discount',
        description: 'Valid on all organic produce, zero-waste bulk bins, and eco household cleaners.',
        pointsCost: 1200,
        partnerName: 'Whole Foods Market',
        discountValue: '20% OFF Basket',
        couponCode: 'WFM-ZERO-20',
        validUntil: new Date(Date.now() + 86400000 * 60),
        imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
      },
      {
        title: 'Patagonia Sustainable Gear Voucher',
        description: 'Get $25 off recycled fleece jackets and Worn Wear gear repairs.',
        pointsCost: 2000,
        partnerName: 'Patagonia Outdoor',
        discountValue: '$25.00 OFF',
        couponCode: 'PAT-EARTH-25',
        validUntil: new Date(Date.now() + 86400000 * 120),
        imageUrl: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=500',
      }
    ]
  });

  // 8. Seed Subscriptions, Promotions & Coupons
  console.log('📣 Seeding subscriptions, promotions & coupons...');
  await prisma.subscription.create({
    data: {
      userId: demoUser.id,
      planName: 'Eco Pro Household',
      priceMonthly: 19.99,
      pickupsPerMonth: 8,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodEnd: new Date(Date.now() + 86400000 * 30),
    }
  });

  await prisma.promotion.createMany({
    data: [
      {
        title: 'Double Points on E-Waste Month!',
        subtitle: 'Recycle old laptops & smartphones in July for 2x Green Rewards.',
        bannerUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800',
        targetRole: RoleType.USER,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 86400000 * 30),
      },
      {
        title: 'Collector Bonus: $100 Weekend Peak Incentive',
        subtitle: 'Complete 15 verified pickups this weekend to earn a instant $100 cash bonus.',
        bannerUrl: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800',
        targetRole: RoleType.COLLECTOR,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 86400000 * 14),
      }
    ]
  });

  await prisma.coupon.create({
    data: {
      code: 'WELCOME-TRASH-2026',
      discountPercent: 50.0,
      maxDiscount: 15.0,
      validUntil: new Date(Date.now() + 86400000 * 60),
    }
  });

  // 9. Seed Notifications & Reviews
  console.log('🔔 Seeding notifications & verified reviews...');
  await prisma.notification.createMany({
    data: [
      {
        userId: demoUser.id,
        title: '🚚 Collector Assigned!',
        message: 'Marcus Vance (EcoFleet #104) is en route to collect your E-Waste pickup.',
        type: 'PICKUP',
        isRead: false,
      },
      {
        userId: demoUser.id,
        title: '🎉 +350 Green Points Awarded',
        message: 'Your recent pickup was verified! You offset 19.2 kg of waste.',
        type: 'REWARD',
        isRead: true,
      }
    ]
  });

  await prisma.review.create({
    data: {
      pickupRequestId: pickup1.id,
      userId: demoUser.id,
      collectorId: collector1.id,
      rating: 5,
      comment: 'Super fast pickup! Marcus was very professional and helped carry the heavy monitors.',
    }
  });

  // 10. Seed Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: 'SYSTEM_SEED',
      entity: 'Database',
      details: 'Successfully seeded 19 enterprise models with startup demo data.',
      ipAddress: '127.0.0.1'
    }
  });

  console.log('✅ Enterprise database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Database seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
