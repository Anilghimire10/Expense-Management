import mongoose from 'mongoose';

export const connectDB = async (MONGO_URI: string): Promise<void> => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    if (error instanceof Error) {
      console.log('MongoDB connection failed', error.message);
    } else {
      console.error('MongoDB connection failed', error);
    }
    process.exit(1);
  }
};
