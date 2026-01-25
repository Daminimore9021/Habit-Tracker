const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
    try {
        console.log("Attempting to connect to the database with password: damini902165");
        await prisma.$connect();
        console.log("Connection successful!");
        const userCount = await prisma.user.count();
        console.log("User count:", userCount);
    } catch (error) {
        console.error("Connection failed!");
        console.error("Error Message:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();
