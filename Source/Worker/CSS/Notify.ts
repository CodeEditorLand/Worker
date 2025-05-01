declare var self: ServiceWorkerGlobalScope;

declare const __DEV__: boolean;

const Log = __DEV__
	? (..._Message: any[]) => {
			console.log(`[Notify CSS]`, ..._Message);
		}
	: () => {};

const ErrorLog = __DEV__
	? (..._Message: any[]) => {
			console.error(`[Notify CSS]`, ..._Message);
		}
	: () => {};

const WarnLog = __DEV__
	? (..._Message: any[]) => {
			console.warn(`[Notify CSS]`, ..._Message);
		}
	: () => {};

export default async (
	Client: string | null | undefined,
	URL: string,
): Promise<void> => {
	if (!Client) {
		__DEV__
			? WarnLog(
					`No Client available for CSS request ${URL}. Cannot send postMessage.`,
				)
			: {};

		return;
	}

	try {
		const Identifier = await self.clients.get(Client);

		if (Identifier) {
			__DEV__
				? Log(
						`Sending Load instruction to Client ${Identifier} for ${URL}`,
					)
				: {};

			Identifier.postMessage({
				_LOAD_CSS_WORKER: URL,
			});
		} else {
			__DEV__
				? WarnLog(
						`Client ${Identifier} not found for postMessage regarding ${URL}.`,
					)
				: {};
		}
	} catch (error) {
		__DEV__
			? ErrorLog(
					`Error sending postMessage to Client ${Client} for ${URL}:`,
					error,
				)
			: {};
	}
};
