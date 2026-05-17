import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVendorProfile extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  businessName: string;
  services: string[];
  availability: {
    monday: { am: boolean; pm: boolean };
    tuesday: { am: boolean; pm: boolean };
    wednesday: { am: boolean; pm: boolean };
    thursday: { am: boolean; pm: boolean };
    friday: { am: boolean; pm: boolean };
    saturday: { am: boolean; pm: boolean };
    sunday: { am: boolean; pm: boolean };
  };
  hourlyPrice: number;
  isApproved: boolean;
  status: 'pending' | 'approved' | 'rejected';
  earnings: number;
  rating: number;
  totalReviews: number;
  bio?: string;
  imageUrl?: string;
  createdAt: Date;
}

const AvailabilitySchema = new Schema({
  am: { type: Boolean, default: false },
  pm: { type: Boolean, default: false },
}, { _id: false });

const VendorProfileSchema = new Schema<IVendorProfile>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  businessName: {
    type: String,
    required: [true, 'Please provide a business name'],
    trim: true,
    maxlength: [100, 'Business name cannot be more than 100 characters'],
  },
  services: [{
    type: String,
    enum: ['Home Gardening', 'Lawn Maintenance', 'Plant Care', 'Pot Arrangement'],
  }],
  availability: {
    monday: { type: AvailabilitySchema, default: { am: false, pm: false } },
    tuesday: { type: AvailabilitySchema, default: { am: false, pm: false } },
    wednesday: { type: AvailabilitySchema, default: { am: false, pm: false } },
    thursday: { type: AvailabilitySchema, default: { am: false, pm: false } },
    friday: { type: AvailabilitySchema, default: { am: false, pm: false } },
    saturday: { type: AvailabilitySchema, default: { am: false, pm: false } },
    sunday: { type: AvailabilitySchema, default: { am: false, pm: false } },
  },
  hourlyPrice: {
    type: Number,
    default: 0,
    min: [0, 'Hourly price cannot be negative'],
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  earnings: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters'],
  },
  imageUrl: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const VendorProfile: Model<IVendorProfile> = mongoose.models.VendorProfile || mongoose.model<IVendorProfile>('VendorProfile', VendorProfileSchema);

export default VendorProfile;
