import packageVersions from "./package-versions.json";

export abstract class ConfigGenerator {
	public readonly language: "ts" | "js";

	public constructor(language: "ts" | "js") {
		this.language = language;
	}

	public generateTsConfig(): string {
		const config = deepClone(TS_CONFIG);
		this.modifyTsConfig(config);
		return JSON.stringify(config, undefined, 2);
	}

	public generatePackageJson(): string {
		const pkg = deepClone(PACKAGE_JSON);

		if (this.language === "ts") {
			pkg.scripts = { ...pkg.scripts, ...TS_PACKAGE_JSON_OVERRIDES.scripts };
			pkg.dependencies = [
				...pkg.dependencies,
				...TS_PACKAGE_JSON_OVERRIDES.dependencies,
			];
		}

		this.modifyPackageJson(pkg);

		pkg.dependencies = pkg.dependencies.sort();
		const output = {
			...pkg,
			dependencies: Object.fromEntries(
				pkg.dependencies.map((dep) => {
					if (!(dep in packageVersions)) {
						throw new Error("Unknown package " + dep);
					}

					return [dep, packageVersions[dep as keyof typeof packageVersions]];
				}),
			),
		};

		return JSON.stringify(output, undefined, 2);
	}

	public generateViteConfig(): string {
		const config = this.getViteConfig();
		let out = `import ${config.frameworkImportName} from ${JSON.stringify(
			config.frameworkImportPackage,
		)};\n`;

		out += `import ssr from "vite-plugin-ssr/plugin";\n`;

		if (this.language === "ts") {
			out += `import { UserConfig } from "vite";\n`;
		}

		out += "\n";

		if (this.language === "ts") {
			out += `const config: UserConfig = `;
		} else {
			out += `export default `;
		}

		out += `{\n  plugins: [${config.frameworkImportName}(), ssr()],\n};\n`;

		if (this.language === "ts") {
			out += `\nexport default config;\n`;
		}

		return out;
	}

	protected abstract modifyTsConfig(config: TsConfig): void;
	protected abstract modifyPackageJson(pkg: PackageJson): void;
	protected abstract getViteConfig(): ViteConfig;
}

export type TsConfig = typeof TS_CONFIG;

export interface PackageJson {
	scripts: Record<string, string>;
	dependencies: string[];
}

export interface ViteConfig {
	frameworkImportName: string;
	frameworkImportPackage: string;
}

function deepClone<T>(original: T): T {
	// Super cheap :D
	return JSON.parse(JSON.stringify(original));
}

const TS_CONFIG = {
	compilerOptions: {
		strict: true,
		module: "ES2020",
		moduleResolution: "Node",
		target: "ES2017",
		lib: ["DOM", "DOM.Iterable", "ESNext"],
		types: ["vite/client"],
		jsx: "react" as "react" | undefined,
		skipLibCheck: true,
		esModuleInterop: true,
	},
	"ts-node": { transpileOnly: true, compilerOptions: { module: "CommonJS" } },
};

const PACKAGE_JSON: PackageJson = {
	scripts: {
		dev: "npm run server",
		prod: "npm run build && npm run server:prod",
		build: "vite build && vite build --ssr",
		server: "node ./server",
		"server:prod": "cross-env NODE_ENV=production node ./server",
	},
	dependencies: ["cross-env", "express", "vite", "vite-plugin-ssr"],
};

const TS_PACKAGE_JSON_OVERRIDES = {
	scripts: {
		server: "ts-node ./server",
		"server:prod": "cross-env NODE_ENV=production ts-node ./server",
	},
	dependencies: ["@types/express", "@types/node", "ts-node", "typescript"],
};

// generates a list of possibilities for specificityKeys
export function possibilities(options: SpecificityOptions): string[] {
	return Object.keys(options).reduce((acc, curr) => {
		const k = curr as keyof SpecificityOptions;
		const option = options[k];
		// TODO implement this
		return acc;
	}, []);
}

// least specific to most specific, manual array for now
export const specificityKeys: SpecificityKey[] = [
	"js",
	"ts",
	"react",
	"vue",
	"react-js",
	"react-ts",
	"vue-js",
	"vue-ts",
];

export function applyTransforms<T>({
	data,
	transforms,
	options,
}: {
	data: T;
	options: SpecificityOptions;
	transforms: TransformRecords<T>;
}): T {
	const { language, framework } = options;
	// least specific to most specific order because it will be overwritten by more
	// speficic transform
	return specificityKeys
		.filter((key) => {
			// language or framework specific or both
			return (
				language === key ||
				framework === key ||
				(key.includes(language) && key.includes(framework))
			);
		})
		.reduce((acc, key) => {
			if (Object.keys(transforms).includes(key)) {
				return transforms[key]!(acc);
			}
			return acc;
		}, data);

	// generate a set of keys from specificity object
}
