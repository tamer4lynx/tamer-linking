import Foundation
import Lynx

@objcMembers
public final class LinkingModule: NSObject, LynxModule {

    @objc public static var name: String { "LinkingModule" }

    @objc public static var methodLookup: [String: String] {
        [
            "createURL": NSStringFromSelector(#selector(createURL(_:optionsJson:))),
            "getInitialURL": NSStringFromSelector(#selector(getInitialURL(_:)))
        ]
    }

    private static var pendingInitialUrl: String?
    private static weak var instance: LinkingModule?

    @objc public static func setInitialUrl(_ url: String?) {
        pendingInitialUrl = url
    }

    @objc public static func onUrlReceived(_ url: String?) {
        guard let url = url, !url.isEmpty else { return }
        instance?.emitUrl(url)
    }

    @objc public init(param: Any) {
        super.init()
        LinkingModule.instance = self
    }
    @objc public override init() {
        super.init()
        LinkingModule.instance = self
    }

    @objc func createURL(_ path: String, optionsJson: String) -> String {
        guard let data = optionsJson.data(using: .utf8),
              let opts = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            return "tamerdevapp://\(path)"
        }
        let scheme = opts["scheme"] as? String ?? "tamerdevapp"
        let p = (opts["path"] as? String ?? path).trimmingCharacters(in: CharacterSet(charactersIn: "/"))
        let base = "\(scheme)://\(p)"
        if let q = opts["queryParams"] as? [String: String], !q.isEmpty {
            let pairs = q.map { "\($0.key.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? $0.key)=\($0.value.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? $0.value)" }
            return "\(base)?\(pairs.joined(separator: "&"))"
        }
        return base
    }

    @objc func getInitialURL(_ callback: @escaping (String) -> Void) {
        let url = LinkingModule.pendingInitialUrl ?? ""
        if LinkingModule.pendingInitialUrl != nil {
            LinkingModule.pendingInitialUrl = nil
        }
        callback(url)
    }

    private func emitUrl(_ url: String) {
        let payload = ["url": url]
        guard let data = try? JSONSerialization.data(withJSONObject: payload),
              let json = String(data: data, encoding: .utf8) else { return }
        emitEvent("tamer-linking:url", json)
    }

    private func emitEvent(_ name: String, _ payload: String) {
        DispatchQueue.main.async {
            NotificationCenter.default.post(name: NSNotification.Name(name), object: nil, userInfo: ["payload": payload])
        }
    }
}
