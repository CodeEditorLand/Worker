/**
 * @module Worker/Telemetry/Bridge
 * @description
 * Service-worker dual-pipe (PostHog + OTLP) bridge. Mirrors Cocoon's
 * shape but uses the SW-available `fetch` API directly (no Node http,
 * no posthog-js SDK - SWs can't load CDN scripts post-install).
 *
 * Build-baked endpoint + key from `import.meta.env` injected by the
 * astro/Vite pipeline that bundles the worker bundle. Honors
 * `Capture` master kill + `Report` / `OTLPEnabled` per-pipe toggles.
 *
 * Exports:
 *   CaptureEvent(name, properties) - PostHog `/capture/`
 *   CaptureSpan(name, startMs, endMs, attributes) - OTLP `/v1/traces`
 *   Initialize() - stamp SW install, register error listener
 */

declare const __DEV__: boolean;

type Properties = Record<string, unknown>;

const ImportEnv =
	(typeof import.meta !== "undefined" &&
		(import.meta as Record<string, unknown>).env) ||
	({} as Record<string, string | undefined>);

const ReadEnv = (Key: string, Fallback: string): string =>
	((ImportEnv as Record<string, string | undefined>)[Key] as
		| string
		| undefined) ?? Fallback;

const TelemetryCaptureEnabled = ReadEnv("Capture", "true") !== "false";

const PostHogEnabled =
	TelemetryCaptureEnabled && ReadEnv("Report", "true") !== "false";

const OTLPEnabled =
	TelemetryCaptureEnabled && ReadEnv("OTLPEnabled", "true") !== "false";

const Authorize = ReadEnv("Authorize", "");

const Beam = ReadEnv("Beam", "https://eu.i.posthog.com");

const OTLPEndpoint = ReadEnv("OTLPEndpoint", "http://127.0.0.1:4318");

const Brand = ReadEnv("Brand", "");

const ResolveDistinctIdentifier = (): string => {
	if (Brand.length > 0) return Brand;

	return "land-dev-worker-shared";
};

const RandomHex = (Bytes: number): string => {
	const Buf = new Uint8Array(Bytes);

	crypto.getRandomValues(Buf);

	return Array.from(Buf, (B) => B.toString(16).padStart(2, "0")).join("");
};

let TraceIdentifierCached: string | undefined;

export const TraceIdentifier = (): string => {
	if (!TraceIdentifierCached) TraceIdentifierCached = RandomHex(16);

	return TraceIdentifierCached;
};

export const CaptureEvent = (
	Name: string,

	Properties: Properties = {},
): void => {
	if (!PostHogEnabled || !__DEV__) return;

	if (!Authorize) return;

	const Body = JSON.stringify({
		api_key: Authorize,
		event: Name,
		timestamp: new Date().toISOString(),
		distinct_id: ResolveDistinctIdentifier(),
		properties: {
			$app: "fiddee",
			$app_version: "0.0.1",
			$build_mode: "debug",
			$component: "worker",
			$tier: "worker",
			$lib: "land-worker-telemetry",
			$trace_id: TraceIdentifier(),
			...Properties,
		},
	});

	void fetch(`${Beam}/capture/`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: Body,
		keepalive: true,
	}).catch(() => {});
};

export const CaptureSpan = (
	Name: string,

	StartMs: number,

	EndMs: number,

	Attributes: ReadonlyArray<readonly [string, string]> = [],
): void => {
	if (!OTLPEnabled || !__DEV__) return;

	const SpanIdentifier = RandomHex(8);

	const TraceIdentifierResolved = TraceIdentifier();

	const StatusCode = Name.includes("error") ? 2 : 1;

	const StartNano = String(BigInt(Math.floor(StartMs)) * 1_000_000n);

	const EndNano = String(BigInt(Math.floor(EndMs)) * 1_000_000n);

	const Body = JSON.stringify({
		resourceSpans: [
			{
				resource: {
					attributes: [
						{
							key: "service.name",
							value: { stringValue: "land-editor-worker" },
						},
						{
							key: "service.version",
							value: { stringValue: "0.0.1" },
						},
						{ key: "land.tier", value: { stringValue: "worker" } },
					],
				},
				scopeSpans: [
					{
						scope: { name: "land.worker", version: "1.0.0" },
						spans: [
							{
								traceId: TraceIdentifierResolved,
								spanId: SpanIdentifier,
								name: Name,
								kind: 1,
								startTimeUnixNano: StartNano,
								endTimeUnixNano: EndNano,
								attributes: Attributes.map(([Key, Value]) => ({
									key: Key,
									value: { stringValue: Value },
								})),
								status: { code: StatusCode },
							},
						],
					},
				],
			},
		],
	});

	void fetch(`${OTLPEndpoint.replace(/\/$/, "")}/v1/traces`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: Body,
		keepalive: true,
	}).catch(() => {});
};

export const Initialize = (): void => {
	CaptureEvent("land:worker:session:start", {
		scope:
			typeof self !== "undefined" &&
			(self as { location?: Location }).location
				? (self as { location: Location }).location.pathname
				: "unknown",
	});
};

export default { CaptureEvent, CaptureSpan, TraceIdentifier, Initialize };
