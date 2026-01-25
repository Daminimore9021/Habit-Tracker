const { Client } = require('pg');

async function testDirect() {
    // Using direct connection (no pooler)
    const connectionString = "postgresql://postgres.amsjnzfebhbbywouvegb:damini902165@db.amsjnzfebhbbywouvegb.supabase.co:5432/postgres";

    const client = new Client({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log("Attempting direct connection to Port 5432...");
        await client.connect();
        console.log("Direct connection successful!");
        const res = await client.query('SELECT NOW()');
        console.log("Server time:", res.rows[0]);
    } catch (err) {
        console.error("Direct connection failed!");
        console.error("Error Code:", err.code);
        console.error("Error Message:", err.message);
    } finally {
        await client.end();
    }
}

testDirect();
