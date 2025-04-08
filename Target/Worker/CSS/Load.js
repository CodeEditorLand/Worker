var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const Log = /* @__PURE__ */ __name((...[Message]) => console.log(`[CSS Loader] ${Message}`), "Log");
const ErrorLog = /* @__PURE__ */ __name((...[Message]) => console.error(`[CSS Loader] ${Message}`), "ErrorLog");
window._LOAD_CSS_WORKER = (_CSS) => {
  Log(`Received request to load: ${_CSS}`);
  const CSS = _CSS + (_CSS.includes("?") ? "&" : "?") + "Skip=Worker";
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
navigator.serviceWorker.addEventListener("message", (Event) => {
  if (Event.data && Event.data._LOAD_CSS_WORKER) {
    const URL = Event.data._LOAD_CSS_WORKER;
    console.log(`[Client] Received instruction from SW to load: ${URL}`);
    if (typeof window._LOAD_CSS_WORKER === "function") {
      window._LOAD_CSS_WORKER(URL);
    } else {
      ErrorLog(
        "[Client] _LOAD_CSS_WORKER function not found when receiving SW message."
      );
    }
  }
});
var Load_default = {};
export {
  Load_default as default
};
//# sourceMappingURL=Load.js.map
