
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error("MONGO_URI is missing in .env file");
    }

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 15000
    });

    console.log("MongoDB Connected Successfully!");
    console.log("Database Host:", mongoose.connection.host);

  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    throw error;
  }
};

module.exports = connectDB;
