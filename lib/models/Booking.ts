import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBooking extends Document {
  _id: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  vendor: mongoose.Types.ObjectId;
  serviceType: string;
  date: Date;
  timeSlot: 'morning' | 'afternoon' | 'evening';
  address: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  amount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>({
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a customer'],
  },
  vendor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a vendor'],
  },
  serviceType: {
    type: String,
    required: [true, 'Please provide a service type'],
    enum: ['Home Gardening', 'Lawn Maintenance', 'Plant Care', 'Pot Arrangement'],
  },
  date: {
    type: Date,
    required: [true, 'Please provide a date'],
  },
  timeSlot: {
    type: String,
    required: [true, 'Please provide a time slot'],
    enum: ['morning', 'afternoon', 'evening'],
  },
  address: {
    type: String,
    required: [true, 'Please provide an address'],
    maxlength: [300, 'Address cannot be more than 300 characters'],
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative'],
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

BookingSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

BookingSchema.index({ customer: 1 });
BookingSchema.index({ vendor: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ date: 1 });

const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
