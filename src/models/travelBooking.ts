export interface OfferFilter {
  destination?: string;
  priceMin?: number;
  priceMax?: number;
  transportType?: string;
  availableFrom?: string;
  availableTo?: string;
}

export interface OffersArgs {
  filter?: OfferFilter;
  first?: number;
  after?: string;
}

export interface BookOfferArgs {
  offerId: string;
}

export interface BookingStatusChangedArgs {
  bookingId: string;
}

export interface UpdateBookingStatusArgs {
  bookingId: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}
