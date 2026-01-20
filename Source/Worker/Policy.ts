import type {
	TrustedTypePolicy,
	TrustedTypePolicyFactory,
} from "trusted-types";

export interface WorkerApplication extends Pick<TrustedTypePolicy, "name"> {
	createScriptURL(input: string, ...args: any[]): TrustedScriptURL;
}

declare global {
	interface Window {
		trustedTypes?: TrustedTypePolicyFactory;

		_POLICY_WORKER?: {
			WorkerApplication?: WorkerApplication;
		};
	}
}

declare const __DEV__: boolean;

declare const __INCREMENT__: string;

const INCREMENT = __INCREMENT__ ?? "Initial";

const Log = __DEV__
	? (..._Message: any[]) => {
			console.log(`[Policy ${INCREMENT}]`, ..._Message);
		}
	: () => {};

const ErrorLog = __DEV__
	? (..._Message: any[]) => {
			console.error(`[Policy ${INCREMENT}]`, ..._Message);
		}
	: () => {};

const WarnLog = __DEV__
	? (..._Message: any[]) => {
			console.warn(`[Policy ${INCREMENT}]`, ..._Message);
		}
	: () => {};

(() => {
	window._POLICY_WORKER = window._POLICY_WORKER || {};

	if (!window.trustedTypes || !window.trustedTypes.createPolicy) {
		__DEV__ &&
			WarnLog(
				"Trusted Types API not supported or policy creation unavailable.",
			);

		return;
	}

	if (!window._POLICY_WORKER.WorkerApplication) {
		try {
			window._POLICY_WORKER.WorkerApplication =
				window.trustedTypes.createPolicy(
					"WorkerApplication",

					{
						createScriptURL: (Input) => {
							if (
								Input &&
								/^\/[^\\:]+\.(js|mjs)(\?.*)?$/.test(Input)
							) {
								__DEV__ &&
									Log(
										`Policy 'WorkerApplication' validating URL: ${Input}`,
									);

								return Input;
							}

							__DEV__ &&
								ErrorLog(
									`Policy 'WorkerApplication' rejected URL: ${Input}`,
								);

							throw new TypeError(
								`Invalid URL format for service worker script: ${Input}`,
							);
						},
					},
				);

			__DEV__ &&
				Log(
					"Policy 'WorkerApplication' created and stored successfully.",
				);
		} catch (_Error) {
			if (
				_Error instanceof TypeError &&
				_Error.message.includes("already exists")
			) {
				__DEV__ &&
					WarnLog(
						"Policy 'WorkerApplication' already existed. Ensure Policy.js runs only once and before other scripts using it.",
					);
			} else {
				__DEV__ &&
					ErrorLog(
						"Failed to create policy 'WorkerApplication':",

						_Error,
					);
			}
		}
	} else {
		__DEV__ && Log("Policy 'WorkerApplication' was already initialized.");
	}
})();

export default {};
