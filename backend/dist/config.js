import 'dotenv/config';
function intEnv(name, fallback) {
    const v = process.env[name];
    if (v == null || v === '')
        return fallback;
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
}
export const config = {
    port: intEnv('PORT', 3001),
    store: (process.env.STORE === 'postgres' ? 'postgres' : 'memory'),
    databaseUrl: process.env.DATABASE_URL ?? '',
    hereApiKey: process.env.HERE_API_KEY ?? '',
    provider: (process.env.PROVIDER === 'here' ? 'here' : 'demo'),
    jwtSecret: process.env.JWT_SECRET ?? '',
};
export function assertPostgresConfig() {
    if (config.store === 'postgres' && !config.databaseUrl) {
        throw new Error('DATABASE_URL é obrigatório quando STORE=postgres');
    }
}
//# sourceMappingURL=config.js.map