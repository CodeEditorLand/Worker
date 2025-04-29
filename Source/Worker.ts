declare var self: ServiceWorkerGlobalScope;

const VERSION = "v0.0.1";

const CACHE_CORE = `Core-${VERSION}`;

const CACHE_SHIM = `Shim-${VERSION}`;

const CACHE_ASSET = `Asset-${VERSION}`;

const CACHE = [CACHE_CORE, CACHE_SHIM, CACHE_ASSET];

const CORE_PRECACHE = [
	"/Aplication/",
	"/Worker/Register.js",
	"/Worker/CSS/Load.js",
	"/Worker/CSS/Notify.js",
	"/Static/Shim/Variable.js",
];

const BASE_REMOTE =
	new URLSearchParams(self.location.search).get("BASE_REMOTE") ||
	"https://localhost";

const Log = (..._Message: any[]) => {
	console.log(`[Worker ${VERSION}]`, `(Remote: ${BASE_REMOTE})`, ..._Message);
};

const ErrorLog = (..._Message: any[]) => {
	console.error(
		`[Worker ${VERSION}]`,
		`(Remote: ${BASE_REMOTE})`,
		..._Message,
	);
};

const WarnLog = (..._Message: any[]) => {
	console.warn(
		`[Worker ${VERSION}]`,
		`(Remote: ${BASE_REMOTE})`,
		..._Message,
	);
};

const Notify = async (
	Client: string | null | undefined,

	URL: string,
): Promise<void> => {
	if (!Client) {
		WarnLog(
			`No Client available for CSS request ${URL}. Cannot send postMessage.`,
		);

		return;
	}

	try {
		const Identifier = await self.clients.get(Client);

		if (Identifier) {
			Log(`Sending Load instruction to Client ${Identifier} for ${URL}`);

			Identifier.postMessage({
				_LOAD_CSS_WORKER: URL,
			});
		} else {
			WarnLog(
				`Client ${Identifier} not found for postMessage regarding ${URL}.`,
			);
		}
	} catch (error) {
		ErrorLog(
			`Error sending postMessage to Client ${Client} for ${URL}:`,

			error,
		);
	}
};

self.addEventListener("install", (Event) => {
	Log(`Installing version ${VERSION}...`);

	Event.waitUntil(
		Promise.all([
			caches
				.open(CACHE_CORE)
				.then((cache) => {
					Log(`Precaching Core Assets:`, CORE_PRECACHE);

					return cache.addAll(CORE_PRECACHE);
				})
				.catch((_Error) => ErrorLog("Core Precaching failed:", _Error)),
		]).then(() => {
			Log("Precaching complete. Activating immediately.");

			return self.skipWaiting();
		}),
	);
});

self.addEventListener("activate", (Event) => {
	Log(`Activating version ${VERSION}...`);

	Event.waitUntil(
		Promise.all([
			caches.keys().then((Cache) =>
				Promise.all(
					Cache.map((Cache) => {
						if (!CACHE.includes(Cache)) {
							Log(`Deleting old cache: ${Cache}`);

							return caches.delete(Cache);
						}

						return Promise.resolve();
					}),
				),
			),
			self.clients.claim(),
		])
			.then(() => {
				Log(`Version ${VERSION} activated and controlling clients.`);

				return self.clients
					.matchAll({ type: "window" })
					.then((Client) =>
						Client.forEach((Client) => {
							Log(
								`Sending New Version message to client ${Client.id}`,
							);

							Client.postMessage({ Version: "New" });
						}),
					);
			})
			.catch((_Error) => ErrorLog(`Activation failed:`, _Error)),
	);
});

