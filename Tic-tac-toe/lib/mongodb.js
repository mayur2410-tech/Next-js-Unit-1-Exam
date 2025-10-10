import mongoose from "mongoose";

const MONGODB_URI = "mongodb+srv://stakescasino433_db_user:d2ZZylopfh6qeZy1@cluster0.heyk6b9.mongodb.net/";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable in .env.local");
}

// Global is used here to maintain a cached connection across hot reloads in development.
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: "tictactoe",
        bufferCommands: false
      })
      .then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}