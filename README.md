<table><tr><td colspan="1"><h3 align="center"><picture>    </picture> 🍩 </h3></td><td colspan="3" valign="top"><h3 align="center"> Worker </h3></td></tr></table>

---

# [Worker] 🍩

This repository contains a Service Worker designed to enhance web application
performance and reliability through advanced caching, offline support, and a
unique strategy for handling dynamic CSS imports originating from JavaScript
modules.

---

## Core Functionality

- **Asset Caching:** Implements multiple caching strategies:
    - **Core Cache (`CACHE_CORE`):** Stores essential application shell files
      and critical scripts (like `/Application/`, `Register.js`, `Load.js`).
      Uses a **network-first** strategy for navigation requests to ensure users
      get the latest page structure if online, falling back to the cache when
      offline. Pre-caches essential assets on install.
    - **Asset Cache (`CACHE_ASSET`):** Stores static application assets
      (`/Static/Application/*`), including JavaScript, images, and the actual
      CSS files. Uses a **cache-first** strategy for fast loading. Also stores
      the dynamically generated JavaScript modules used for CSS loading (see
      below).
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

## Usage: Dynamic CSS Loading via JS Module Response

This worker implements a specific strategy to handle dynamic CSS imports from
JavaScript modules (e.g., `import './some-styles.css';`) located under the
`/Static/Application/` path. Instead of relying on `postMessage` coordination,
it directly responds to the initial import request with JavaScript code that
initiates the standard browser CSS loading mechanism.

**The Workflow:**

1.  **Initial JS Import:** A JavaScript module in your application attempts to
    import a CSS file located under `/Static/Application/` (e.g.,
    `/Static/Application/CodeEditorLand/component.css`).
2.  **Service Worker Intercept #1:** The worker's `fetch` listener intercepts
    this request. Because the URL matches the pattern
    `/Static/Application/*.css` and _doesn't_ contain the special
    `?Skip=Intercept` parameter, it proceeds with the CSS handling logic.
3.  **Service Worker Responds with JS:** The worker _immediately_ responds to
    the fetch request with a dynamically generated JavaScript module
    (`Content-Type: application/javascript; charset=utf-8`). The content of this
    module is similar to:
    ```javascript
    window._LOAD_CSS_WORKER("/Static/Application/CodeEditorLand/component.css");
    export default {};
    ```
    This JavaScript response is then cached in `CACHE_ASSET` using the original
    CSS request URL as the key.
4.  **Browser Executes JS:** The browser receives and executes this JavaScript
    module. The `export default {};` satisfies the expectation of the original
    `import` statement.
5.  **Client Function Call:** The executed JavaScript calls the globally
    available `window._LOAD_CSS_WORKER` function (which must be defined
    beforehand by including `Load.js`).
6.  **Client Modifies URL & Creates `<link>`:** The `_LOAD_CSS_WORKER` function
    appends the `?Skip=Intercept` query parameter to the received CSS URL (e.g.,
    `/Static/Application/CodeEditorLand/component.css?Skip=Intercept`). It then
    creates a standard `<link rel="stylesheet">` tag, setting its `href` to this
    _modified_ URL, and appends it to the document's `<head>`.
7.  **Browser Fetches CSS:** The browser sees the new `<link>` tag and initiates
    a _second_ fetch request for the CSS file, this time using the URL _with_
    the `?Skip=Intercept` parameter.
8.  **Service Worker Intercept #2:** The worker intercepts this second request.
9.  **Service Worker Serves CSS:** The worker detects the `?Skip=Intercept`
    parameter. It bypasses the JS generation logic and proceeds to fetch the
    _actual_ CSS content using a **cache-first** strategy against `CACHE_ASSET`
    (looking for the URL _including_ the parameter in the cache, or fetching
    from the network). It responds with the real CSS content
    (`Content-Type: text/css`).
10. **Browser Applies Styles:** The browser receives the actual CSS and applies
    the styles as expected.

This two-step fetch process, initiated by the SW's JavaScript response and
distinguished by the `Skip=Intercept` parameter, allows the initial JavaScript
import to resolve quickly while triggering the standard browser mechanism for
loading the actual CSS styles without causing infinite interception loops.

### Example Implementation

This example shows how to integrate the necessary client-side scripts and the
Service Worker registration within an HTML page (`.html` file).

**`index.html` (or your main layout/page):**

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta content="width=device-width, initial-scale=1.0" name="viewport" />
		<title>My App with Service Worker CSS Loading</title>

		<!-- Optional: Favicon, other meta tags -->
		<link href="/favicon.ico" rel="icon" />

		<!--
            IMPORTANT: Load the CSS Loader script EARLY.
            This script defines the global function window._LOAD_CSS_WORKER
            needed by the Service Worker's JS response.
            It needs to run before your main app script tries to import CSS.
        -->
		<script src="/Worker/CSS/Load.js" type="module"></script>

		<!--
            Define the path to the Service Worker file so Register.js can find it.
            This script block should come *before* Register.js.
            Ensure this path correctly points to where your Worker.js is served.
        -->
		<script>
			// Set the path relative to the web root where Worker.js will be served.
			// Default is "/Worker.js"
			window._WORKER = "/Worker.js";
		</script>

		<!--
            Register the Service Worker.
            This script handles registration, listens for updates from the SW
            (triggering reloads), and manages ensuring the SW controls the page.
            It uses the window._WORKER path defined above and registers with scope '/Application'.
        -->
		<script src="/Worker/Register.js" type="module"></script>

		<!-- Optional: Load any other critical CSS or JS needed before the main app -->
		<link href="/styles/base.css" rel="stylesheet" />
	</head>

	<body>
		<header>
			<h1>Application Header</h1>
		</header>

		<main>
			<p>Loading application...</p>

			<!-- Your main application might render into a specific div -->
			<div id="app-container"></div>
		</main>

		<footer>
			<p>Application Footer</p>
		</footer>

		<!--
            Load your main application script LAST.
            Any dynamic import '/Static/Application/some-component.css'
            inside this script or its dependencies will trigger the
            Service Worker interception and JS module response described above.
        -->
		<script src="/scripts/main-app.js" type="module"></script>
	</body>
</html>
```

[Worker]: https://NPMJS.Org/@codeeditorland/worker

---

## Changelog

See [`CHANGELOG.md`](CHANGELOG.md) for a history of changes to this component.

---

## Funding

This project is funded through
[NGI0 Commons Fund](https://nlnet.nl/commonsfund), a fund established by
[NLnet](https://nlnet.nl) with financial support from the European Commission's
[Next Generation Internet](https://ngi.eu) program. Learn more at the
[NLnet project page](https://nlnet.nl/project/Land).

| Land                                                                                                                                                   | PlayForm                                                                                                                                                    | NLnet                                                                                         | NGI0 Commons Fund                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| [<img src="https://raw.githubusercontent.com/CodeEditorLand/Asset/refs/heads/Current/Logo/Land.svg" height="80px" alt="Land"  />](https://editor.land) | [<img src="https://raw.githubusercontent.com/PlayForm/Asset/refs/heads/Current/Logo/PlayForm.svg" height="80px" alt="PlayForm"  />](https://playform.cloud) | [<img width="240px" src="https://nlnet.nl/logo/banner.svg" alt="NLnet"  />](https://nlnet.nl) | [<img width="240px" src="https://nlnet.nl/image/logos/NGI0CommonsFund_tag_black_mono.svg" alt="NGI0 Commons Fund"  />](https://nlnet.nl/commonsfund) |
