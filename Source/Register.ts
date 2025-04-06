declare global {
	interface Window {
		WORKER_CODE_EDITOR_LAND?: string;
	}
}

const Path =
	typeof window.WORKER_CODE_EDITOR_LAND === "string"
		? window.WORKER_CODE_EDITOR_LAND
		: "/Worker.js";

if ("serviceWorker" in navigator) {
	window.addEventListener("load", () =>
		navigator.serviceWorker
			// TODO: MAYBE REWORK WITH CUSTOM OPTIONS
			.register(Path, { scope: "/VSCode" })
			.then((Registration) => {
				console.log(
					"[App /VSCode] Service Worker registered successfully.",
				);

				console.log("[App /VSCode] Scope:", Registration.scope);

				if (navigator.serviceWorker.controller) {
					console.log(
						"[App /VSCode] Service Worker is controlling this page.",
					);
				} else {
					console.log(
						"[App /VSCode] Service Worker registered, but may not control page until next load/activation.",
					);
				}
			})
			.catch((_Error) => {
				console.error(
					"[App /VSCode] Service Worker registration failed:",
					_Error,
				);
			}),
	);
} else {
	console.warn("[App /VSCode] Service Worker not supported.");
}

export default {};
