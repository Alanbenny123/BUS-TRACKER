import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  courseStream: string;
  passoutYear: number;
  resetToken?: string;
  resetTokenExpiry?: number;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please provide a phone number'],
  },
  courseStream: {
    type: String,
    required: [true, 'Please provide your course stream'],
  },
  passoutYear: {
    type: Number,
    required: [true, 'Please provide your passout year'],
  },
  resetToken: String,
  resetTokenExpiry: Number,
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema); 