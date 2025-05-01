declare global {
	interface Window {
		URLWorker: string;
	}
}

declare const __DEV__: boolean;

const Path =
	typeof window.URLWorker === "string" ? window.URLWorker : "/Worker.js";

const Scope = "/Application";

const Reload = "WorkerReload";

export const Log = __DEV__
	? (..._Message: any[]) => {
			console.log(`[Register]`, ..._Message);
		}
	: () => {};

export const ErrorLog = __DEV__
	? (..._Message: any[]) => {
			console.error(`[Register]`, ..._Message);
		}
	: () => {};

export const WarnLog = __DEV__
	? (..._Message: any[]) => {
			console.warn(`[Register]`, ..._Message);
		}
	: () => {};

export const Check = async () => {
	if ("serviceWorker" in navigator) {
		try {
			__DEV__ ? Log("Checking for service worker updates...") : {};

			const Registration = await navigator.serviceWorker.ready;

			if (Registration.active) {
				await Registration.update();

				__DEV__ ? Log("Service worker update check finished.") : {};
			} else {
				__DEV__ ? Log("No active service worker found to update.") : {};
			}
		} catch (_Error) {
			__DEV__
				? ErrorLog("Error checking for service worker updates:", _Error)
				: {};
		}
	} else {
		__DEV__
			? WarnLog("Service Worker not supported, cannot check for updates.")
			: {};
	}
};

if ("serviceWorker" in navigator) {
	navigator.serviceWorker.addEventListener("controllerchange", () => {
		__DEV__ ? Log("Controller changed event fired!") : {};

		if (sessionStorage.getItem(Reload) === "true") {
			__DEV__
				? Log(
						"Reload flag is set, reloading page now to ensure SW control...",
					)
				: {};

			sessionStorage.removeItem(Reload);

			window.location.reload();
		} else {
			__DEV__
				? Log(
						"Controller changed, but no reload needed (flag not set or page likely already controlled).",
					)
				: {};
		}
	});

	navigator.serviceWorker.addEventListener("message", (Event) => {
		__DEV__ ? Log("[Client] Received message from SW:", Event.data) : {};

		if (Event.data && Event.data.Version === "New") {
			__DEV__
				? WarnLog(
						"A new version of the application is available! Reloading page...",
					)
				: {};

			// Optional: Add confirm dialog if needed
			// if (confirm("A new version is available. Reload now?")) {
			//     window.location.reload();
			// }

			window.location.reload();
		}
	});

	const Control = async () => {
		const InitiallyControlled = !!navigator.serviceWorker.controller;

		__DEV__
			? Log(`Page controlled on script start: ${InitiallyControlled}`)
			: {};

		try {
			__DEV__
				? Log(
						`Attempting to register Service Worker: ${Path} with scope: ${Scope}`,
					)
				: {};

			const registration = await navigator.serviceWorker.register(Path, {
				scope: Scope,
				type: "module",
			});

			__DEV__ ? Log("Service Worker registration call finished.") : {};

			__DEV__ ? Log("Registered Scope:", registration.scope) : {};

			if (registration.installing) {
				__DEV__ ? Log("Service Worker installing.") : {};
			} else if (registration.waiting) {
				__DEV__ ? Log("Service Worker waiting to activate.") : {};
			} else if (registration.active) {
				__DEV__
					? Log("Service Worker active upon registration check.")
					: {};
			} else {
				__DEV__
					? Log(
							"Service Worker state unknown after registration call.",
						)
					: {};
			}

			__DEV__ ? Log("Waiting for navigator.serviceWorker.ready...") : {};

			await navigator.serviceWorker.ready;

			__DEV__ ? Log("navigator.serviceWorker.ready resolved.") : {};

			const Controlled = !!navigator.serviceWorker.controller;

			__DEV__
				? Log(
						`Page controlled after registration + ready: ${Controlled}`,
					)
				: {};

			if (!InitiallyControlled && !Controlled) {
				if (!sessionStorage.getItem(Reload)) {
					__DEV__
						? Log(
								"Page needs control and is not controlled after ready. Setting flag and RELOADING.",
							)
						: {};

					sessionStorage.setItem(Reload, "true");

					window.location.reload();

					return;
				} else {
					__DEV__
						? WarnLog(
								"Reload flag was set, but page is still not controlled. SW activation might have failed. Removing flag to prevent loops.",
							)
						: {};

					sessionStorage.removeItem(Reload);
				}
			} else {
				if (sessionStorage.getItem(Reload)) {
					__DEV__
						? Log(
								`Page is now controlled or was already controlled. Clearing unnecessary reload flag.`,
							)
						: {};

					sessionStorage.removeItem(Reload);
				}
				if (Controlled) {
					__DEV__
						? Log(
								"Service Worker is actively controlling this page.",
							)
						: {};
				} else if (InitiallyControlled) {
					__DEV__
						? Log(
								"Service Worker was already controlling this page initially.",
							)
						: {};
				}
			}
		} catch (_Error) {
			__DEV__
				? ErrorLog(
						"Service Worker registration or ready failed:",
						_Error,
					)
				: {};

			sessionStorage.removeItem(Reload);
		}
	};

	if (document.readyState === "loading") {
		__DEV__ ? Log("DOM not ready, deferring SW registration.") : {};

		document.addEventListener("DOMContentLoaded", Control);
	} else {
		__DEV__ ? Log("DOM ready, running SW registration now.") : {};

		Control();
	}
} else {
	__DEV__ ? WarnLog("Service Worker API not supported in this browser.") : {};
}

export default {};
