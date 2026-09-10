import Foundation

public protocol LocalTripStoring: AnyObject {
    func save(report: TripReport, session: TripSession) throws
    func loadAllReports() throws -> [TripReport]
    func loadReport(id: UUID) throws -> TripReport?
    func deleteReport(id: UUID) throws
    func saveSettings(_ settings: VehicleSettings) throws
    func loadSettings() throws -> VehicleSettings
}

/// Persistência offline-first em Application Support (JSON).
public final class LocalTripStore: LocalTripStoring, @unchecked Sendable {
    private let directory: URL
    private let encoder: JSONEncoder
    private let decoder: JSONDecoder
    private let queue = DispatchQueue(label: "br.relatorioradar.store")

    public init(directory: URL? = nil) {
        if let directory {
            self.directory = directory
        } else {
            let base = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first
                ?? FileManager.default.temporaryDirectory
            self.directory = base.appendingPathComponent("RelatorioRadar", isDirectory: true)
        }
        self.encoder = JSONEncoder()
        self.encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        self.encoder.dateEncodingStrategy = .iso8601
        self.decoder = JSONDecoder()
        self.decoder.dateDecodingStrategy = .iso8601
        try? FileManager.default.createDirectory(at: self.directory, withIntermediateDirectories: true)
    }

    public func save(report: TripReport, session: TripSession) throws {
        try queue.sync {
            let reportURL = directory.appendingPathComponent("report-\(report.id.uuidString).json")
            let sessionURL = directory.appendingPathComponent("session-\(session.id.uuidString).json")
            try encoder.encode(report).write(to: reportURL, options: .atomic)
            try encoder.encode(session).write(to: sessionURL, options: .atomic)
            var index = try loadIndexUnlocked()
            if !index.contains(report.id) {
                index.insert(report.id, at: 0)
                try saveIndexUnlocked(index)
            }
        }
    }

    public func loadAllReports() throws -> [TripReport] {
        try queue.sync {
            let ids = try loadIndexUnlocked()
            return try ids.compactMap { try loadReportUnlocked(id: $0) }
        }
    }

    public func loadReport(id: UUID) throws -> TripReport? {
        try queue.sync { try loadReportUnlocked(id: id) }
    }

    public func deleteReport(id: UUID) throws {
        try queue.sync {
            let reportURL = directory.appendingPathComponent("report-\(id.uuidString).json")
            try? FileManager.default.removeItem(at: reportURL)
            var index = try loadIndexUnlocked()
            index.removeAll { $0 == id }
            try saveIndexUnlocked(index)
        }
    }

    public func saveSettings(_ settings: VehicleSettings) throws {
        try queue.sync {
            let url = directory.appendingPathComponent("settings.json")
            try encoder.encode(settings).write(to: url, options: .atomic)
        }
    }

    public func loadSettings() throws -> VehicleSettings {
        try queue.sync {
            let url = directory.appendingPathComponent("settings.json")
            guard FileManager.default.fileExists(atPath: url.path) else {
                return .default
            }
            return try decoder.decode(VehicleSettings.self, from: Data(contentsOf: url))
        }
    }

    private func loadReportUnlocked(id: UUID) throws -> TripReport? {
        let url = directory.appendingPathComponent("report-\(id.uuidString).json")
        guard FileManager.default.fileExists(atPath: url.path) else { return nil }
        return try decoder.decode(TripReport.self, from: Data(contentsOf: url))
    }

    private func loadIndexUnlocked() throws -> [UUID] {
        let url = directory.appendingPathComponent("index.json")
        guard FileManager.default.fileExists(atPath: url.path) else { return [] }
        return try decoder.decode([UUID].self, from: Data(contentsOf: url))
    }

    private func saveIndexUnlocked(_ ids: [UUID]) throws {
        let url = directory.appendingPathComponent("index.json")
        try encoder.encode(ids).write(to: url, options: .atomic)
    }
}
