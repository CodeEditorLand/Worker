declare var self: ServiceWorkerGlobalScope;

const VERSION = "v0.0.1";

const CACHE_SHIM = `Shim-${VERSION}`;

const CACHE_ASSET = `Asset-${VERSION}`;

const CACHE = [CACHE_SHIM, CACHE_ASSET];

const SHIM_PRECACHE = ["/Static/Shim/Variable.js"];

const SHIM_MAP: {
	[key: string]: string;
} = {
	"/Static/Shim/Variable.js": "/Static/Shim/Variable.js",
};

const BASE_REMOTE = "http://localhost";

const Log = (..._Message: any[]) => {
	console.log(`[Worker ${VERSION}]`, ..._Message);
};

const ErrorLog = (..._Message: any[]) => {
	console.error(`[Worker ${VERSION}]`, ..._Message);
};

const WarnLog = (..._Message: any[]) => {
	console.warn(`[Worker ${VERSION}]`, ..._Message);
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
	Log(`Installing...`);

	Event.waitUntil(
		caches
			.open(CACHE_SHIM)
			.then((Cache) => {
				Log(`Precaching shims:`, SHIM_PRECACHE);

				Cache.addAll(SHIM_PRECACHE);
			})
			.then(() => self.skipWaiting())
			.catch((_Error) => ErrorLog(`Shim Precaching failed:`, _Error)),
	);
});

self.addEventListener("activate", (Event) => {
	Log(`Activating...`);

	Event.waitUntil(
		Promise.all([
			caches.keys().then((Name) => {
				return Promise.all(
					Name.map((Name) => {
						if (!CACHE.includes(Name)) {
							Log(`Deleting old cache: ${Name}`);

							return caches.delete(Name);
						}

						return Promise.resolve();
					}),
				);
			}),

			self.clients.claim(),
		])
			.then(() => {
				Log("New worker activated. Notifying clients.");

				return self.clients.matchAll({ type: "window" });
			})
			.then((Client) => {
				Client.forEach((Client) => {
					Log(`Sending New to client ${Client.id}`);

					Client.postMessage({ Version: "New" });
				});
			})
			.catch((_Error) => ErrorLog(`Activation failed:`, _Error)),
	);
});

