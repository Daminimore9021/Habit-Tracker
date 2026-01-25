const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
    try {
        console.log("Attempting to connect to the database...");
        await prisma.$connect();
        console.log("Connection successful!");

        // Try a simple query
        const userCount = await prisma.user.count();
        console.log("User count:", userCount);

    } catch (error) {
        console.error("Connection failed!");
        console.error("Error details:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();
