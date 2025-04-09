var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const Log = /* @__PURE__ */ __name((...[_Message]) => {
}, "Log");
const ErrorLog = /* @__PURE__ */ __name((...[_Message]) => {
}, "ErrorLog");
const WarnLog = /* @__PURE__ */ __name((...[_Message]) => {
}, "WarnLog");
var Notify_default = /* @__PURE__ */ __name(async (Client, URL) => {
  if (!Client) {
    WarnLog(
      `No Client available for CSS request ${URL}. Cannot send postMessage.`
    );
    return;
  }
  try {
    const Identifier = await self.clients.get(Client);
    if (Identifier) {
      Log(`Sending Load instruction to Client ${Identifier} for ${URL}`);
      Identifier.postMessage({
        _LOAD_CSS_WORKER: URL
      });
    } else {
      WarnLog(
        `Client ${Identifier} not found for postMessage regarding ${URL}.`
      );
    }
  } catch (error) {
    ErrorLog(
      `Error sending postMessage to Client ${Client} for ${URL}:`,
      error
    );
  }
}, "default");
export {
  Notify_default as default
};
//# sourceMappingURL=Notify.js.map
