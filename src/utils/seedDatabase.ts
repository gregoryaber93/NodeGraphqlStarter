import { PrismaClient } from '@prisma/client';
import seedData from '../data/data.json';

export async function seedDatabase(prisma: PrismaClient) {
  try {
    // Check if database is empty
    const userCount = await prisma.user.count();
    const offerCount = await prisma.offer.count();
    const bookingCount = await prisma.booking.count();

    if (userCount > 0 || offerCount > 0 || bookingCount > 0) {
      console.log('📊 Database is not empty. Skipping seed.');
      console.log(`   Users: ${userCount}, Offers: ${offerCount}, Bookings: ${bookingCount}`);
      return;
    }

    console.log('🌱 Seeding database with sample data...');

    // Seed Users
    const users = await Promise.all(
      seedData.users.map((user) =>
        prisma.user.create({
          data: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        })
      )
    );
    console.log(`✅ Created ${users.length} users`);

    // Seed Offers
    const offers = await Promise.all(
      seedData.offers.map((offer) =>
        prisma.offer.create({
          data: {
            id: offer.id,
            destination: offer.destination,
            price: offer.price,
            transportType: offer.transportType,
            availableFrom: offer.availableFrom,
            availableTo: offer.availableTo,
          },
        })
      )
    );
    console.log(`✅ Created ${offers.length} offers`);

    // Seed Bookings
    const bookings = await Promise.all(
      seedData.bookings.map((booking) =>
        prisma.booking.create({
          data: {
            id: booking.id,
            userId: booking.userId,
            offerId: booking.offerId,
            status: booking.status as 'PENDING' | 'CONFIRMED' | 'CANCELLED',
            updatedAt: new Date(booking.updatedAt),
          },
        })
      )
    );
    console.log(`✅ Created ${bookings.length} bookings`);

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