self.addEventListener("fetch", (Event) => {
	const Request = Event.request;

	const _URL = new URL(Request.url);

	const Path = _URL.pathname;

	const Client = Event.clientId;

	Log(`Fetch event for: ${Path}`, {
		Method: Request.method,

		Destination: Request.destination,

		URL: Request.url,

		Origin: _URL.origin,

		Scope: self.registration.scope,
	});

	if (
		_URL.origin === self.origin &&
		Path === new URL(self.location.href).pathname
	) {
		Log("Ignoring fetch for SW script itself:", Path);

		return;
	}

	if (Request.method !== "GET") {
		Log(`Ignoring non-GET request: ${Request.method} ${Path}`);

		return;
	}

	if (Request.mode === "navigate") {
		Log(`Handling navigation request (Network-First): ${Path}`);

		Event.respondWith(
			(async () => {
				try {
					const _Response = await fetch(Request);

					if (_Response && _Response.ok) {
						Log(`Navigation request fetched from network: ${Path}`);

						(await caches.open(CACHE_CORE)).put(
							Request,
							_Response.clone(),
						);

						return _Response;
					}

					WarnLog(
						`Navigation network fetch failed or returned error (${_Response.status}): ${Path}. Trying cache...`,
					);
				} catch (_Error) {
					WarnLog(
						`Navigation network fetch failed entirely: ${Path}. Trying cache...`,
						_Error,
					);
				}

				const _Response = await (
					await caches.open(CACHE_CORE)
				).match(Request);

				if (_Response) {
					Log(`Serving navigation request from cache: ${Path}`);

					return _Response;
				}

				ErrorLog(
					`Navigation request failed on network and cache: ${Path}`,
				);

				return new Response(
					"Network error: You appear to be offline and the page is not cached.",
					{
						status: 503,
						statusText: "Service Unavailable",
						headers: { "Content-Type": "text/plain" },
					},
				);
			})(),
		);

		return;
	}

	if (
		_URL.searchParams.has("Skip") &&
		_URL.searchParams.get("Skip") === "Worker"
	) {
		Log(`Handling request with Skip=Worker: ${Path}`);

		Event.respondWith(
			caches
				.open(CACHE_ASSET)
				.then(async (Load) => {
					const Cache = await Load.match(Request);

					if (Cache) {
						Log(`Cache hit for Skip=Worker: ${Path}`);

						return Cache;
					}

					Log(`Cache miss for Skip=Worker, fetching: ${Path}`);

					try {
						const _Response = await fetch(Request);

						if (_Response && _Response.ok) {
							Log(
								`Caching successful network response for Skip=Worker: ${Path}`,
							);

							await Load.put(Request, _Response.clone());
						} else if (_Response) {
							WarnLog(
								`Network fetch failed for Skip=Worker ${Path} Status: ${_Response.status}`,
							);
						} else {
							ErrorLog(
								`Network fetch failed entirely for Skip=Worker ${Path}`,
							);
						}

						return _Response;
					} catch (_Error) {
						ErrorLog(
							`Network error fetching Skip=Worker ${Path}:`,
							_Error,
						);

						return new Response(`Failed to fetch ${Path}`, {
							status: 500,
						});
					}
				})
				.catch((_Error) => {
					ErrorLog(
						`Error handling Skip=Worker request for ${Path}:`,
						_Error,
					);

					return fetch(Request);
				}),
		);

		return;
	}

	if (Path.startsWith("/Static/Application/") && Path.endsWith(".css")) {
		Log(`Intercepting Application CSS request as JS Module: ${Path}`);

		Event.respondWith(
			caches
				.open(CACHE_ASSET)
				.then(async (cache) => {
					const Cache = await cache.match(Request);

					if (Cache) {
						Log(
							`Returning cached empty JS module for CSS request: ${Path}`,
						);

						await Notify(Client, Request.url);

						return Cache;
					}

					Log(
						`CSS not cached as JS module. Notifying client ${Client} for ${Request.url}`,
					);

					Notify(Client, Request.url).catch((_Error) =>
						ErrorLog(
							`Failed to Notify client for CSS ${Request.url}:`,
							_Error,
						),
					);

					Log(
						`Creating/caching empty JS module response for CSS request: ${Path}`,
					);

					const _Response = new Response("export default {};", {
						status: 200,
						headers: {
							"Content-Type":
								"application/javascript; charset=utf-8",
						},
					});

					await cache.put(Request, _Response.clone());

					return _Response;
				})
				.catch((_Error) => {
					ErrorLog(
						`Error during CSS-as-JS interception for ${Path}:`,
						_Error,
					);

					return new Response(
						`// Error intercepting CSS as JS ${Path}`,
						{
							status: 500,
							headers: {
								"Content-Type": "application/javascript",
							},
						},
					);
				}),
		);

		return;
	}

	if (Path.startsWith("/Static/Application/")) {
		Log(`Handling Application asset request (Cache-First): ${Path}`);

		Event.respondWith(
			caches
				.open(CACHE_ASSET)
				.then(async (cache) => {
					const Cache = await cache.match(Request);

					if (Cache) {
						Log(`Serving Application asset from cache: ${Path}`);

						return Cache;
					}

					Log(`Fetching Application asset from network: ${Path}`);

					try {
						const _Response = await fetch(Request);

						if (_Response && _Response.ok) {
							Log(
								`Caching successful network response for Application asset: ${Path}`,
							);

							await cache.put(Request, _Response.clone());
						} else if (!_Response) {
							ErrorLog(
								`Network fetch failed for Application asset ${Path} (no response)`,
							);
						} else {
							WarnLog(
								`Network fetch failed for Application asset ${Path} with status: ${_Response.status}`,
							);
						}

						return (
							_Response ||
							new Response(
								`Failed to fetch asset ${Path} (no response)`,
								{ status: 504 },
							)
						);
					} catch (_Error) {
						ErrorLog(
							`Network fetch failed for Application asset ${Path}:`,
							_Error,
						);

						return new Response(
							`Failed to fetch asset ${Path} while offline`,
							{ status: 503 },
						);
					}
				})
				.catch((_Error) => {
					ErrorLog(
						`Error accessing asset cache for ${Path}:`,
						_Error,
					);

					return fetch(Request);
				}),
		);

		return;
	}

	WarnLog(
		`Request not handled by specific strategies: ${Path}. Letting browser handle.`,
	);
});

self.addEventListener("message", (event) => {
	Log(`Received message from client:`, event.data);

	// Example: Handle a specific message type
	// if (event.data && event.data.type === 'CLEAR_CACHE') {

	//     Log('Received instruction to clear cache.');

	//     // Add cache clearing logic here if needed
	// }
});

export default {};
