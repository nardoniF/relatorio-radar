import Foundation

/// Map matching em lotes — provider local (PostGIS/OSM-style). Comercial só complementar.
public final class MapMatchingEngine: @unchecked Sendable {
    private let provider: MapMatchingProviding
    public private(set) var lastResult: MapMatchResult?

    public init(provider: MapMatchingProviding) {
        self.provider = provider
    }

    public func matchBatch(_ samples: [PositionSample]) -> MapMatchResult? {
        guard samples.count >= 2 else { return nil }
        let result = provider.match(samples: samples)
        lastResult = result
        return result
    }
}
