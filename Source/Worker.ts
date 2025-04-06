declare var self: ServiceWorkerGlobalScope;

const SCRIPT_VERSION = "v0.0.1";

const SHIM_CACHE_NAME = `Shim-${SCRIPT_VERSION}`;

const ASSET_CACHE_NAME = `Asset-${SCRIPT_VERSION}`;

const ALL_CACHES = [SHIM_CACHE_NAME, ASSET_CACHE_NAME];

const SHIM_FILES_TO_PRECACHE = ["/Static/Shim/Variable.js"];

const SHIM_URL_TO_CACHE_PATH_MAP: {
	[key: string]: string;
} = {
	"/Static/Shim/Variable.js": "/Static/Shim/Variable.js",
};

self.addEventListener(
	"install",
	(Event) =>
		console.log(`[SW ${SCRIPT_VERSION}] Installing...`) &&
		Event.waitUntil(
			caches
				.open(SHIM_CACHE_NAME)
				.then(
					(Cache) =>
						console.log(
							`[SW ${SCRIPT_VERSION}] Precaching shims:`,
							SHIM_FILES_TO_PRECACHE,
						) && Cache.addAll(SHIM_FILES_TO_PRECACHE),
				)

				.then(() => self.skipWaiting())
				.catch((_Error) =>
					console.error(
						`[SW ${SCRIPT_VERSION}] Shim Precaching failed:`,
						_Error,
					),
				),
		),
);

self.addEventListener(
	"activate",
	(Event) =>
		console.log(`[SW ${SCRIPT_VERSION}] Activating...`) &&
		Event.waitUntil(
			Promise.all([
				caches.keys().then((Name) => {
					return Promise.all(
						Name.map((Name) =>
							!ALL_CACHES.includes(Name)
								? console.log(
										`[SW ${SCRIPT_VERSION}] Deleting old cache: ${Name}`,
									) && caches.delete(Name)
								: null,
						),
					);
				}),

				self.clients.claim(),
			]).catch((_Error) =>
				console.error(
					`[SW ${SCRIPT_VERSION}] Activation failed:`,
					_Error,
				),
			),
		),
);

self.addEventListener("fetch", (Event) => {
	const _URL = new URL(Event.request.url);

	const Path = _URL.pathname;

	const Request = Event.request;

	// console.log(`[SW ${SCRIPT_VERSION}] Fetch event for: ${Path}`, {
	// 	Method: Request.method,
	// 	Destination: Request.destination,
	// 	URL: Request.url,
	// 	Origin: _URL.origin,
	//
	// 	Scope: self.registration.scope,
	// });

	if (Request.method !== "GET" || _URL.origin !== self.origin) {
		console.log(
			`[SW ${SCRIPT_VERSION}] Ignoring non-GET or cross-origin request: ${Request.method} ${Path}`,
		);

		return;
	}

	if (SHIM_URL_TO_CACHE_PATH_MAP[Path]) {
		const PathCache = SHIM_URL_TO_CACHE_PATH_MAP[Path];

		console.log(
			`[SW ${SCRIPT_VERSION}] Serving shim for ${Path} from cache (${PathCache})`,
		);

		Event.respondWith(
			caches
				.open(SHIM_CACHE_NAME)
				.then((Cache) => Cache.match(PathCache))
				.then((Response) =>
					Response
						? Response
						: console.warn(
								`[SW ${SCRIPT_VERSION}] Shim not found in cache: ${Path}. Fetching from network...`,
							) && fetch(PathCache),
				)
				.catch(
					(_Error) =>
						console.error(
							`[SW ${SCRIPT_VERSION}] Error serving shim ${Path}:`,
							_Error,
						) &&
						new Response(`Error serving shim ${Path}`, {
							status: 500,
						}),
				),
		);

		return;
	}

	if (Path.endsWith(".css") && Path.startsWith("/Static/VSCode/")) {
		console.log(`[SW ${SCRIPT_VERSION}] Intercepting CSS import: ${Path}`);

		Event.respondWith(
			new Response(
				`try {
						if (typeof globalThis._VSCODE_CSS_LOAD === 'function') {
							globalThis._VSCODE_CSS_LOAD('${Request.url}');
						} else {
							console.error('_VSCODE_CSS_LOAD not defined when trying to load ${Request.url}');
						}
	
					} catch(e) {
						console.error('Error executing _VSCODE_CSS_LOAD for ${Request.url}', e);
					}
	
					export default {};`,
				{
					status: 200,
					headers: {
						"Content-Type": "application/javascript; charset=utf-8",
					},
				},
			),
		);

		return;
	}

	if (Path.startsWith("/Static/VSCode/")) {
		console.log(
			`[SW ${SCRIPT_VERSION}] Handling asset request (Cache-First): ${Path}`,
		);

		Event.respondWith(
			caches
				.open(ASSET_CACHE_NAME)
				.then(async (Cache) => {
					const Cached = await Cache.match(Request);

					if (Cached) {
						return (
							console.log(
								`[SW ${SCRIPT_VERSION}] Serving asset from cache: ${Path}`,
							) && Cached
						);
					}

					console.log(
						`[SW ${SCRIPT_VERSION}] Fetching asset from network: ${Path}`,
					);

					try {
						const Network = await fetch(Request);

						if (Network && Network.ok) {
							await Cache.put(Request, Network.clone());
						} else if (!Network) {
							console.error(
								`[SW ${SCRIPT_VERSION}] Network fetch failed for ${Path} (no response)`,
							);
						} else {
							console.warn(
								`[SW ${SCRIPT_VERSION}] Network fetch failed for ${Path} with status: ${Network.status}`,
							);
						}

						return Network;
					} catch (_Error) {
						return (
							console.error(
								`[SW ${SCRIPT_VERSION}] Network fetch failed for ${Path}:`,
								_Error,
							) &&
							new Response(`Failed to fetch asset ${Path}`, {
								status: 503,
							})
						);
					}
				})
				.catch(
					(_Error) =>
						console.error(
							`[SW ${SCRIPT_VERSION}] Error accessing asset cache:`,
							_Error,
						) && fetch(Request),
				),
		);

		return;
	}
});

export {};
