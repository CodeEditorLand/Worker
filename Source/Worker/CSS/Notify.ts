declare var self: ServiceWorkerGlobalScope;

const Log = (..._Message: any[]) => {
	console.log(`[Worker Notify]`, ..._Message);
};

const ErrorLog = (..._Message: any[]) => {
	console.error(`[Worker Notify]`, ..._Message);
};

const WarnLog = (..._Message: any[]) => {
	console.warn(`[Worker Notify]`, ..._Message);
};

export default async (
	Client: string | null | undefined,
	URL: string,
): Promise<void> => {
	if (!Client) {
		WarnLog(
			`No Client available for CSS request ${URL}. Cannot send postMessage.`,
		);

		return;
	}

	try {
		const Identifier = await self.clients.get(Client);

		if (Identifier) {
			Log(`Sending Load instruction to Client ${Identifier} for ${URL}`);

			Identifier.postMessage({
				_LOAD_CSS_WORKER: URL,
			});
		} else {
			WarnLog(
				`Client ${Identifier} not found for postMessage regarding ${URL}.`,
			);
		}
	} catch (error) {
		ErrorLog(
			`Error sending postMessage to Client ${Client} for ${URL}:`,
			error,
		);
	}
};
