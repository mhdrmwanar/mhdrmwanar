import { DataSource } from "typeorm";
import { User } from "../models/userModel";
import { Payment } from "../models/paymentModel";
import { Transaction } from "../models/transactionModel";
import path from "path";

// SQLite Database Configuration
export const AppDataSource = new DataSource({
  type: "sqlite",
  database: path.join(__dirname, "../../database.sqlite"),
  synchronize: true, // Auto-create tables based on entities
  logging: false, // Set to true for SQL query logging
  entities: [User, Payment, Transaction],
  subscribers: [],
  migrations: [],
});

// Initialize database connection
const connectDB = async () => {
  try {
    await AppDataSource.initialize();
    console.log('SQLite database connected successfully');

    // Optional: Run initial SQL setup if needed
    console.log('Database schema synchronized');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

export default connectDB;
