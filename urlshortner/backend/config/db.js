import mongoose from "mongoose";

export const Mongo_url =
  process.env.MONGO_URL || "mongodb://localhost:27017/urlshortner";

export const dbConnect = async () => {
  try {
    await mongoose.connect(Mongo_url);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
};
