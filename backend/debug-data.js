import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/user.js";
import University from "./src/models/University.js";
import { connectDB } from "./src/config/db.js";

dotenv.config();

async function debugData() {
    await connectDB(process.env.MONGO_URI);

    console.log("\n=== Debugging Users University Data ===");

    const users = await User.find({}).limit(10);

    for (const user of users) {
        console.log(`\nUser: ${user.name}`);
        console.log(`  _id: ${user._id}`);
        console.log(`  Raw University Field:`, user.university);

        // Check if it looks like an ObjectId or String
        const uniValue = user.university;
        if (uniValue) {
            if (mongoose.Types.ObjectId.isValid(uniValue)) {
                console.log(`  Type: Valid ObjectId`);
                // Try to find the university
                const uniDoc = await University.findById(uniValue);
                if (uniDoc) {
                    console.log(`  Linked University: "${uniDoc.name}" (ID: ${uniDoc._id})`);
                } else {
                    console.log(`  ❌ BROKEN LINK: University ID exists on user but not found in University collection.`);
                }
            } else {
                console.log(`  Type: NON-ObjectId (String?) => "${uniValue}"`);
                // If it's a string name, check if a university exists with that name
                const uniByName = await University.findOne({ name: uniValue });
                if (uniByName) {
                    console.log(`  ⚠️ Schema Mismatch: Stored as name, but University doc exists with ID: ${uniByName._id}`);
                } else {
                    console.log(`  ⚠️ Schema Mismatch AND Not Found: Stored as name "${uniValue}", no matching University doc.`);
                }
            }
        } else {
            console.log(`  ⚠️ University field is NULL or Undefined`);
        }
    }

    console.log("\n=== Done ===");
    process.exit();
}

debugData();
