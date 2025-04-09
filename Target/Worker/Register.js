var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const Path = typeof window._WORKER === "string" ? window._WORKER : "/Worker.js";
const Log = /* @__PURE__ */ __name((...[_Message]) => {
}, "Log");
const ErrorLog = /* @__PURE__ */ __name((...[_Message]) => {
}, "ErrorLog");
const WarnLog = /* @__PURE__ */ __name((...[_Message]) => {
}, "WarnLog");
if ("serviceWorker" in navigator) {
  window.addEventListener(
    "load",
    () => navigator.serviceWorker.register(Path, { scope: "/VSCode", type: "module" }).then((Registration) => {
      Log("Service Worker registered successfully.");
      Log("Scope:", Registration.scope);
      if (navigator.serviceWorker.controller) {
        Log("Service Worker is controlling this page.");
      } else {
        Log(
          "Service Worker registered, but may not control page until next load/activation."
        );
      }
    }).catch((_Error) => {
      ErrorLog("Service Worker registration failed:", _Error);
    })
  );
} else {
  WarnLog("Service Worker not supported.");
}
var Register_default = {};
export {
  ErrorLog,
  Log,
  WarnLog,
  Register_default as default
};
//# sourceMappingURL=Register.js.map
