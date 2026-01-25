process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { Client } = require('pg');

const connectionString = "postgresql://postgres.amsjnzfebhbbywouvegb:damini902165@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?sslmode=require";

async function migrate() {
    const client = new Client({
        connectionString: connectionString,
        ssl: true
    });

    try {
        await client.connect();
        console.log('Connected to database');

        const queries = [
            'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "email" TEXT;',
            'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetToken" TEXT;',
            'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetTokenExpiry" TIMESTAMP(3);',
            'CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");',
            'CREATE UNIQUE INDEX IF NOT EXISTS "User_resetToken_key" ON "User"("resetToken");'
        ];

        for (const query of queries) {
            console.log(`Executing: ${query}`);
            await client.query(query);
        }

        console.log('Migration successful');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

migrate();
