import type { WorkerApplication } from "@Source/Worker/Policy.js";
import type { TrustedTypePolicyFactory } from "trusted-types";

declare global {
	interface Window {
		_WORKER: string;

		trustedTypes?: TrustedTypePolicyFactory;

		_POLICY_WORKER?: {
			WorkerApplication?: WorkerApplication;
		};
	}
}

declare const __DEV__: boolean;

declare const __INCREMENT__: string;

const INCREMENT = __INCREMENT__ ?? "Initial";

const Path = typeof window._WORKER === "string" ? window._WORKER : "/Worker.js";

const Scope = "/Application";

const Reload = "WorkerReload";

const Log = __DEV__
	? (..._Message: any[]) => {
			console.log(`[Register ${INCREMENT}]`, ..._Message);
		}
	: () => {};

const ErrorLog = __DEV__
	? (..._Message: any[]) => {
			console.error(`[Register ${INCREMENT}]`, ..._Message);
		}
	: () => {};

const WarnLog = __DEV__
	? (..._Message: any[]) => {
			console.warn(`[Register ${INCREMENT}]`, ..._Message);
		}
	: () => {};

if ("serviceWorker" in navigator) {
	navigator.serviceWorker.addEventListener("controllerchange", () => {
		__DEV__ && Log("Controller changed event fired!");

		if (sessionStorage.getItem(Reload) === "true") {
			__DEV__ && Log("Reload flag is set, reloading page now...");

			sessionStorage.removeItem(Reload);

			window.location.reload();
		} else {
			__DEV__ && Log("Controller changed, but no reload needed.");
		}
	});

	navigator.serviceWorker.addEventListener("message", (Event) => {
		__DEV__ && Log("[Client] Received message from SW:", Event.data);

		if (Event.data?.Version === "New") {
			__DEV__ && WarnLog("New version available! Reloading page...");

			window.location.reload();
		}
	});

	const Control = async () => {
		const InitiallyControlled = !!navigator.serviceWorker.controller;

		__DEV__ &&
			Log(`Page controlled on script start: ${InitiallyControlled}`);

		try {
			__DEV__ &&
				Log(
					`Attempting to register Service Worker: ${Path} with scope: ${Scope}`,
				);

			let URL: string | TrustedScriptURL;

			if (window.trustedTypes) {
				__DEV__ &&
					Log("TrustedTypes available. Attempting to use policy...");

				try {
					const Policy = window._POLICY_WORKER?.WorkerApplication;

					__DEV__ && Log("Retrieved Policy:", Policy);

					if (!Policy) {
						ErrorLog(
							"Policy 'WorkerApplication' object NOT found in global namespace!",
						);

						throw new Error(
							"Required Trusted Types policy 'WorkerApplication' not found. Ensure Policy.js executes first and succeeds.",
						);
					}

					URL = Policy.createScriptURL(Path);

					__DEV__ &&
						Log(
							`Used existing policy 'WorkerApplication' to create TrustedScriptURL for: ${Path}`,
						);
				} catch (_Error) {
					__DEV__ &&
						ErrorLog(
							"Error using pre-existing 'WorkerApplication' policy or creating TrustedScriptURL:",
							_Error,
						);

					throw _Error;
				}
			} else {
				__DEV__ &&
					WarnLog(
						"Trusted Types not available/enforced. Using plain string for SW path (potentially unsafe).",
					);

				URL = Path;
			}

			const Registration = await navigator.serviceWorker.register(
				URL as unknown as URL,
				{
					scope: Scope,
					type: "module",
				},
			);

			__DEV__ &&
				Log("Service Worker registration call finished successfully.");

			__DEV__ && Log("Registered Scope:", Registration.scope);

			if (Registration.installing)
				__DEV__ && Log("Service Worker installing.");
			else if (Registration.waiting)
				__DEV__ && Log("Service Worker waiting.");
			else if (Registration.active)
				__DEV__ && Log("Service Worker active.");
			else
				__DEV__ &&
					Log("Service Worker state unknown after registration.");

			__DEV__ && Log("Waiting for navigator.serviceWorker.ready...");

			await navigator.serviceWorker.ready;

			__DEV__ && Log("navigator.serviceWorker.ready resolved.");

			const Controlled = !!navigator.serviceWorker.controller;

			__DEV__ &&
				Log(
					`Page controlled after registration + ready: ${Controlled}`,
				);

			if (!InitiallyControlled && !Controlled) {
				if (!sessionStorage.getItem(Reload)) {
					__DEV__ &&
						Log("Page needs control. Setting flag and RELOADING.");

					sessionStorage.setItem(Reload, "true");

					window.location.reload();

					return;
				} else {
					__DEV__ &&
						WarnLog(
							"Reload flag set, but still not controlled. Removing flag.",
						);

					sessionStorage.removeItem(Reload);
				}
			} else {
				if (sessionStorage.getItem(Reload)) {
					__DEV__ && Log(`Page controlled. Clearing reload flag.`);

					sessionStorage.removeItem(Reload);
				}

				if (Controlled)
					__DEV__ && Log("Service Worker actively controlling.");
				else if (InitiallyControlled)
					__DEV__ && Log("Service Worker was already controlling.");
			}
		} catch (_Error) {
			__DEV__ &&
				ErrorLog(
					"Service Worker registration or ready failed:",
					_Error,
				);

			if (
				_Error instanceof TypeError &&
				(_Error.message.includes("TrustedScriptURL") ||
					_Error.message.includes("Trusted Type"))
			) {
				__DEV__ &&
					ErrorLog(
						"This failure might be due to a Trusted Types policy violation. Check policy definitions and CSP.",
					);
			}

			sessionStorage.removeItem(Reload);
		}
	};

	if (document.readyState === "loading") {
		__DEV__ && Log("DOM not ready, deferring SW registration.");

		document.addEventListener("DOMContentLoaded", Control);
	} else {
		__DEV__ && Log("DOM ready, running SW registration now.");

		Control();
	}
} else {
	__DEV__ && WarnLog("Service Worker API not supported.");
}

export default {};
