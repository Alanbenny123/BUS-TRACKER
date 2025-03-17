import mongoose from 'mongoose';

declare global {
  interface GlobalWithMongoose extends NodeJS.Global {
    mongoose?: {
      conn: mongoose.Mongoose | null;
      promise: Promise<mongoose.Mongoose> | null;
    };
  }
}

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

const MONGODB_URI = process.env.MONGODB_URI;
const cached = (global as GlobalWithMongoose).mongoose || { conn: null, promise: null };

if (!(global as GlobalWithMongoose).mongoose) {
  (global as GlobalWithMongoose).mongoose = cached;
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => mongoose);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;