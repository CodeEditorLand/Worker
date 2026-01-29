import type { TrustedTypePolicy, TrustedTypePolicyFactory } from "trusted-types";
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
declare const _default: {};
export default _default;
//# sourceMappingURL=Policy.d.ts.map