import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Seed industries
  const industries = [
    {
      id: 'tour',
      name: 'Tour Management',
      description: 'Complete tour package management system with booking, customer management, and itinerary planning',
      isActive: true
    },
    {
      id: 'travel',
      name: 'Travel Services',
      description: 'Comprehensive travel services including flight/hotel booking, trip planning, and customer management',
      isActive: true
    },
    {
      id: 'logistics',
      name: 'Logistics & Shipping',
      description: 'Full logistics management with shipment tracking, route optimization, and delivery scheduling',
      isActive: true
    },
    {
      id: 'other',
      name: 'Other Industries',
      description: 'General business management system adaptable to various industries',
      isActive: true
    }
  ];

  console.log('📋 Seeding industries...');
  
  for (const industry of industries) {
    const existingIndustry = await prisma.industry.findUnique({
      where: { id: industry.id }
    });

    if (!existingIndustry) {
      await prisma.industry.create({
        data: industry
      });
      console.log(`✅ Created industry: ${industry.name}`);
    } else {
      console.log(`⏭️  Industry already exists: ${industry.name}`);
    }
  }

  // Get industry references for gamification seeding
  const tourIndustry = await prisma.industry.findUnique({ where: { id: 'tour' } });
  const travelIndustry = await prisma.industry.findUnique({ where: { id: 'travel' } });
  const logisticsIndustry = await prisma.industry.findUnique({ where: { id: 'logistics' } });

  if (!tourIndustry || !travelIndustry || !logisticsIndustry) {
    throw new Error('Required industries not found');
  }

  console.log('🏆 Seeding gamification badges...');

  // Create initial badges for Tour industry
  const tourBadges = [
    {
      name: 'Tour Guide Rookie',
      description: 'Complete your first tour package',
      category: 'ACHIEVEMENT',
      industry: 'tour',
      criteria: JSON.stringify({ tours_completed: 1 }),
      iconUrl: '/badges/tour-rookie.svg',
      points: 50,
    },
    {
      name: 'Explorer',
      description: 'Create 5 tour packages',
      category: 'ACHIEVEMENT',
      industry: 'tour',
      criteria: JSON.stringify({ packages_created: 5 }),
      iconUrl: '/badges/explorer.svg',
      points: 100,
    },
    {
      name: 'Adventure Master',
      description: 'Complete 25 successful tours',
      category: 'ACHIEVEMENT',
      industry: 'tour',
      criteria: JSON.stringify({ tours_completed: 25 }),
      iconUrl: '/badges/adventure-master.svg',
      points: 250,
    },
    {
      name: '30-Day Tour Streak',
      description: 'Complete tours for 30 consecutive days',
      category: 'SPECIAL',
      industry: 'tour',
      criteria: JSON.stringify({ consecutive_days: 30 }),
      iconUrl: '/badges/streak-30.svg',
      points: 200,
    },
    {
      name: 'Customer Champion Tour',
      description: 'Achieve 4.8+ average rating',
      category: 'SPECIAL',
      industry: 'tour',
      criteria: JSON.stringify({ min_rating: 4.8, min_reviews: 10 }),
      iconUrl: '/badges/champion.svg',
      points: 150,
    },
  ];

  // Create initial badges for Travel industry
  const travelBadges = [
    {
      name: 'Travel Planner',
      description: 'Complete your first travel booking',
      category: 'ACHIEVEMENT',
      industry: 'travel',
      criteria: JSON.stringify({ bookings_completed: 1 }),
      iconUrl: '/badges/travel-planner.svg',
      points: 50,
    },
    {
      name: 'Jet Setter',
      description: 'Complete 10 international bookings',
      category: 'MILESTONE',
      industry: 'travel',
      criteria: JSON.stringify({ international_bookings: 10 }),
      iconUrl: '/badges/jet-setter.svg',
      points: 150,
    },
    {
      name: 'Globe Trotter',
      description: 'Book travel to 15 different countries',
      category: 'MILESTONE',
      industry: 'travel',
      criteria: JSON.stringify({ countries_visited: 15 }),
      iconUrl: '/badges/globe-trotter.svg',
      points: 300,
    },
    {
      name: 'Quick Booker',
      description: 'Complete 5 same-day bookings',
      category: 'SPECIAL',
      industry: 'travel',
      criteria: JSON.stringify({ same_day_bookings: 5 }),
      iconUrl: '/badges/quick-booker.svg',
      points: 100,
    },
    {
      name: 'VIP Agent',
      description: 'Handle premium bookings worth $10,000+',
      category: 'REVENUE',
      industry: 'travel',
      criteria: JSON.stringify({ premium_value: 10000 }),
      iconUrl: '/badges/vip-agent.svg',
      points: 250,
    },
  ];

  // Create initial badges for Logistics industry
  const logisticsBadges = [
    {
      name: 'Delivery Rookie',
      description: 'Complete your first shipment',
      category: 'ACHIEVEMENT',
      industry: 'logistics',
      criteria: JSON.stringify({ shipments_completed: 1 }),
      iconUrl: '/badges/delivery-rookie.svg',
      points: 50,
    },
    {
      name: 'Speed Demon',
      description: 'Complete 20 express deliveries',
      category: 'SPECIAL',
      industry: 'logistics',
      criteria: JSON.stringify({ express_deliveries: 20 }),
      iconUrl: '/badges/speed-demon.svg',
      points: 120,
    },
    {
      name: 'Cargo Master',
      description: 'Handle 100 successful shipments',
      category: 'MILESTONE',
      industry: 'logistics',
      criteria: JSON.stringify({ shipments_completed: 100 }),
      iconUrl: '/badges/cargo-master.svg',
      points: 200,
    },
    {
      name: 'On-Time Hero',
      description: 'Maintain 95% on-time delivery rate',
      category: 'SPECIAL',
      industry: 'logistics',
      criteria: JSON.stringify({ on_time_rate: 0.95, min_deliveries: 50 }),
      iconUrl: '/badges/on-time-hero.svg',
      points: 180,
    },
    {
      name: 'Long Haul Champion',
      description: 'Complete 10 cross-country shipments',
      category: 'MILESTONE',
      industry: 'logistics',
      criteria: JSON.stringify({ long_haul_shipments: 10 }),
      iconUrl: '/badges/long-haul.svg',
      points: 160,
    },
  ];

  // Insert badges for each industry
  for (const badgeData of [...tourBadges, ...travelBadges, ...logisticsBadges]) {
    await prisma.badge.upsert({
      where: { name: badgeData.name },
      update: {
        description: badgeData.description,
        category: badgeData.category as any,
        industry: badgeData.industry,
        criteria: badgeData.criteria,
        iconUrl: badgeData.iconUrl,
        points: badgeData.points,
      },
      create: {
        ...badgeData,
        category: badgeData.category as any, // Cast to enum
      },
    });
  }

  console.log(' Database seeding completed successfully!');
  console.log('📊 Created:');
  console.log(`   - 4 industries`);
  console.log(`   - ${tourBadges.length + travelBadges.length + logisticsBadges.length} badges`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });