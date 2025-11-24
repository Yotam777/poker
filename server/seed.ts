import { db } from "./db";
import { users, tables, settings } from "@shared/schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  try {
    // Check if admin already exists
    const existingAdmin = await db.select().from(users).limit(1);
    
    if (existingAdmin.length === 0) {
      // Create admin user
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await db.insert(users).values({
        username: "admin",
        password: hashedPassword,
        balance: "0",
        isAdmin: true,
        isSuspended: false,
      });
      console.log("✓ Created admin user (username: admin, password: admin123)");

      // Create default tables
      await db.insert(tables).values([
        {
          name: "Beginner Table",
          stakeAmount: "1.00",
          password: null,
          maxPlayers: 6,
        },
        {
          name: "Intermediate Table",
          stakeAmount: "5.00",
          password: null,
          maxPlayers: 6,
        },
        {
          name: "High Rollers",
          stakeAmount: "10.00",
          password: null,
          maxPlayers: 6,
        },
      ]);
      console.log("✓ Created default tables");

      // Create default settings
      await db.insert(settings).values({
        commissionRate: "5.00",
      });
      console.log("✓ Created default settings");

      console.log("\nDatabase seeded successfully!");
      console.log("Admin credentials:");
      console.log("  Username: admin");
      console.log("  Password: admin123");
    } else {
      console.log("Database already seeded");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }

  process.exit(0);
}

seed();
