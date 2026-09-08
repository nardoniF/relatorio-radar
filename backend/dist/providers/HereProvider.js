/**
 * Stub HERE Platform.
 *
 * TODO: Map Attributes API v8 — SPEED_LIMITS_FCn / APPLICABLE_SPEED_LIMIT
 * TODO: Safety Cameras Feed — cameraType, speedLimit, drivingDirection
 * TODO: Route Matching API v8 — trace → links + atributos
 *
 * A chave HERE_API_KEY deve vir apenas de process.env (nunca do cliente).
 */
export class HereProvider {
    name = 'here';
    apiKey;
    constructor(apiKey) {
        this.apiKey = apiKey;
        if (!this.apiKey) {
            // Não falha no boot — endpoints retornam erro claro se usados sem chave
            console.warn('[HereProvider] HERE_API_KEY ausente. Configure no .env do backend.');
        }
    }
    async getNearbyRadars(_query) {
        this.requireKey();
        // TODO: chamar HERE Safety Cameras Feed com bbox/raio
        // TODO: mapear directionType / drivingDirection → directionDeg
        // TODO: respeitar TTL de cache do contrato OLP
        throw new Error('HereProvider.getNearbyRadars ainda não implementado (Safety Cameras). Use PROVIDER=demo.');
    }
    async getSpeedLimit(_query) {
        this.requireKey();
        // TODO: Map Attributes API v8 — atributos de velocidade no link
        throw new Error('HereProvider.getSpeedLimit ainda não implementado (Map Attributes). Use PROVIDER=demo.');
    }
    async matchTrace(_points) {
        this.requireKey();
        // TODO: Route Matching API v8
        throw new Error('HereProvider.matchTrace ainda não implementado (Route Matching). Use PROVIDER=demo.');
    }
    requireKey() {
        if (!this.apiKey) {
            throw new Error('HERE_API_KEY não configurada no ambiente do backend');
        }
    }
}
//# sourceMappingURL=HereProvider.js.map