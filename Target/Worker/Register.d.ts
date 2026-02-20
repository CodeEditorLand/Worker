import type { TrustedTypePolicyFactory } from "trusted-types";
import type { WorkerApplication } from "../Worker/Policy.js";
declare global {
    interface Window {
        _WORKER: string;
        trustedTypes?: TrustedTypePolicyFactory;
        _POLICY_WORKER?: {
            WorkerApplication?: WorkerApplication;
        };
    }
}
declare const _default: {};
export default _default;
//# sourceMappingURL=Register.d.ts.map