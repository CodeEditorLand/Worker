var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const Path = typeof window.URLWorker === "string" ? window.URLWorker : "/Worker.js";
const Scope = "/Application";
const Reload = "WorkerReload";
const Log = /* @__PURE__ */ __name((..._Message) => {
  console.log(`[Register]`, ..._Message);
}, "Log");
const ErrorLog = /* @__PURE__ */ __name((..._Message) => {
  console.error(`[Register]`, ..._Message);
}, "ErrorLog");
const WarnLog = /* @__PURE__ */ __name((..._Message) => {
  console.warn(`[Register]`, ..._Message);
}, "WarnLog");
const Check = /* @__PURE__ */ __name(async () => {
  if ("serviceWorker" in navigator) {
    try {
      Log("Checking for service worker updates...");
      const Registration = await navigator.serviceWorker.ready;
      if (Registration.active) {
        await Registration.update();
        Log("Service worker update check finished.");
      } else {
        Log("No active service worker found to update.");
      }
    } catch (_Error) {
      ErrorLog("Error checking for service worker updates:", _Error);
    }
  } else {
    WarnLog("Service Worker not supported, cannot check for updates.");
  }
}, "Check");
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    Log("Controller changed event fired!");
    if (sessionStorage.getItem(Reload) === "true") {
      Log(
        "Reload flag is set, reloading page now to ensure SW control..."
      );
      sessionStorage.removeItem(Reload);
      window.location.reload();
    } else {
      Log(
        "Controller changed, but no reload needed (flag not set or page likely already controlled)."
      );
    }
  });
  navigator.serviceWorker.addEventListener("message", (Event) => {
    Log("[Client] Received message from SW:", Event.data);
    if (Event.data && Event.data.Version === "New") {
      WarnLog(
        "A new version of the application is available! Reloading page..."
      );
      window.location.reload();
    }
  });
  const Control = /* @__PURE__ */ __name(async () => {
    const InitiallyControlled = !!navigator.serviceWorker.controller;
    Log(`Page controlled on script start: ${InitiallyControlled}`);
    try {
      Log(
        `Attempting to register Service Worker: ${Path} with scope: ${Scope}`
      );
      const registration = await navigator.serviceWorker.register(Path, {
        scope: Scope,
        type: "module"
      });
      Log("Service Worker registration call finished.");
      Log("Registered Scope:", registration.scope);
      if (registration.installing) {
        Log("Service Worker installing.");
      } else if (registration.waiting) {
        Log("Service Worker waiting to activate.");
      } else if (registration.active) {
        Log("Service Worker active upon registration check.");
      } else {
        Log("Service Worker state unknown after registration call.");
      }
      Log("Waiting for navigator.serviceWorker.ready...");
      await navigator.serviceWorker.ready;
      Log("navigator.serviceWorker.ready resolved.");
      const Controlled = !!navigator.serviceWorker.controller;
      Log(`Page controlled after registration + ready: ${Controlled}`);
      if (!InitiallyControlled && !Controlled) {
        if (!sessionStorage.getItem(Reload)) {
          Log(
            "Page needs control and is not controlled after ready. Setting flag and RELOADING."
          );
          sessionStorage.setItem(Reload, "true");
          window.location.reload();
          return;
        } else {
          WarnLog(
            "Reload flag was set, but page is still not controlled. SW activation might have failed. Removing flag to prevent loops."
          );
          sessionStorage.removeItem(Reload);
        }
      } else {
        if (sessionStorage.getItem(Reload)) {
          Log(
            `Page is now controlled or was already controlled. Clearing unnecessary reload flag.`
          );
          sessionStorage.removeItem(Reload);
        }
        if (Controlled) {
          Log("Service Worker is actively controlling this page.");
        } else if (InitiallyControlled) {
          Log(
            "Service Worker was already controlling this page initially."
          );
        }
      }
    } catch (_Error) {
      ErrorLog("Service Worker registration or ready failed:", _Error);
      sessionStorage.removeItem(Reload);
    }
  }, "Control");
  if (document.readyState === "loading") {
    Log("DOM not ready, deferring SW registration.");
    document.addEventListener("DOMContentLoaded", Control);
  } else {
    Log("DOM ready, running SW registration now.");
    Control();
  }
} else {
  WarnLog("Service Worker API not supported in this browser.");
}
var Register_default = {};
export {
  Check,
  ErrorLog,
  Log,
  WarnLog,
  Register_default as default
};
//# sourceMappingURL=Register.js.map
