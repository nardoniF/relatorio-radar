// swift-tools-version: 5.9
import PackageDescription

/// RelatorioRadarCore — engines de conformidade viária em tempo real.
/// Testável com `swift test` (Linux/macOS). Sem SwiftUI.
let package = Package(
    name: "RelatorioRadarCore",
    platforms: [
        .iOS(.v16),
        .macOS(.v13),
    ],
    products: [
        .library(
            name: "RelatorioRadarCore",
            targets: ["RelatorioRadarCore"]
        ),
    ],
    targets: [
        .target(
            name: "RelatorioRadarCore",
            path: "Sources/RelatorioRadarCore"
        ),
        .testTarget(
            name: "RelatorioRadarCoreTests",
            dependencies: ["RelatorioRadarCore"],
            path: "Sources/RelatorioRadarCoreTests"
        ),
    ]
)
