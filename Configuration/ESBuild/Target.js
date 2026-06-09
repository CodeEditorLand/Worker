var __defProp = Object.defineProperty;

var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

const On = (await import("./Worker.js")).On;

var Target_default = /* @__PURE__ */ __name(async (Current) => (await import("deepmerge-ts")).deepmerge(
  (await import("./Worker.js")).default,

  {
    outdir: "Target",
    drop: On ? [] : ["debugger", "console"],
    define: {
      __DEV__: On ? "true" : "false",
      __INCREMENT__: `"${`${On ? "DEVELOPMENT" : "PRODUCTION"}-${(await import("ulid")).ulid()}`}"`
    },
    treeShaking: !On,
    entryPoints: (await import("@playform/build/Target/Function/Entry.js")).default(Current, ["Source/Configuration/*"]),
    platform: "browser",
    outbase: "Source",
    logOverride: { "suspicious-logical-operator": "silent" }
  }
), "default");

export {
  On,
  Target_default as default
};

//# sourceMappingURL=Target.js.map
