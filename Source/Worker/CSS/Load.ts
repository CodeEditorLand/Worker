declare global {
	interface Window {
		_LOAD_CSS_WORKER: (CSS: string) => void;
	}
}

declare const __DEV__: boolean;

const Log = __DEV__
	? (..._Message: any[]) => {
			console.log(`[Load CSS]`, ..._Message);
		}
	: () => {};

const ErrorLog = __DEV__
	? (..._Message: any[]) => {
			console.error(`[Load CSS]`, ..._Message);
		}
	: () => {};

window._LOAD_CSS_WORKER = (_CSS: string): void => {
	__DEV__ ? Log(`Received request to load: ${_CSS}`) : {};

	const CSS = _CSS + (_CSS.includes("?") ? "&" : "?") + "Skip=Intercept";

	try {
		if (document.querySelector(`link[href="${CSS}"]`)) {
			__DEV__ ? Log(`Stylesheet already loaded: ${CSS}`) : {};

			return;
		}

		const Link = document.createElement("link");

		Link.rel = "stylesheet";

		Link.type = "text/css";

		Link.href = CSS;

		Link.onerror = (Event) => {
			__DEV__ ? ErrorLog(`Failed to load stylesheet: ${CSS}`, Event) : {};

			Link.remove();
		};

		Link.onload = () => {
			__DEV__ ? Log(`Successfully loaded stylesheet: ${CSS}`) : {};
		};

		document.head.appendChild(Link);
	} catch (_Error) {
		__DEV__ ? ErrorLog(`Error loading ${CSS}:`, _Error) : {};
	}
};

__DEV__ ? Log("Initialized and _LOAD_CSS_WORKER attached to window.") : {};

// TODO: SPLIT THIS SPECIFICALLY FOR WEB SERVICE WORKER
if ("serviceWorker" in navigator) {
	navigator.serviceWorker.addEventListener("message", (Event) => {
		if (Event.data && Event.data._LOAD_CSS_WORKER) {
			const URL = Event.data._LOAD_CSS_WORKER;

			__DEV__
				? Log(`[Client] Received instruction from [SW] to load: ${URL}`)
				: {};

			if (typeof window._LOAD_CSS_WORKER === "function") {
				window._LOAD_CSS_WORKER(URL);
			} else {
				__DEV__
					? ErrorLog(
							"[Client] _LOAD_CSS_WORKER function not found when receiving [SW] message.",
						)
					: {};
			}
		}
	});
}

export default {};
