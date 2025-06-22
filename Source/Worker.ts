declare var self: ServiceWorkerGlobalScope;

declare const __DEV__: boolean;

declare const __INCREMENT__: string;

const INCREMENT = __INCREMENT__ ?? "Initial";

const CACHE_CORE = `Core-${INCREMENT}`;

const CACHE_ASSET = `Asset-${INCREMENT}`;

const CACHE = [CACHE_CORE, CACHE_ASSET];

const CORE_PRECACHE = [
	"/Application",

	"/Worker/Policy.js",

	"/Worker/Register.js",

	"/Worker/CSS/Load.js",
];

const BASE_REMOTE =
	new URLSearchParams(self.location.search).get("BASE_REMOTE") ||
	self.location.origin;

const Log = __DEV__
	? (..._Message: any[]) => {
			console.log(
				`[Worker ${INCREMENT}]`,

				`(Remote: ${BASE_REMOTE})`,

				..._Message,
			);
		}
	: () => {};

const ErrorLog = __DEV__
	? (..._Message: any[]) => {
			console.error(
				`[Worker ${INCREMENT}]`,

				`(Remote: ${BASE_REMOTE})`,

				..._Message,
			);
		}
	: () => {};

const WarnLog = __DEV__
	? (..._Message: any[]) => {
			console.warn(
				`[Worker ${INCREMENT}]`,

				`(Remote: ${BASE_REMOTE})`,

				..._Message,
			);
		}
	: () => {};

self.addEventListener("install", (Event) => {
	__DEV__ && Log(`Installing version ${INCREMENT}...`);

	Event.waitUntil(
		Promise.all([
			caches
				.open(CACHE_CORE)
				.then((cache) => {
					__DEV__ && Log(`Precaching Core Assets:`, CORE_PRECACHE);

					return cache.addAll(CORE_PRECACHE);
				})
				.catch(
					(_Error) =>
						__DEV__ && ErrorLog("Core Precaching failed:", _Error),
				),
		]).then(() => {
			__DEV__ && Log("Precaching complete. Activating immediately.");

			return self.skipWaiting();
		}),
	);
});

self.addEventListener("activate", (Event) => {
	__DEV__ && Log(`Activating version ${INCREMENT}...`);

	Event.waitUntil(
		Promise.all([
			caches
				.keys()
				.then((Cache) =>
					Promise.all(
						Cache.map((Cache) => {
							if (!CACHE.includes(Cache)) {
								__DEV__ && Log(`Deleting old cache: ${Cache}`);

								return caches.delete(Cache);
							}

							return Promise.resolve();
						}),
					),
				)
				.catch((err) => {
					__DEV__ &&
						ErrorLog(
							"Cache cleanup failed during activation:",

							err,
						);

					return Promise.resolve();
				}),

			self.clients
				.claim()
				.then(() => {
					__DEV__ && Log("Clients claimed successfully.");
				})
				.catch((err) => {
					__DEV__ && ErrorLog("self.clients.claim() failed:", err);

					return Promise.resolve();
				}),
		])
			.then(async () => {
				__DEV__ &&
					Log(
						`Version ${INCREMENT} activated and controlling clients.`,
					);

				return (
					await self.clients.matchAll({
						type: "window",
					})
				).forEach((Client) => {
					__DEV__ &&
						Log(
							`Sending New Version message to client ${Client.id}`,
						);

					Client.postMessage({ Version: "New" });
				});
			})
			.catch(
				(_Error) =>
					__DEV__ && ErrorLog(`Activation failed overall:`, _Error),
			),
	);
});

