declare global {
	interface Window {
		_WORKER: string;
	}
}

const Path = typeof window._WORKER === "string" ? window._WORKER : "/Worker.js";

const Scope = "/VSCode";

const Reload = "_RELOAD_WORKER";

export const Log = (..._Message: any[]) => {
	console.log(`[App /VSCode]`, ..._Message);
};

export const ErrorLog = (..._Message: any[]) => {
	console.error(`[App /VSCode]`, ..._Message);
};

export const WarnLog = (..._Message: any[]) => {
	console.warn(`[App /VSCode]`, ..._Message);
};

export const Check = async () => {
	if ("serviceWorker" in navigator) {
		try {
			Log("Checking for service worker updates...");

			await (await navigator.serviceWorker.ready).update();

			Log("Service worker update check finished.");
		} catch (_Error) {
			ErrorLog("Error checking for service worker updates:", _Error);
		}
	} else {
		WarnLog("Service Worker not supported, cannot check for updates.");
	}
};

if ("serviceWorker" in navigator) {
	const Control = async () => {
		try {
			const Need = !navigator.serviceWorker.controller;

			Log(
				`Page controller status on load: ${Need ? "None (reload might be needed)" : "Active"}`,
			);

			navigator.serviceWorker.addEventListener("controllerchange", () => {
				Log(
					"Controller changed! New service worker may now control this page.",
				);

				if (sessionStorage.getItem(Reload) === "true") {
					Log(
						"Reloading page to ensure SW control from the start...",
					);

					sessionStorage.removeItem(Reload);

					window.location.reload();
				} else {
					Log(
						"Controller changed, but no reload needed (either already controlled or flag not set).",
					);
				}
			});

			const Register = await navigator.serviceWorker.register(Path, {
				scope: Scope,
				type: "module",
			});

			Log("Service Worker registration attempt finished.");

			Log("Scope:", Register.scope);

			if (Register.installing) {
				Log("Service Worker installing.");
			} else if (Register.waiting) {
				Log(
					"Service Worker installed but waiting to activate (should be skipped by skipWaiting).",
				);
			} else if (Register.active) {
				Log("Service Worker is active.");
			}

			if (Need) {
				if (
					!navigator.serviceWorker.controller &&
					!sessionStorage.getItem(Reload)
				) {
					Log(
						"No active controller detected immediately after registration. Setting flag for reload on controllerchange.",
					);

					sessionStorage.setItem(Reload, "true");
				} else if (navigator.serviceWorker.controller) {
					Log(
						"Controller became active during registration check. Clearing any potential reload flag.",
					);

					sessionStorage.removeItem(Reload);
				}
			} else {
				if (sessionStorage.getItem(Reload)) {
					Log(
						"Page was already controlled. Ensuring reload flag is cleared.",
					);

					sessionStorage.removeItem(Reload);
				}
			}

			if (navigator.serviceWorker.controller) {
				Log("Service Worker is actively controlling this page now.");
			} else {
				Log(
					"Service Worker registered, but controller not yet active. Waiting for controllerchange event.",
				);
			}
		} catch (_Error) {
			ErrorLog("Service Worker registration failed:", _Error);

			sessionStorage.removeItem(Reload);
		}
	};

	navigator.serviceWorker.addEventListener("message", (Event) => {
		Log("[Client] Received message from SW:", Event.data);

		if (Event.data && Event.data.Version === "New") {
			WarnLog(
				"A new version of the application is available! Reloading page...",
			);

			if (confirm("A new version is available. Reload now?")) {
				window.location.reload();
			}

			window.location.reload();
		}
	});

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", Control);
	} else {
		Control();
	}
} else {
	WarnLog("Service Worker not supported.");
}

export default {};
