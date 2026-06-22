import AppKit
import Foundation

guard CommandLine.arguments.count > 1 else { exit(1) }
let path = CommandLine.arguments[1]

guard FileManager.default.fileExists(atPath: path) else { exit(1) }

let icon = NSWorkspace.shared.icon(forFile: path)
guard let cgImage = icon.cgImage(forProposedRect: nil, context: nil, hints: nil) else { exit(1) }
let bitmap = NSBitmapImageRep(cgImage: cgImage)
guard let pngData = bitmap.representation(using: .png, properties: [:]) else { exit(1) }
FileHandle.standardOutput.write(pngData)
