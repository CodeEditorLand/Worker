declare global {
	interface Window {
		_LOAD_CSS_WORKER: (CSS: string) => void;
	}
}

const Log = (..._Message: any[]) => {
	console.log(`[Load CSS]`, ..._Message);
};

const ErrorLog = (..._Message: any[]) => {
	console.error(`[Load CSS]`, ..._Message);
};

window._LOAD_CSS_WORKER = (_CSS: string): void => {
	Log(`Received request to load: ${_CSS}`);

	const CSS = _CSS + (_CSS.includes("?") ? "&" : "?") + "Skip=Intercept";

	try {
		if (document.querySelector(`link[href="${CSS}"]`)) {
			Log(`Stylesheet already loaded: ${CSS}`);

			return;
		}

		const Link = document.createElement("link");

		Link.rel = "stylesheet";

		Link.type = "text/css";

		Link.href = CSS;

		Link.onerror = (Event) => {
			ErrorLog(`Failed to load stylesheet: ${CSS}`, Event);

			Link.remove();
		};

		Link.onload = () => {
			Log(`Successfully loaded stylesheet: ${CSS}`);
		};

		document.head.appendChild(Link);
	} catch (_Error) {
		ErrorLog(`Error loading ${CSS}:`, _Error);
	}
};

Log("Initialized and _LOAD_CSS_WORKER attached to window.");

// TODO: SPLIT THIS SPECIFICALLY FOR WEB SERVICE WORKER
if ("serviceWorker" in navigator) {
	navigator.serviceWorker.addEventListener("message", (Event) => {
		if (Event.data && Event.data._LOAD_CSS_WORKER) {
			const URL = Event.data._LOAD_CSS_WORKER;

			Log(`[Client] Received instruction from [SW] to load: ${URL}`);

			if (typeof window._LOAD_CSS_WORKER === "function") {
				window._LOAD_CSS_WORKER(URL);
			} else {
				ErrorLog(
					"[Client] _LOAD_CSS_WORKER function not found when receiving [SW] message.",
				);
			}
		}
	});
}

export default {};
