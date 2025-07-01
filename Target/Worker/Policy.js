(() => {
	if (
		((window._POLICY_WORKER = window._POLICY_WORKER || {}),
		!(!window.trustedTypes || !window.trustedTypes.createPolicy) &&
			!window._POLICY_WORKER.WorkerApplication)
	)
		try {
			window._POLICY_WORKER.WorkerApplication =
				window.trustedTypes.createPolicy("WorkerApplication", {
					createScriptURL: (e) => {
						if (e && /^\/[^/\\:]+\.js(\?.*)?$/.test(e)) return e;
						throw new TypeError(
							`Invalid URL format for service worker script: ${e}`,
						);
					},
				});
		} catch (e) {
			e instanceof TypeError && e.message.includes("already exists");
		}
})();
var r = {};
export { r as default };
