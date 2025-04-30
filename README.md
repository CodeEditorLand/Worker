<table><tr><td colspan="1"><h3 align="center"><picture>    </picture> 🍩 </h3></td><td colspan="3" valign="top"><h3 align="center"> Worker </h3></td></tr></table>

# [Worker] 🍩

## Usage: Dynamic CSS Loading via `postMessage`

This worker implements a specific strategy to handle dynamic CSS imports from
JavaScript modules (e.g., `import './some-styles.css';`) while preserving the
granular loading pattern often found in large applications. Instead of bundling
or injecting styles directly at build time, it coordinates between the Service
Worker and the client application at runtime using `postMessage`.

**The Workflow:**

1.  **Initial JS Import:** A JavaScript module in your application attempts to
    import a CSS file (e.g., `/Static/CodeEditorLand/component.css`).
2.  **Service Worker Intercept #1:** The worker's `fetch` listener intercepts
    this request. Because the URL doesn't contain the special `?Skip=Intercept`
    parameter, it proceeds with the CSS handling logic.
3.  **Notify Client:** The worker calls an internal `Notify` function. This
    function finds the client window that made the request and sends it a
    `postMessage` containing the original CSS URL.
4.  **Service Worker Responds (JS):** Concurrently with sending the message, the
    worker responds to the _original_ fetch request with a minimal JavaScript
    module (`export default {};`). This satisfies the expectation of the
    JavaScript `import` statement.
5.  **Client Receives Message:** A `message` listener in the client-side
    JavaScript receives the instruction from the Service Worker.
6.  **Client Initiates Load:** The message listener calls a globally defined
    function (`window._LOAD_CSS_WORKER`) with the original CSS
    URL.
7.  **Client Modifies URL & Creates `<link>`:** The
    `_LOAD_CSS_WORKER` function appends the `?Skip=Intercept`
    query parameter to the received CSS URL. It then creates a standard
    `<link rel="stylesheet">` tag, setting its `href` to this _modified_ URL,
    and appends it to the document's `<head>`.
8.  **Browser Fetches for `<link>`:** The browser sees the new `<link>` tag and
    initiates a _second_ fetch request for the CSS file, this time using the URL
    _with_ the `?Skip=Intercept` parameter.
9.  **Service Worker Intercept #2:** The worker intercepts this second request.
10. **Service Worker Bypasses & Serves CSS:** The worker detects the
    `?Skip=Intercept` parameter. It bypasses the notification/JS-injection logic
    and proceeds to fetch the _actual_ CSS content using a cache-first strategy
    (looking for the URL _including_ the parameter in the cache, or fetching
    from the network). It responds with the real CSS content
    (`Content-Type: text/css`).
11. **Browser Applies Styles:** The browser receives the actual CSS and applies
    the styles as expected.

This two-step process, coordinated via `postMessage` and distinguished by the
`Skip=Intercept` parameter, allows the initial JavaScript import to resolve quickly
while triggering the standard browser mechanism for loading the actual CSS
styles without causing an infinite loop in the Service Worker.

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
            IMPORTANT: Load the CSS Loader script early.
            This script defines the global function window._LOAD_CSS_WORKER
            and sets up the listener for messages from the Service Worker.
            It needs to run before your main app script tries to import CSS.
        -->
		<script src="/Worker/CSS/Load.js" type="module"></script>

		<!--
            Define the path to the Service Worker file so Register.js can find it.
            This script block should come *before* Register.js.
        -->
		<script>
			// Set the path relative to the web root where Worker.js will be served.
			window._WORKER = "/Worker.js";
		</script>

		<!--
            Register the Service Worker.
            This script uses the window._WORKER path defined above.
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
            Any dynamic import './some-component.css' inside this script
            or its dependencies will trigger the Service Worker interception.
        -->
		<script src="/scripts/main-app.js" type="module"></script>
	</body>
</html>
```

[Worker]: HTTPS://NPMJS.Org/@codeeditorland/worker

## Changelog

See [`CHANGELOG.md`](CHANGELOG.md) for a history of changes to this component.

## Funding

This project is funded through
[NGI0 Commons Fund](https://nlnet.nl/commonsfund), a fund established by
[NLnet](https://nlnet.nl) with financial support from the European Commission's
[Next Generation Internet](https://ngi.eu) program. Learn more at the
[NLnet project page](https://nlnet.nl/project/Land).

| Land                                                                                                                                                   | PlayForm                                                                                                                                                    | NLnet                                                                                         | NGI0 Commons Fund                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| [<img src="https://raw.githubusercontent.com/CodeEditorLand/Asset/refs/heads/Current/Logo/Land.svg" height="80px" alt="Land"  />](https://editor.land) | [<img src="https://raw.githubusercontent.com/PlayForm/Asset/refs/heads/Current/Logo/PlayForm.svg" height="80px" alt="PlayForm"  />](https://playform.cloud) | [<img width="240px" src="https://nlnet.nl/logo/banner.svg" alt="NLnet"  />](https://nlnet.nl) | [<img width="240px" src="https://nlnet.nl/image/logos/NGI0CommonsFund_tag_black_mono.svg" alt="NGI0 Commons Fund"  />](https://nlnet.nl/commonsfund) |
