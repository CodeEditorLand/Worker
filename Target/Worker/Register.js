var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const INCREMENT = "DEVELOPMENT-01KJJN7K3V6Z4XH5D124QD5Y2W";
const Path = typeof window._WORKER === "string" ? window._WORKER : "/Worker.js";
const Scope = "/Application";
const Reload = "WorkerReload";
const Log = true ? (..._Message) => {
  console.log(`[Register ${INCREMENT}]`, ..._Message);
} : () => {
};
const ErrorLog = true ? (..._Message) => {
  console.error(`[Register ${INCREMENT}]`, ..._Message);
} : () => {
};
const WarnLog = true ? (..._Message) => {
  console.warn(`[Register ${INCREMENT}]`, ..._Message);
} : () => {
};
if ("serviceWorker" in navigator) {
  const RegisteredKey = "WorkerRegistered";
  const CheckForUpdate = /* @__PURE__ */ __name(async (Registration) => {
    const Update = await Registration.update();
    Log(
      "Service Worker update check:",
      Update ? "Update found" : "Up to date"
    );
    if (Update) {
      Log(
        "New service worker version detected, will refresh on next activation"
      );
    }
  }, "CheckForUpdate");
  const Control = /* @__PURE__ */ __name(async () => {
    const InitiallyControlled = !!navigator.serviceWorker.controller;
    Log(`Page controlled on script start: ${InitiallyControlled}`);
    try {
      Log(
        `Attempting to register Service Worker: ${Path} with scope: ${Scope}`
      );
      let URL;
      if (window.trustedTypes) {
        Log("TrustedTypes available. Attempting to use policy...");
        try {
          const Policy = window._POLICY_WORKER?.WorkerApplication;
          Log("Retrieved Policy:", Policy);
          if (!Policy) {
            ErrorLog(
              "Policy 'WorkerApplication' object NOT found in global namespace!"
            );
            throw new Error(
              "Required Trusted Types policy 'WorkerApplication' not found. Ensure Policy.js executes first and succeeds."
            );
          }
          URL = Policy.createScriptURL(Path);
          Log(
            `Used existing policy 'WorkerApplication' to create TrustedScriptURL for: ${Path}`
          );
        } catch (_Error) {
          ErrorLog(
            "Error using pre-existing 'WorkerApplication' policy or creating TrustedScriptURL:",
            _Error
          );
          throw _Error;
        }
      } else {
        WarnLog(
          "Trusted Types not available/enforced. Using plain string for SW path (potentially unsafe)."
        );
        URL = Path;
      }
      const Registration = await navigator.serviceWorker.register(
        URL,
        {
          scope: Scope,
          type: "module"
        }
      );
      Log("Service Worker registration call finished successfully.");
      Log("Registered Scope:", Registration.scope);
      if (Registration.installing)
        Log("Service Worker installing.");
      else if (Registration.waiting)
        Log("Service Worker waiting.");
      else if (Registration.active)
        Log("Service Worker active.");
      else
        Log("Service Worker state unknown after registration.");
      Log("Waiting for navigator.serviceWorker.ready...");
      await navigator.serviceWorker.ready;
      Log("navigator.serviceWorker.ready resolved.");
      const Controlled = !!navigator.serviceWorker.controller;
      Log(
        `Page controlled after registration + ready: ${Controlled}`
      );
      sessionStorage.setItem(RegisteredKey, "true");
      const UpdateRegistration = await navigator.serviceWorker.getRegistration(Scope);
      if (UpdateRegistration) {
        CheckForUpdate(UpdateRegistration);
      }
      if (!InitiallyControlled && !Controlled) {
        Log("Page needs control. Setting flag and RELOADING.");
        sessionStorage.setItem(Reload, "true");
        window.location.reload();
        return;
      }
      if (sessionStorage.getItem(Reload)) {
        Log(`Page controlled. Clearing reload flag.`);
        sessionStorage.removeItem(Reload);
      }
      if (Controlled) {
        Log("Service Worker actively controlling.");
      } else if (InitiallyControlled) {
        Log("Service Worker was already controlling.");
      }
    } catch (_Error) {
      ErrorLog(
        "Service Worker registration or ready failed:",
        _Error
      );
      if (_Error instanceof TypeError && (_Error.message.includes("TrustedScriptURL") || _Error.message.includes("Trusted Type"))) {
        ErrorLog(
          "This failure might be due to a Trusted Types policy violation. Check policy definitions and CSP."
        );
      }
      if (sessionStorage.getItem(Reload)) {
        sessionStorage.removeItem(Reload);
      }
    }
    if (document.readyState === "loading") {
      Log("DOM not ready, deferring SW registration.");
      document.addEventListener("DOMContentLoaded", Control);
    } else {
      Log("DOM ready, running SW registration now.");
      Control();
    }
  }, "Control");
}
if (!("serviceWorker" in navigator)) {
  WarnLog("Service Worker API not supported.");
}
var Register_default = {};
export {
  Register_default as default
};
//# sourceMappingURL=Register.js.map
