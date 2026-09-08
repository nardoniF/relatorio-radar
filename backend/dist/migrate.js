/**
 * Aplica migrations SQL em ordem contra DATABASE_URL (Postgres + PostGIS).
 * Uso: STORE=postgres DATABASE_URL=... npm run migrate
 */
import 'dotenv/config';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(__dirname, '../migrations');
async function migrate() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        console.error('DATABASE_URL é obrigatório para migrate');
        process.exit(1);
    }
    const client = new pg.Client({ connectionString: databaseUrl });
    await client.connect();
    try {
        await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
        const files = (await readdir(migrationsDir))
            .filter((f) => f.endsWith('.sql'))
            .sort();
        for (const file of files) {
            const { rows } = await client.query('SELECT 1 FROM schema_migrations WHERE filename = $1', [file]);
            if (rows.length) {
                console.log(`skip  ${file}`);
                continue;
            }
            const sql = await readFile(path.join(migrationsDir, file), 'utf8');
            console.log(`apply ${file}`);
            await client.query('BEGIN');
            try {
                await client.query(sql);
                await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
                await client.query('COMMIT');
            }
            catch (e) {
                await client.query('ROLLBACK');
                throw e;
            }
        }
        console.log('Migrations concluídas.');
    }
    finally {
        await client.end();
    }
}
migrate().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=migrate.js.map