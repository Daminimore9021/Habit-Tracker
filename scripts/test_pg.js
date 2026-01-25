const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

async function testPg() {
    const connectionString = process.env.DATABASE_URL;
    console.log("Testing connection string (obfuscated):", connectionString.replace(/:([^@]+)@/, ':****@'));

    const client = new Client({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log("Successfully connected with PG driver!");
        const res = await client.query('SELECT NOW()');
        console.log("Server time:", res.rows[0]);
    } catch (err) {
        console.error("PG Connection failed!");
        console.error("Error Code:", err.code);
        console.error("Error Message:", err.message);
    } finally {
        await client.end();
    }
}

testPg();
