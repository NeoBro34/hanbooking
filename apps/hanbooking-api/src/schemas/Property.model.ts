import { Schema } from 'mongoose';
import {
  PropertyAmenity,
  PropertyLocation,
  PropertyStatus,
  PropertyType,
} from '../libs/enums/property.enum';

const PropertySchema = new Schema(
  {
    propertyType: {
      type: String,
      enum: PropertyType,
      required: true,
    },

    propertyStatus: {
      type: String,
      enum: PropertyStatus,
      default: PropertyStatus.ACTIVE,
    },

    propertyLocation: {
      type: String,
      enum: PropertyLocation,
      required: true,
    },

    propertyAddress: {
      type: String,
      required: true,
    },

    propertyTitle: {
      type: String,
      required: true,
    },

    propertyPricePerNight: {
      type: Number,
      required: true,
    },

    propertyMaxGuests: {
      type: Number,
      required: true,
    },

    propertyBeds: {
      type: Number,
      required: true,
    },

    propertyRooms: {
      type: Number,
      required: true,
    },

    propertyViews: {
      type: Number,
      default: 0,
    },

    propertyLikes: {
      type: Number,
      default: 0,
    },

    propertyComments: {
      type: Number,
      default: 0,
    },

    propertyRank: {
      type: Number,
      default: 0,
    },

    propertyPoints: {
      type: Number,
      default: 0,
    },

    propertyImages: {
      type: [String],
      required: true,
    },

    propertyDesc: {
      type: String,
    },

    amenities: {
      type: [String],
      enum: Object.values(PropertyAmenity),
      default: [],
    },

    memberId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Member',
    },

    deletedAt: {
      type: Date,
    },

    constructedAt: {
      type: Date,
    },
  },
  { timestamps: true, collection: 'properties' },
);

PropertySchema.index(
  {
    propertyType: 1,
    propertyLocation: 1,
    propertyTitle: 1,
    propertyPricePerNight: 1,
  },
  { unique: true },
);

PropertySchema.index({ propertyTitle: 'text' });

export default PropertySchema;
