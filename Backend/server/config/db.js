import mongoose from 'mongoose';

export async function connectDB(mongoUri) {
  if (!mongoUri) {
    throw new Error('MONGO_URI is required');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(mongoUri, {
    autoIndex: process.env.NODE_ENV !== 'production',
  });

  // eslint-disable-next-line no-console
  console.log(`Database connected: ${mongoose.connection.name || 'mongodb'} @ ${mongoose.connection.host || 'unknown-host'}`);
}

