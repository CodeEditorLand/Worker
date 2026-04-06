const c = typeof window._WORKER == "string" ? window._WORKER : "/Worker.js",
	g = "/Application",
	r = "WorkerReload";
const d = () => {};
if ("serviceWorker" in navigator) {
	const n = "WorkerRegistered",
		l = async (o) => {
			const e = await o.update();
		},
		a = async () => {
			const o = !!navigator.serviceWorker.controller;
			try {
				let e;
				if (window.trustedTypes)
					try {
						const t = window._POLICY_WORKER?.WorkerApplication;
						if (!t)
							throw (
								d(
									"Policy 'WorkerApplication' object NOT found in global namespace!",
								),
								new Error(
									"Required Trusted Types policy 'WorkerApplication' not found. Ensure Policy.js executes first and succeeds.",
								)
							);
						e = t.createScriptURL(c);
					} catch (t) {
						throw t;
					}
				else e = c;
				const i = await navigator.serviceWorker.register(e, {
					scope: g,
					type: "module",
				});
				(i.installing || i.waiting || i.active,
					await navigator.serviceWorker.ready);
				const s = !!navigator.serviceWorker.controller;
				sessionStorage.setItem(n, "true");
				const _ = await navigator.serviceWorker.getRegistration(g);
				if ((_ && l(_), !o && !s)) {
					(sessionStorage.setItem(r, "true"),
						window.location.reload());
					return;
				}
				sessionStorage.getItem(r) && sessionStorage.removeItem(r);
			} catch (e) {
				(e instanceof TypeError &&
					(e.message.includes("TrustedScriptURL") ||
						e.message.includes("Trusted Type")),
					sessionStorage.getItem(r) && sessionStorage.removeItem(r));
			}
			document.readyState === "loading"
				? document.addEventListener("DOMContentLoaded", a)
				: a();
		};
}
"serviceWorker" in navigator;
var p = {};
export { p as default };
