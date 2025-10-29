import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
    console.log('Starting connection test...');
    
    if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL is not defined');
        process.exit(1);
    }

    console.log('Database URL found...');

    try {
        const sql = neon(process.env.DATABASE_URL);
        console.log('SQL client created...');

        const result = await sql`SELECT current_timestamp`;
        console.log('Connection successful! Current timestamp:', result);
    } catch (error) {
        console.error('Connection failed:', error);
        process.exit(1);
    }
}

testConnection();