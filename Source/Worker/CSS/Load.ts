declare global {
	interface Window {
		_LOAD_CSS_WORKER: (CSS: string) => void;
	}
}

declare const __DEV__: boolean;

declare const __VERSION__: string;

const VERSION = __VERSION__ ?? "Initial";

const Log = __DEV__
	? (..._Message: any[]) => {
			console.log(`[Load CSS ${VERSION}]`, ..._Message);
		}
	: () => {};

const ErrorLog = __DEV__
	? (..._Message: any[]) => {
			console.error(`[Load CSS ${VERSION}]`, ..._Message);
		}
	: () => {};

window._LOAD_CSS_WORKER = (_CSS: string): void => {
	__DEV__ && Log(`Received request to load: ${_CSS}`);

	const CSS = _CSS + (_CSS.includes("?") ? "&" : "?") + "Skip=Intercept";

	try {
		if (document.querySelector(`link[href="${CSS}"]`)) {
			__DEV__ && Log(`Stylesheet already loaded: ${CSS}`);

			return;
		}

		const Link = document.createElement("link");

		Link.rel = "stylesheet";

		Link.type = "text/css";

		Link.href = CSS;

		Link.onerror = (Event) => {
			__DEV__ && ErrorLog(`Failed to load stylesheet: ${CSS}`, Event);

			Link.remove();
		};

		Link.onload = () => {
			__DEV__ && Log(`Successfully loaded stylesheet: ${CSS}`);
		};

		document.head.appendChild(Link);
	} catch (_Error) {
		__DEV__ && ErrorLog(`Error loading ${CSS}:`, _Error);
	}
};

__DEV__ && Log("Initialized and _LOAD_CSS_WORKER attached to window.");

export default {};
