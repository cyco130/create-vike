import path from "path";
import { copyFiles, CopyFilesFilter } from "./copy-files";
import { transform, removeMagicComments } from "detype";
import fs from "fs/promises";
import { format, Options as PrettierOptions } from "prettier";
import ReactConfigGenerator from "./config-generators/react";
import VueConfigGenerator from "./config-generators/vue";

export interface GenerationOptions {
	outputDir: string;
	language: "ts" | "js";
	framework: "react" | "vue";
}

const INPUT_FILES_DIR = path.resolve(__dirname, "../input-files");

export async function generate({
	framework: frontendFramework,
	language,
	outputDir,
}: GenerationOptions): Promise<void> {
	// TODO: Resolve the actual config
	const prettierConfig: PrettierOptions = {};

	const filter: CopyFilesFilter = async ({ path, readContent, srcPath }) => {
		if (path === "_gitignore") {
			return { operation: "rename", newPath: ".gitignore" };
		}

		if (
			language !== "ts" &&
			(["tsconfig.json", "renderer/types.ts"].includes(path) ||
				path.endsWith(".d.ts"))
		)
			return { operation: "skip" };

		if (path === "vue.d.ts") {
			return frontendFramework === "vue"
				? { operation: "copy" }
				: { operation: "skip" };
		}

		if (
			!path.endsWith(".ts") &&
			!path.endsWith(".tsx") &&
			!path.endsWith(".vue")
		) {
			return { operation: "copy" };
		}

		if (language === "ts") {
			return {
				operation: "transform",
				newContent: format(removeMagicComments(await readContent()), {
					...prettierConfig,
					filepath: srcPath,
				}),
			};
		}

		const newPath = path.endsWith(".ts")
			? path.slice(0, -2) + "js"
			: path.endsWith(".tsx")
			? path.slice(0, -3) + "jsx"
			: path;

		return {
			operation: "transform",
			newPath,
			newContent: await transform(await readContent(), srcPath, prettierConfig),
		};
	};

	await copyFiles(path.join(INPUT_FILES_DIR, "common"), outputDir, filter);

	await copyFiles(
		path.join(INPUT_FILES_DIR, frontendFramework),
		outputDir,
		filter,
	);

	const generators = {
		react: ReactConfigGenerator,
		vue: VueConfigGenerator,
	};

	const generator = new generators[frontendFramework](language);

	const packageJsonfileName = path.join(outputDir, "package.json");
	await fs.writeFile(
		packageJsonfileName,
		format(generator.generatePackageJson(), {
			...prettierConfig,
			filepath: packageJsonfileName,
		}),
	);

	if (language === "ts") {
		const fn = path.join(outputDir, "tsconfig.json");
		await fs.writeFile(
			fn,
			format(generator.generateTsConfig(), { ...prettierConfig, filepath: fn }),
		);
	}

	const viteConfigFileName = path.join(outputDir, "vite.config." + language);
	await fs.writeFile(
		viteConfigFileName,
		format(generator.generateViteConfig(), {
			...prettierConfig,
			filepath: viteConfigFileName,
		}),
	);
}