self.addEventListener("fetch", (Event) => {
	const Request = Event.request;

	const _URL = new URL(Request.url);

	const Path = _URL.pathname;

	const Client = Event.clientId;

	__DEV__ &&
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
		__DEV__ && Log("Ignoring fetch for SW script itself:", Path);

		return;
	}

	if (Request.method !== "GET") {
		__DEV__ && Log(`Ignoring non-GET request: ${Request.method} ${Path}`);

		return;
	}

	if (Request.mode === "navigate") {
		__DEV__ && Log(`Handling navigation request (Network-First): ${Path}`);

		Event.respondWith(
			(async () => {
				try {
					const _Response = await fetch(Request);

					if (_Response && _Response.ok) {
						__DEV__ &&
							Log(
								`Navigation request fetched from network: ${Path}`,
							);

						(await caches.open(CACHE_CORE)).put(
							Request,

							_Response.clone(),
						);

						return _Response;
					}

					__DEV__ &&
						WarnLog(
							`Navigation network fetch failed or returned error (${_Response.status}): ${Path}. Trying cache...`,
						);
				} catch (_Error) {
					__DEV__ &&
						WarnLog(
							`Navigation network fetch failed entirely: ${Path}. Trying cache...`,

							_Error,
						);
				}

				const _Response = await (
					await caches.open(CACHE_CORE)
				).match(Request);

				if (_Response) {
					__DEV__ &&
						Log(`Serving navigation request from cache: ${Path}`);

					return _Response;
				}

				__DEV__ &&
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
		_URL.searchParams.get("Skip") === "Intercept"
	) {
		__DEV__ && Log(`Handling request with Skip=Intercept: ${Path}`);

		Event.respondWith(
			caches
				.open(CACHE_ASSET)
				.then(async (Load) => {
					const Cache = await Load.match(Request);

					if (Cache) {
						__DEV__ && Log(`Cache hit for Skip=Intercept: ${Path}`);

						return Cache;
					}

					__DEV__ &&
						Log(`Cache miss for Skip=Intercept, fetching: ${Path}`);

					try {
						const _Response = await fetch(Request);

						if (_Response && _Response.ok) {
							__DEV__ &&
								Log(
									`Caching successful network response for Skip=Intercept: ${Path}`,
								);

							await Load.put(Request, _Response.clone());
						} else if (_Response) {
							__DEV__ &&
								WarnLog(
									`Network fetch failed for Skip=Intercept ${Path} Status: ${_Response.status}`,
								);
						} else {
							__DEV__ &&
								ErrorLog(
									`Network fetch failed entirely for Skip=Intercept ${Path}`,
								);
						}

						return _Response;
					} catch (_Error) {
						__DEV__ &&
							ErrorLog(
								`Network error fetching Skip=Intercept ${Path}:`,

								_Error,
							);

						return new Response(`Failed to fetch ${Path}`, {
							status: 500,
						});
					}
				})
				.catch((_Error) => {
					__DEV__ &&
						ErrorLog(
							`Error handling Skip=Intercept request for ${Path}:`,

							_Error,
						);

					return fetch(Request);
				}),
		);

		return;
	}

	if (Path.startsWith("/Static/Application/") && Path.endsWith(".css")) {
		__DEV__ &&
			Log(`Intercepting Application CSS request as JS Module: ${Path}`);

		Event.respondWith(
			caches
				.open(CACHE_ASSET)
				.then(async (Cache) => {
					const __Response = await Cache.match(Request);

					if (__Response) {
						__DEV__ &&
							Log(
								`Returning cached empty JS module for CSS request: ${Path}`,
							);

						return __Response;
					}

					__DEV__ &&
						Log(
							`CSS not cached as JS module. Notifying client ${Client} for ${Request.url}`,
						);

					__DEV__ &&
						Log(
							`Creating/caching empty JS module response for CSS request: ${Path}`,
						);

					const _Response = new Response(
						`window._LOAD_CSS_WORKER('${Path}'); export default {};`,

						{
							status: 200,

							headers: {
								"Content-Type":
									"application/javascript; charset=utf-8",
							},
						},
					);

					await Cache.put(Request, _Response.clone());

					return _Response;
				})
				.catch((_Error) => {
					__DEV__ &&
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
		__DEV__ &&
			Log(`Handling Application asset request (Cache-First): ${Path}`);

		Event.respondWith(
			caches
				.open(CACHE_ASSET)
				.then(async (cache) => {
					const Cache = await cache.match(Request);

					if (Cache) {
						__DEV__ &&
							Log(
								`Serving Application asset from cache: ${Path}`,
							);

						return Cache;
					}

					__DEV__ &&
						Log(`Fetching Application asset from network: ${Path}`);

					try {
						const _Response = await fetch(Request);

						if (_Response && _Response.ok) {
							__DEV__ &&
								Log(
									`Caching successful network response for Application asset: ${Path}`,
								);

							await cache.put(Request, _Response.clone());
						} else if (!_Response) {
							__DEV__ &&
								ErrorLog(
									`Network fetch failed for Application asset ${Path} (no response)`,
								);
						} else {
							__DEV__ &&
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
						__DEV__ &&
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
					__DEV__ &&
						ErrorLog(
							`Error accessing asset cache for ${Path}:`,

							_Error,
						);

					return fetch(Request);
				}),
		);

		return;
	}

	__DEV__ &&
		WarnLog(
			`Request not handled by specific strategies: ${Path}. Letting browser handle.`,
		);
});

self.addEventListener("message", (event) => {
	__DEV__ && Log(`Received message from client:`, event.data);
});

export default {};
