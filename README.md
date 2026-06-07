<table>
	<tr>
		<td align="left" valign="middle">
			<h3 align="left">
				Worker&#x2001;🍩
			</h3>
		</td>
		<td align="left" valign="middle">
			<h3 align="left">
				+
			</h3>
		</td>
		<td align="left" valign="middle">
			<h3 align="left">
				<a href="https://Land.PlayForm.Cloud" target="_blank">
					<picture>
						<source media="(prefers-color-scheme: dark)" srcset="https://PlayForm.Cloud/Dark/Image/GitHub/Land.svg" />
						<source media="(prefers-color-scheme: light)" srcset="https://PlayForm.Cloud/Image/GitHub/Land.svg" />
						<img width="28" alt="Land Logo" src="https://PlayForm.Cloud/Image/GitHub/Land.svg" />
					</picture>
				</a>
			</h3>
		</td>
		<td align="left" valign="middle">
			<h3 align="left">
				<a href="https://Land.PlayForm.Cloud" target="_blank">
					Land&#x2001;🏞️
				</a>
			</h3>
		</td>
	</tr>
</table>

---

# **Worker**&#x2001;🍩

The Service Worker for Land&#x2001;🏞️

> **`Web` applications that lose authentication state on network drops force
> users to re-authenticate. Tokens stored in plaintext are accessible to any
> script running on the page.**

_"Offline-capable. Auth tokens encrypted. Auto-refreshed."_

