import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGODB_URI as string;

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
const dbName = process.env.MONGODB_DB as string;

export async function connectDB() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}

export function getDB() {
  return client.db(dbName);
}
