# Worker — TypeScript Service Worker Element

Worker provides the service worker runtime for CodeEditorLand, running in a separate thread context and serving web requests independently.

Refer to the [Architecture.md](./Architecture.md) for detailed layer diagrams and component maps.

---

## Shim Compatibility

| 🟠 Low-Level Shim | 🔵 Coverage Shim |
|-------------------|-----------------|
| Tier: `TierShim=Own\|Preempt` | Tier: `TierShim=Proxy\|Replace` |
| Engine prototype hooks | Service routing + audit |

> This Element supports the Land deep-shim interception system. Gated behind
> `TierShim` env var (default: `None` — zero overhead).

---

**Project Maintainers:** Source Open
([Source/Open@Editor.Land](mailto:Source/Open@Editor.Land)) |
[GitHub Repository](https://github.com/CodeEditorLand/Worker) |
[Report an Issue](https://github.com/CodeEditorLand/Worker/issues)
