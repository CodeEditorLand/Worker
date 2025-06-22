const INCREMENT = "DEVELOPMENT-01JYATCE1GCVCS7JF7THPGYYHN";
const Log = true ? (..._Message) => {
  console.log(`[Load CSS ${INCREMENT}]`, ..._Message);
} : () => {
};
const ErrorLog = true ? (..._Message) => {
  console.error(`[Load CSS ${INCREMENT}]`, ..._Message);
} : () => {
};
window._LOAD_CSS_WORKER = (_CSS) => {
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
var Load_default = {};
export {
  Load_default as default
};
//# sourceMappingURL=Load.js.map
