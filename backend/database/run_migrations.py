import os
import re
import psycopg2

DB_DSN = os.environ.get("DB_DSN", "dbname=nextflow_db user=postgres password=postgres host=localhost port=5435")
MIGRATIONS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "migrations")

def run_migrations():
    print(f"🚀 Connecting to database: {DB_DSN}")
    conn = psycopg2.connect(DB_DSN)
    conn.autocommit = True
    cur = conn.cursor()

    # Create schema migrations table if not exists to track which migrations are already applied
    cur.execute("""
        CREATE TABLE IF NOT EXISTS nf_core.schema_migrations (
            version VARCHAR(255) PRIMARY KEY,
            applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
    """)

    # Read migration files
    files = sorted([f for f in os.listdir(MIGRATIONS_DIR) if f.endswith(".sql")])
    print(f"📂 Found {len(files)} migration files in {MIGRATIONS_DIR}")

    for filename in files:
        # Check if already applied
        cur.execute("SELECT 1 FROM nf_core.schema_migrations WHERE version = %s", (filename,))
        if cur.fetchone():
            print(f"⏭️  Migration {filename} is already applied. Skipping.")
            continue

        filepath = os.path.join(MIGRATIONS_DIR, filename)
        print(f"⚙️  Applying migration: {filename}...")
        with open(filepath, "r", encoding="utf-8") as f:
            sql = f.read()

        try:
            # We execute as a transaction block if BEGIN/COMMIT is not present, 
            # but psycopg2 handles transactions, so we can just execute the sql.
            cur.execute(sql)
            cur.execute("INSERT INTO nf_core.schema_migrations (version) VALUES (%s)", (filename,))
            print(f"✅ Applied: {filename}")
        except Exception as e:
            print(f"❌ Error applying migration {filename}: {e}")
            conn.rollback()
            raise e

    cur.close()
    conn.close()
    print("🎉 All migrations applied successfully!")

if __name__ == "__main__":
    run_migrations()
