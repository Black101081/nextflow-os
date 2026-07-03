import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

const runMigrations = async () => {
  console.log('[Migrations] Connecting to database to run migrations...');
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('[Migrations] Database connected.');

    const sqlPath = path.join(__dirname, 'migrations', '001_init_schema.sql');
    console.log(`[Migrations] Reading SQL script from: ${sqlPath}`);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('[Migrations] Running SQL script...');
    await client.query(sql);
    console.log('[Migrations] Core Database migrations applied successfully!');
  } catch (error: any) {
    console.error('[Migrations] Migration failed with error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('[Migrations] Database connection closed.');
  }
};

runMigrations();
