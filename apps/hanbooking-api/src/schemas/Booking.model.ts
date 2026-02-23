import { Schema } from 'mongoose';
import { OrderStatus } from '../libs/enums/booking.enum';

const BookingSchema = new Schema(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Member',
    },

    propertyId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Property',
    },

    guests: {
      type: Number,
      required: true,
      min: 1,
    },

    checkInDate: {
      type: Date,
      required: true,
    },

    checkOutDate: {
      type: Date,
      required: true,
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    bookingStatus: {
      type: String,
      enum: OrderStatus,
      default: OrderStatus.PENDING,
      index: true,
    },
  },
  { timestamps: true, collection: 'bookings' },
);

BookingSchema.index({
  propertyId: 1,
  checkInDate: 1,
  checkOutDate: 1,
});

export default BookingSchema;