self.addEventListener("fetch", (Event) => {
	const _URL = new URL(Event.request.url);

	const Path = _URL.pathname;

	const Request = Event.request;

	const Client = Event.clientId;

	Log(`Fetch event for: ${Path}`, {
		Method: Request.method,

		Destination: Request.destination,

		URL: Request.url,

		Origin: _URL.origin,

		Scope: self.registration.scope,
	});

	if (
		_URL.searchParams.has("Skip") &&
		_URL.searchParams.get("Skip") === "Worker"
	) {
		Event.respondWith(
			caches
				.open(CACHE_ASSET)
				.then(async (Load) => {
					const Cache = await Load.match(Request);

					if (Cache) {
						return Cache;
					}

					const Response = await fetch(Request);

					if (Response.ok) {
						await Load.put(Request, Response.clone());
					}

					return Response;
				})
				.catch(() => fetch(Request)),
		);

		return;
	}

	if (Request.method !== "GET" || _URL.origin !== self.origin) {
		Log(
			`Ignoring non-GET or cross-origin request: ${Request.method} ${Path}`,
		);

		return;
	}

	if (SHIM_MAP[Path]) {
		const PathCache = SHIM_MAP[Path];

		Log(`Serving shim for ${Path} from cache (${PathCache})`);

		Event.respondWith(
			caches
				.open(CACHE_SHIM)
				.then((Load) => Load.match(PathCache))
				.then((Response) => {
					if (Response) {
						return Response;
					}

					WarnLog(
						`Shim not found in cache: ${Path}. Fetching from network...`,
					);

					return fetch(PathCache);
				})
				.catch((_Error) => {
					ErrorLog(`Error serving shim ${Path}:`, _Error);

					return new Response(`Error serving shim ${Path}`, {
						status: 500,
					});
				}),
		);

		return;
	}

	if (Path.endsWith(".css") && Path.startsWith("/Static/VSCode/")) {
		Log(`Intercepting CSS import: ${Path}`);

		Event.respondWith(
			caches
				.open(CACHE_ASSET)
				.then(async (Load) => {
					await Notify(Client, Request.url);

					const Cache = await Load.match(Request);

					if (Cache) {
						Log(
							`Returning cached empty JS module for CSS request: ${Path}`,
						);

						return Cache;
					}

					Log(
						`Creating/caching empty JS module for CSS request: ${Path}`,
					);

					const _Response = new Response("export default {};", {
						status: 200,

						headers: {
							"Content-Type":
								"application/javascript; charset=utf-8",
						},
					});

					await Load.put(Request, _Response.clone());

					return _Response;
				})
				.catch((_Error) => {
					ErrorLog(
						`Error handling CSS intercept response for ${Path}:`,

						_Error,
					);

					return new Response("// Error handling CSS intercept", {
						status: 500,

						headers: { "Content-Type": "application/javascript" },
					});
				}),
		);

		return;
	}

	if (Path.startsWith("/Static/VSCode/")) {
		Log(`Handling asset request (Network-First): ${Path}`);

		const URL_REMOTE = BASE_REMOTE + Path;

		Event.respondWith(
			fetch(URL_REMOTE)
				.then(async (_Response) => {
					if (_Response && _Response.ok) {
						Log(`Fetched asset from remote: ${URL_REMOTE}`);

						const Cache = await caches.open(CACHE_ASSET);

						await Cache.put(Request, _Response.clone());

						return _Response;
					}

					WarnLog(
						`Remote fetch failed for ${URL_REMOTE} with status: ${_Response.status}. Trying cache...`,
					);

					return caches
						.open(CACHE_ASSET)
						.then((cache) => cache.match(Request))
						.then((Response) => {
							if (Response) {
								Log(
									`Serving asset from cache after remote fail: ${Path}`,
								);

								return Response;
							}

							WarnLog(
								`Asset not found in cache either: ${Path}. Returning original network error.`,
							);

							return _Response;
						});
				})
				.catch(async (_Error) => {
					ErrorLog(`Remote fetch failed for ${URL_REMOTE}:`, _Error);

					WarnLog(`Trying cache for ${Path}...`);

					const _Response = await (
						await caches.open(CACHE_ASSET)
					).match(Request);

					if (_Response) {
						Log(
							`Serving asset from cache after remote error: ${Path}`,
						);

						return _Response;
					}

					ErrorLog(
						`Asset not found in cache after remote error: ${Path}`,
					);

					return new Response(`Failed to fetch asset ${Path}`, {
						status: 503,

						statusText: "Service Unavailable",
					});
				}),
		);

		return;
	}

	if (Path.startsWith("/Static/VSCode/")) {
		Log(`Handling asset request (Cache-First): ${Path}`);

		Event.respondWith(
			caches
				.open(CACHE_ASSET)
				.then(async (Cache) => {
					const Cached = await Cache.match(Request);

					if (Cached) {
						Log(`Serving asset from cache: ${Path}`);

						return Cached;
					}

					Log(`Fetching asset from network: ${Path}`);

					try {
						const Network = await fetch(Request);

						if (Network && Network.ok) {
							await Cache.put(Request, Network.clone());
						} else if (!Network) {
							ErrorLog(
								`Network fetch failed for ${Path} (no response)`,
							);
						} else {
							WarnLog(
								`Network fetch failed for ${Path} with status: ${Network.status}`,
							);
						}

						return Network;
					} catch (_Error) {
						ErrorLog(`Network fetch failed for ${Path}:`, _Error);

						return new Response(`Failed to fetch asset ${Path}`, {
							status: 503,
						});
					}
				})
				.catch((_Error) => {
					ErrorLog(`Error accessing asset cache:`, _Error);

					return fetch(Request);
				}),
		);

		return;
	}
});

self.addEventListener("message", (event) => {
	Log(`[Worker] Received message from client:`, event.data);
	// Example: Handle a specific message type
	// if (event.data && event.data.type === 'CLEAR_CACHE') {
	//     Log('[Worker] Received instruction to clear cache.');
	//     // Add cache clearing logic here if needed
	// }
});

export default {};
