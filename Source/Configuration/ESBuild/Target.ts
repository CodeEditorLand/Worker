import type { BuildOptions } from "esbuild";

export const On = (await import("./Worker.js")).On;

/**
 * @module ESBuild
 *
 */
export default async (Current: BuildOptions): Promise<BuildOptions> =>
	(await import("deepmerge-ts")).deepmerge<[BuildOptions, BuildOptions]>(
		(await import("./Worker.js")).default,

		{
			outdir: "Target",

			drop: On ? [] : ["debugger", "console"],

			define: {
				__DEV__: On ? "true" : "false",

				__INCREMENT__: `"${`${On ? "DEVELOPMENT" : "PRODUCTION"}-${(await import("ulid")).ulid()}`}"`,
			},

			treeShaking: !On,

			entryPoints: (
				await import("@playform/build/Target/Function/Entry.js")
			).default(Current, ["Source/Configuration/*"]),

			platform: "browser",

			outbase: "Source",
		},
	);
