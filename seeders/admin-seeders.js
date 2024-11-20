const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const UserModel = require("../models/user");

const dotenv = require('dotenv');
dotenv.config();


async function seedAdmin() {
    try {
        // Connect to the database
        await mongoose.connect(process.env.DATABASE_URL);

        // Check if admin already exists
        const existingAdmin = await UserModel.findOne({ role: "admin" });

        if (!existingAdmin) {
            // Create admin credentials
            const adminCredentials = {
                name: process.env.ADMIN_USER,
                email: process.env.ADMIN_EMAIL,
                password: process.env.ADMIN_PASSWORD,
                mobile_number: process.env.ADMIN_MOBILE_NUMBER,
                role: "admin"
            };

            // Hash the admin password
            const salt = await bcrypt.genSalt(+process.env.HASH);
            const hashedPassword = await bcrypt.hash(adminCredentials.password, salt);
            adminCredentials.password = hashedPassword;

            // Create admin user
            await UserModel.create(adminCredentials);

            console.log("Admin user created successfully");
        } else {
            console.log("Admin user already exists");
        }

        // Close the database connection
        await mongoose.disconnect();
    } catch (error) {
        console.log(error)
    }
}

// Execute the admin seeder
seedAdmin().then(() => {
    console.log("Admin seeding completed");
    process.exit(0);
}).catch((err) => {
    console.error("Error seeding admin:", err);
    process.exit(1);
});