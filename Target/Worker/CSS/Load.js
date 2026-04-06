window._LOAD_CSS_WORKER = (_) => {
	const o = _ + (_.includes("?") ? "&" : "?") + "Skip=Intercept";
	try {
		if (document.querySelector(`link[href="${o}"]`)) return;
		const e = document.createElement("link");
		((e.rel = "stylesheet"),
			(e.type = "text/css"),
			(e.href = o),
			(e.onerror = (r) => {
				e.remove();
			}),
			(e.onload = () => {}),
			document.head.appendChild(e));
	} catch {}
};
var t = {};
export { t as default };
