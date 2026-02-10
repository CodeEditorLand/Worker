var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const INCREMENT = "DEVELOPMENT-01KH3HEM0HKP1EMMZNMVF3NFNH";
const Log = true ? (..._Message) => {
  console.log(`[Policy ${INCREMENT}]`, ..._Message);
} : () => {
};
const ErrorLog = true ? (..._Message) => {
  console.error(`[Policy ${INCREMENT}]`, ..._Message);
} : () => {
};
const WarnLog = true ? (..._Message) => {
  console.warn(`[Policy ${INCREMENT}]`, ..._Message);
} : () => {
};
(() => {
  window._POLICY_WORKER = window._POLICY_WORKER || {};
  if (!window.trustedTypes || !window.trustedTypes.createPolicy) {
    WarnLog(
      "Trusted Types API not supported or policy creation unavailable."
    );
    return;
  }
  if (!window._POLICY_WORKER.WorkerApplication) {
    try {
      window._POLICY_WORKER.WorkerApplication = window.trustedTypes.createPolicy(
        "WorkerApplication",
        {
          createScriptURL: /* @__PURE__ */ __name((Input) => {
            if (Input && /^\/[^\\:]+\.(js|mjs)(\?.*)?$/.test(Input)) {
              Log(
                `Policy 'WorkerApplication' validating URL: ${Input}`
              );
              return Input;
            }
            ErrorLog(
              `Policy 'WorkerApplication' rejected URL: ${Input}`
            );
            throw new TypeError(
              `Invalid URL format for service worker script: ${Input}`
            );
          }, "createScriptURL")
        }
      );
      Log(
        "Policy 'WorkerApplication' created and stored successfully."
      );
    } catch (_Error) {
      if (_Error instanceof TypeError && _Error.message.includes("already exists")) {
        WarnLog(
          "Policy 'WorkerApplication' already existed. Ensure Policy.js runs only once and before other scripts using it."
        );
      } else {
        ErrorLog(
          "Failed to create policy 'WorkerApplication':",
          _Error
        );
      }
    }
  } else {
    Log("Policy 'WorkerApplication' was already initialized.");
  }
})();
var Policy_default = {};
export {
  Policy_default as default
};
//# sourceMappingURL=Policy.js.map
