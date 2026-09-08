import type { FastifyInstance } from 'fastify';
import type { DemoStore } from '../store/DemoStore.js';
import type { MapDataProvider } from '../providers/types.js';
type AppDeps = {
    store: DemoStore;
    provider: MapDataProvider;
};
export declare function registerRoutes(app: FastifyInstance, deps: AppDeps): Promise<void>;
export {};
