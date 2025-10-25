import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGODB_URI as string;
if (!uri) {
  console.error("❌ MONGODB_URI is not set. Set it in .env (local) or Render Environment (production).");
  throw new Error("MONGODB_URI is not set");
}
console.log("ℹ️ MONGODB_URI is present");

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
const dbName = process.env.MONGODB_DB as string;

export async function connectDB() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error; // bắt buộc để server không start khi DB không connect được
  }
}

export function getDB() {
  return client.db(dbName);
}
