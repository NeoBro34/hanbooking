import { Schema } from 'mongoose';

const InquiryMessageSchema = new Schema(
  {
    inquiryId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Notice',
    },

    senderId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Member',
    },

    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, collection: 'inquiryMessages' },
);

export default InquiryMessageSchema;
