import 'dotenv/config';
export type StoreMode = 'memory' | 'postgres';
export type ProviderMode = 'demo' | 'here';
export declare const config: {
    port: number;
    store: StoreMode;
    databaseUrl: string;
    hereApiKey: string;
    provider: ProviderMode;
    jwtSecret: string;
};
export declare function assertPostgresConfig(): void;
