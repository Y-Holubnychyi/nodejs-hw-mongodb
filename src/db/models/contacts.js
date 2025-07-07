import { Schema, model, Types } from 'mongoose';

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    email: String,
    isFavourite: {
      type: Boolean,
      default: false,
    },
    contactType: {
      type: String,
      enum: ['work', 'home', 'personal'],
      required: true,
      default: 'personal',
    },
    userId: {
      type: Types.ObjectId,
      ref: 'user',
      required: true,
    },
    photo: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

const ContactCollection = model('contact', contactSchema);

export default ContactCollection;
