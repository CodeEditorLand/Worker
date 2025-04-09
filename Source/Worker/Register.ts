declare global {
	interface Window {
		_WORKER: string;
	}
}

const Path = typeof window._WORKER === "string" ? window._WORKER : "/Worker.js";

export const Log = (...[_Message]: any) => {
	// console.log(`[App /VSCode] ${_Message}`);
};

export const ErrorLog = (...[_Message]: any) => {
	// console.error(`[App /VSCode] ${_Message}`);
};

export const WarnLog = (...[_Message]: any) => {
	// console.warn(`[App /VSCode] ${_Message}`);
};

if ("serviceWorker" in navigator) {
	window.addEventListener("load", () =>
		navigator.serviceWorker
			// TODO: MAYBE REWORK WITH CUSTOM OPTIONS / VERSION CONTROL Worker.js?SomeHASH(Version+URL)
			.register(Path, { scope: "/VSCode", type: "module" })
			.then((Registration) => {
				Log("Service Worker registered successfully.");

				Log("Scope:", Registration.scope);

				if (navigator.serviceWorker.controller) {
					Log("Service Worker is controlling this page.");
				} else {
					Log(
						"Service Worker registered, but may not control page until next load/activation.",
					);
				}
			})
			.catch((_Error) => {
				ErrorLog("Service Worker registration failed:", _Error);
			}),
	);
} else {
	WarnLog("Service Worker not supported.");
}

export default {};