[![License: CC0-1.0](https://img.shields.io/badge/License-CC0_1.0-lightgrey.svg)](https://github.com/CodeEditorLand/Worker/tree/Current/LICENSE)
[![NPM Version](https://img.shields.io/npm/v/@codeeditorland/worker.svg)](https://www.npmjs.com/package/@codeeditorland/worker)

Welcome to **Worker**, the Service Worker for the **Land Code Editor** that
enhances web application performance and reliability through advanced caching,
offline support, and a unique strategy for handling dynamic CSS imports from
JavaScript modules.

**Worker** is engineered to:

1. **Implement Asset Caching:** Provide multiple caching strategies including
   network-first for navigation and cache-first for static assets.
2. **Enable Offline Support:** Allow the application shell and cached assets to
   function without network connectivity.
3. **Handle Dynamic CSS Loading:** Intercept JavaScript CSS imports and respond
   with JavaScript modules that trigger standard `<link>` tag loading.
4. **Support Automatic Updates:** Detect new Service Worker versions and prompt
   clients to reload for seamless updates.

---

## Project Structure&#x2001;🗺️

```
Worker/
├── Source/
│   ├── Worker.ts                # Service worker entry: caching strategies, interception logic.
│   ├── Worker/
│   │   ├── Policy.ts            # Cache policies (network-first, cache-first, stale-while-revalidate).
│   │   ├── Register.ts          # Service worker registration, update detection, activation.
│   │   └── CSS/
│   │       └── Load.ts          # Client-side CSS loader (`window._LOAD_CSS_WORKER`).
│   ├── Configuration/
│   │   └── ESBuild/             # ESBuild build configuration and target definitions.
│   ├── Telemetry/
│   │   └── Bridge.ts            # PostHog telemetry bridge for worker-level error reporting.
│   ├── prepublishOnly.sh        # Build orchestration script.
│   └── Run.sh                   # Development watch mode.
```

---

## Getting Started&#x2001;🚀

`Worker` is built as part of the main **Land**&#x2001;🏞️ project. Build
instructions are documented in
[`Documentation/GitHub/Building.md`](https://github.com/CodeEditorLand/Land/tree/Current/Documentation/GitHub/Building.md).

---

## Key Features&#x2001;🔐

- **Asset Caching:** Implements multiple caching strategies:
    - **Core Cache (`CACHE_CORE`):** Stores essential application shell files
      and critical scripts (like `/Application/`, `Register.js`, `Load.js`).
      Uses a **network-first** strategy for navigation requests to ensure users
      get the latest page structure if online, falling back to the cache when
      offline. Pre-caches essential assets on install.
    - **Asset Cache (`CACHE_ASSET`):** Stores static application assets
      (`/Static/Application/*`), including JavaScript, images, and the actual
      CSS files. Uses a **cache-first** strategy for fast loading. Also stores
      the dynamically generated JavaScript modules used for CSS loading.
- **Offline Support:** Leverages the caches to allow the application shell and
  cached assets to function offline.
- **Dynamic CSS Loading:** Intercepts JavaScript `import` statements for
  specific CSS files and responds with a JavaScript module that triggers the
  loading of the actual CSS via a standard `<link>` tag.
- **Automatic Updates:** Detects when a new version of the Service Worker is
  activated and prompts the client (via `Register.js`) to reload the page,
  ensuring the user gets the latest application version seamlessly.
- **Client Control Management:** The `Register.js` script ensures the Service
  Worker gains control of the page, potentially reloading the page once after
  the initial registration if necessary.

---

## System Architecture Diagram&#x2001;🏗️

This diagram illustrates `Worker`'s service worker caching and CSS loading
strategy.

```mermaid
graph LR
    classDef worker fill:#f0d0ff,stroke:#9b59b6,stroke-width:2px,color:#2c0050;
    classDef client fill:#cce8ff,stroke:#2980b9,stroke-width:2px,color:#003050;
    classDef cache  fill:#d4f5d4,stroke:#27ae60,stroke-width:1px,color:#0a3a0a;
    classDef sky    fill:#9cf,stroke:#2471a3,stroke-width:1px,stroke-dasharray:5 5,color:#001040;

    subgraph SKY["Sky 🌌 - Astro Page (Tauri WebView)"]
        HTMLPage["index.astro\nloads Load.js + Register.js"]:::sky
        MainApp["workbench JS\n(dynamic CSS imports)"]:::sky
    end

    subgraph SW["Worker 🍩 - Service Worker (Worker.ts / Policy.ts)"]
        direction TB
        Register["Register.ts\nregistration + update detection\nscope /Application"]:::worker
        Policy["Policy.ts\nfetch event handler\nroutes by URL pattern"]:::worker
        subgraph CACHES["Cache Storage"]
            CoreCache["CACHE_CORE\nnetwork-first\n/Application/ navigation"]:::cache
            AssetCache["CACHE_ASSET\ncache-first\n/Static/Application/* CSS + JS"]:::cache
        end
        CSSLoad["Worker/CSS/Load.ts\nwindow._LOAD_CSS_WORKER\nclient-side link tag injector"]:::worker

        Register --> Policy
        Policy --> CoreCache
        Policy --> AssetCache
        CSSLoad --> AssetCache
    end

    HTMLPage -- registers --> Register
    HTMLPage -- defines _LOAD_CSS_WORKER --> CSSLoad
    MainApp -- import .css --> Policy
    Policy -- JS module response\nexport default + _LOAD_CSS_WORKER call --> MainApp
    MainApp -- link rel=stylesheet\nURL?Skip=Intercept --> Policy
    Policy -- cache-first real CSS --> MainApp
```

---

## Usage: Dynamic CSS Loading via JS Module Response&#x2001;🚀

This worker implements a specific strategy to handle dynamic CSS imports from
JavaScript modules (e.g., `import './some-styles.css';`) located under the
`/Static/Application/` path.

**The Workflow:**

1.  **Initial JS Import:** A JavaScript module attempts to import a CSS file
    under `/Static/Application/` (e.g.,
    `/Static/Application/CodeEditorLand/component.css`).
2.  **Service Worker Intercept #1:** The worker's `fetch` listener intercepts
    this request. Because the URL matches `/Static/Application/*.css` and
    _doesn't_ contain the special `?Skip=Intercept` parameter, it proceeds with
    the CSS handling logic.
3.  **Service Worker Responds with JS:** The worker _immediately_ responds to
    the fetch request with a dynamically generated JavaScript module:
    ```javascript
    window._LOAD_CSS_WORKER("/Static/Application/CodeEditorLand/component.css");
    export default {};
    ```
    This JavaScript response is cached in `CACHE_ASSET` using the original CSS
    request URL as the key.
4.  **Browser Executes JS:** The browser receives and executes this JavaScript
    module. The `export default {};` satisfies the expectation of the original
    `import` statement.
5.  **Client Function Call:** The executed JavaScript calls the globally
    available `window._LOAD_CSS_WORKER` function (defined in `Load.js`).
6.  **Client Modifies URL & Creates `<link>`:** The `_LOAD_CSS_WORKER` function
    appends the `?Skip=Intercept` query parameter to the received CSS URL. It
    then creates a standard `<link rel="stylesheet">` tag and appends it to
    `<head>`.
7.  **Browser Fetches CSS:** The browser sees the new `<link>` tag and initiates
    a _second_ fetch request for the CSS file, this time with the
    `?Skip=Intercept` parameter.
8.  **Service Worker Intercept #2:** The worker intercepts this second request.
9.  **Service Worker Serves CSS:** The worker detects the `?Skip=Intercept`
    parameter, bypasses the JS generation logic, and fetches the _actual_ CSS
    content using a **cache-first** strategy against `CACHE_ASSET`. It responds
    with the real CSS content (`Content-Type: text/css`).
10. **Browser Applies Styles:** The browser receives the actual CSS and applies
    the styles.

This two-step fetch process, distinguished by the `Skip=Intercept` parameter,
allows the initial JavaScript import to resolve quickly while triggering the
standard browser mechanism for loading the actual CSS without causing infinite
interception loops.

---

## Deep Dive & Component Breakdown&#x2001;🔬

To understand how `Worker`'s service worker implements the dynamic CSS loading
strategy, see the following source files:

- **[`Policy.ts`](https://github.com/CodeEditorLand/Worker/tree/Current/Source/Worker/Policy.ts)** -
  Main service worker with caching strategies
- **[`Register.ts`](https://github.com/CodeEditorLand/Worker/tree/Current/Source/Worker/Register.ts)** -
  Service worker registration and update handling
- **[`Load.ts`](https://github.com/CodeEditorLand/Worker/tree/Current/Source/Worker/CSS/Load.ts)** -
  Client-side CSS loader function (`window._LOAD_CSS_WORKER`)

---

## HTML Integration Example

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<!--
      IMPORTANT: Load the CSS Loader script EARLY.
      Defines window._LOAD_CSS_WORKER before main app script runs.
    -->
		<script src="/Worker/CSS/Load.js" type="module"></script>

		<!--
      Set the path to the Service Worker file.
      Must come before Register.js.
    -->
		<script>
			window._WORKER = "/Worker.js";
		</script>

		<!--
      Register the Service Worker.
      Handles registration, listens for updates, manages page control.
      Registers with scope '/Application'.
    -->
		<script src="/Worker/Register.js" type="module"></script>
	</head>

	<body>
		<!--
      Load main application script LAST.
      Any dynamic import '/Static/Application/some-component.css'
      will trigger Service Worker interception.
    -->
		<script src="/scripts/main-app.js" type="module"></script>
	</body>
</html>
```

[Worker]: https://NPMJS.Org/@codeeditorland/worker

---

## See Also

- [Worker Documentation](https://land.playform.cloud/Doc/worker)
- [Architecture Overview](https://land.playform.cloud/Doc/architecture)
- [Mountain](https://github.com/CodeEditorLand/Mountain)

---

## License&#x2001;⚖️

This project is released into the public domain under the **Creative Commons CC0
Universal** license. You are free to use, modify, distribute, and build upon
this work for any purpose, without any restrictions. For the full legal text,
see the [`LICENSE`](https://github.com/CodeEditorLand/Worker/tree/Current/)
file.

---

## Changelog&#x2001;📜

Stay updated with our progress! See
[`CHANGELOG.md`](https://github.com/CodeEditorLand/Worker/tree/Current/) for a
history of changes specific to **Worker**.

---

## Funding & Acknowledgements&#x2001;🙏🏻

**Worker** is a core element of the **Land** ecosystem. This project is funded
through [NGI0 Commons Fund](https://NLnet.NL/commonsfund), a fund established by
[NLnet](https://NLnet.NL) with financial support from the European Commission's
[Next Generation Internet](https://ngi.eu) program. Learn more at the
[NLnet project page](https://NLnet.NL/project/Land).

The project is operated by PlayForm, based in Sofia, Bulgaria.

PlayForm acts as the open-source steward for Code Editor Land under the NGI0
Commons Fund grant.

<table>
	<thead>
		<tr>
			<th align="left">
				<strong>
					Land
				</strong>
			</th>
			<th align="left">
				<strong>
					PlayForm
				</strong>
			</th>
			<th align="left">
				<strong>
					NLnet
				</strong>
			</th>
			<th align="left">
				<strong>
					NGI0 Commons Fund
				</strong>
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td align="left" valign="middle">
				<a href="https://Land.PlayForm.Cloud">
					<img width="60" src="https://raw.githubusercontent.com/CodeEditorLand/Asset/refs/heads/Current/Logo/Land.svg" alt="Land" />
				</a>
			</td>
			<td align="left" valign="middle">
				<a href="https://PlayForm.Cloud">
					<img width="76" src="https://raw.githubusercontent.com/PlayForm/Asset/refs/heads/Current/Logo/PlayForm.svg" alt="PlayForm" />
				</a>
			</td>
			<td align="left" valign="middle">
				<a href="https://NLnet.NL">
					<img width="240" src="https://NLnet.NL/logo/banner.svg" alt="NLnet" />
				</a>
			</td>
			<td align="left" valign="middle">
				<a href="https://NLnet.NL/commonsfund">
					<img width="240" src="https://NLnet.NL/image/logos/NGI0CommonsFund_tag_black_mono.svg" alt="NGI0 Commons Fund" />
				</a>
			</td>
		</tr>
	</tbody>
</table>

---

**Project Maintainers**: Source Open
([Source/Open@Land.PlayForm.Cloud](mailto:Source/Open@Land.PlayForm.Cloud)) |
[GitHub Repository](https://github.com/CodeEditorLand/Worker) |
[Report an Issue](https://github.com/CodeEditorLand/Worker/issues) |
[Security Policy](https://github.com/CodeEditorLand/Worker/security/policy)
