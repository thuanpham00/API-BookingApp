import { MongoClient } from "mongodb";

const uri =
  "mongodb+srv://phamminhthuan912:thuan123@flight-booking.sindgy0.mongodb.net/?retryWrites=true&w=majority&appName=flight-booking";

const client = new MongoClient(uri);
const dbName = "flightBooking"; // bạn có thể đổi tên DB tùy ý, ví dụ "flight_booking"

export async function connectDB() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
}

export function getDB() {
  return client.db(dbName);
}
