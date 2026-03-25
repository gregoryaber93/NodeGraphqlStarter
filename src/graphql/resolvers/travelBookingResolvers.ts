import { GraphQLResolvers, GraphQLResolver } from '../../types/graphql.d';
import { randomUUID } from 'crypto';
import { GraphQLContext } from '../../types/context';
import { 
  OfferFilter, 
  OffersArgs, 
  BookOfferArgs, 
  BookingStatusChangedArgs,
  UpdateBookingStatusArgs
} from '../../models/travelBooking';

export const travelBookingResolvers: GraphQLResolvers<GraphQLContext> = {
  Query: {
    offers: async (_: any, { filter, first = 10, after }: OffersArgs, { prisma }: GraphQLContext) => {
      const where: any = {};
      if (filter) {
        if (filter.destination) where.destination = filter.destination;
        if (filter.transportType) where.transportType = filter.transportType;
        if (filter.priceMin !== undefined || filter.priceMax !== undefined) {
          where.price = {};
          if (filter.priceMin !== undefined) where.price.gte = filter.priceMin;
          if (filter.priceMax !== undefined) where.price.lte = filter.priceMax;
        }
        if (filter.availableFrom) {
          where.availableFrom = { gte: filter.availableFrom };
        }
        if (filter.availableTo) {
          where.availableTo = { lte: filter.availableTo };
        }
      }

      const offers = await prisma.offer.findMany({
        where,
        take: first,
        skip: after ? 1 : 0,
        cursor: after ? { id: after } : undefined,
      });

      return {
        edges: offers.map((o: any) => ({ cursor: o.id, node: o })),
        pageInfo: {
          endCursor: offers.length ? offers[offers.length - 1].id : null,
          hasNextPage: offers.length === first,
        },
      };
    },
    me: (_parent: any, _args: any, { user }: GraphQLContext) => user || null,
  },

  Mutation: {
    bookOffer: async (_parent: any, { offerId }: BookOfferArgs, { prisma, user, pubsub }: GraphQLContext) => {
      if (!user) throw new Error('Unauthorized');
      const id = randomUUID();
      const booking = await prisma.booking.create({
        data: {
          id,
          offerId,
          userId: user.id,
          status: 'PENDING',
        },
        include: { offer: true, user: true },
      });

      // Notify subscribers about the new booking
      await pubsub.publish('BOOKING_CREATED', { bookingCreated: booking });
      await pubsub.publish(`BOOKING_${booking.id}`, { bookingStatusChanged: booking });

      return booking;
    },
    updateBookingStatus: async (_parent: any, { bookingId, status }: UpdateBookingStatusArgs, { prisma, user, pubsub }: GraphQLContext) => {
      if (!user) throw new Error('Unauthorized');

      // Validate status is one of enum values (type system already restricts, but runtime safeguard)
      if (!['PENDING', 'CONFIRMED', 'CANCELLED'].includes(status)) {
        throw new Error('Invalid booking status');
      }

      // Ensure booking exists and belongs to user (optional ownership check)
      const existing = await prisma.booking.findUnique({ where: { id: bookingId } });
      if (!existing) throw new Error('Booking not found');
      if (existing.userId !== user.id) throw new Error('Forbidden');

      const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: { status },
        include: { offer: true, user: true },
      });

      await pubsub.publish(`BOOKING_${bookingId}`, { bookingStatusChanged: updated });

      return updated;
    },
  },

  Subscription: {
    bookingStatusChanged: {
      subscribe: (_parent: any, { bookingId }: BookingStatusChangedArgs, { pubsub }: GraphQLContext) => {
        return pubsub.asyncIterator(`BOOKING_${bookingId}`);
      },
    },
    bookingCreated: {
      subscribe: (_parent: any, _args: any, { pubsub }: GraphQLContext) => {
        return pubsub.asyncIterator('BOOKING_CREATED');
      },
    },
  },
};
