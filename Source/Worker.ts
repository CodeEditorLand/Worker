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

const Log = (...[Message]: any) =>
	console.log(`[Worker ${SCRIPT_VERSION}] ${Message}`);

const ErrorLog = (...[Message]: any) =>
	console.error(`[Worker ${SCRIPT_VERSION}] ${Message}`);

const WarnLog = (...[Message]: any) =>
	console.warn(`[Worker ${SCRIPT_VERSION}] ${Message}`);

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
				_LOAD_CSS_WORKER_CODE_EDITOR_LAND: URL,
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
			.open(SHIM_CACHE_NAME)
			.then((Cache) => {
				Log(`Precaching shims:`, SHIM_FILES_TO_PRECACHE);

				Cache.addAll(SHIM_FILES_TO_PRECACHE);
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
						if (!ALL_CACHES.includes(Name)) {
							Log(`Deleting old cache: ${Name}`);

							caches.delete(Name);
						}
					}),
				);
			}),

			self.clients.claim(),
		]).catch((_Error) => ErrorLog(`Activation failed:`, _Error)),
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
				.open(ASSET_CACHE_NAME)
				.then(async (Load) => {
					const Cache = await Load.match(Request);

					if (Cache) {
						return Cache;
					}

					const _Response = await fetch(Request);

					if (_Response.ok) {
						await Load.put(Request, _Response.clone());
					}

					return _Response;
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

	if (SHIM_URL_TO_CACHE_PATH_MAP[Path]) {
		const PathCache = SHIM_URL_TO_CACHE_PATH_MAP[Path];

		Log(`Serving shim for ${Path} from cache (${PathCache})`);

		Event.respondWith(
			caches
				.open(SHIM_CACHE_NAME)
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
				.open(ASSET_CACHE_NAME)
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
		Log(`Handling asset request (Cache-First): ${Path}`);

		Event.respondWith(
			caches
				.open(ASSET_CACHE_NAME)
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

export default {};
