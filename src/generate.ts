import path from "path";
import { copyFiles, CopyFilesFilter } from "./copy-files";
import fs from "fs/promises";
import { format, Options as PrettierOptions } from "prettier";
import ReactConfigGenerator from "./config-generators/react";
import VueConfigGenerator from "./config-generators/vue";

export interface GenerationOptions {
	outputDir: string;
	language: "ts" | "js";
	framework: "react" | "vue";
}

const FILES_DIR = path.resolve(__dirname, "../files");

export async function generate({
	framework: frontendFramework,
	language,
	outputDir,
}: GenerationOptions): Promise<void> {
	// TODO: Resolve the actual config
	const prettierConfig: PrettierOptions = {};

	const filter: CopyFilesFilter = async ({ path }) => {
		if (path === "_gitignore") {
			return { operation: "rename", newPath: ".gitignore" };
		}

		return { operation: "copy" };
	};

	await copyFiles(path.join(FILES_DIR, "shared", "common"), outputDir, filter);
	await copyFiles(path.join(FILES_DIR, language, "common"), outputDir, filter);
	await copyFiles(
		path.join(FILES_DIR, "shared", frontendFramework),
		outputDir,
		filter,
	);
	await copyFiles(
		path.join(FILES_DIR, language, frontendFramework),
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
