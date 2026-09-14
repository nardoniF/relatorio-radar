import Foundation

public final class SpeedLimitEngine: @unchecked Sendable {
    private let provider: SpeedLimitProviding
    public private(set) var lastLimitKmh: Double?

    public init(provider: SpeedLimitProviding) {
        self.provider = provider
    }

    public func limitKmh(near coordinate: Coordinate, heading: Double? = nil) -> Double? {
        let limit = provider.speedLimitKmh(at: coordinate, heading: heading)
        if let limit { lastLimitKmh = limit }
        return limit
    }
}
