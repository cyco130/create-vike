import path from "path";
import fs from "fs/promises";
import { format, Options as PrettierOptions } from "prettier";
import ReactConfigGenerator from "./config-generators/react";
import VueConfigGenerator from "./config-generators/vue";
import { detectPackageManager } from "./detect-package-manager";
import { runCommand } from "./run-command";
import { walk } from "walk";

export interface GenerationOptions {
	outputDir: string;
	typescript: boolean;
	react: boolean;
	vue: boolean;
	clientRouter: boolean;
	skipDependencies: boolean;
	npm: boolean;
	yarn: boolean;
	pnpm: boolean;
	initGitRepo: string | boolean;
	createInitialCommit: string | boolean;
}

const FILES_DIR = path.resolve(__dirname, "../files");

export async function generate({
	outputDir,
	typescript,
	react,
	vue,
	clientRouter,
	skipDependencies,
	npm,
	yarn,
	pnpm,
	initGitRepo,
	createInitialCommit,
}: GenerationOptions): Promise<void> {
	let error = false;

	if (Number(npm) + Number(pnpm) + Number(yarn) > 1) {
		process.stderr.write("Only one of npm, pnpm, or yarn can be specified\n");
		error = true;
	}

	let packageManager = npm ? "npm" : pnpm ? "pnpm" : yarn ? "yarn" : undefined;
	if (!packageManager) {
		const detected = detectPackageManager();
		packageManager = detected || "npm";
	}

	if (vue && react) {
		process.stderr.write("Cannot use both react and vue\n");
		error = true;
	} else if (!vue && !react) {
		process.stderr.write("Please specify either --react or --vue\n");
		error = true;
	}

	if (error) {
		process.exit(1);
	}

	const framework = vue ? "vue" : "react";

	const features: string[] = ["vike", framework];
	if (clientRouter) features.push("client-router");

	const language = typescript ? "ts" : "js";

	async function findDirs(dir: string) {
		return (
			(
				await fs.readdir(path.join(FILES_DIR, dir), {
					withFileTypes: true,
				})
			)
				.filter((x) => x.isDirectory())
				.map((x) => ({
					name: path.join(dir, x.name),
					features: x.name.split("+"),
				}))
				// Paths with more features are more specific
				// They should come last to override generic files
				.sort((a, b) => a.features.length - b.features.length)
		);
	}

	// Scan feature directories
	const dirs = [...(await findDirs("shared")), ...(await findDirs(language))]
		.filter((x) => x.features.every((f) => features.includes(f)))
		.map((x) => x.name);

	console.log("Copying files");

	const toBeCopied: Record<string, string> = {};

	for (const dir of dirs) {
		const files = await getFiles(dir);
		files.forEach((x) => {
			let targetName = x.slice(dir.length + 1);

			if (targetName === "_gitignore") targetName = ".gitignore";

			toBeCopied[targetName] = x;
		});
	}

	for (const [targetName, sourcePath] of Object.entries(toBeCopied)) {
		const targetPath = path.join(outputDir, targetName);
		const dirName = path.dirname(targetPath);
		await fs.mkdir(dirName, { recursive: true });
		await fs.copyFile(path.join(FILES_DIR, sourcePath), targetPath);
	}

	const generators = {
		react: ReactConfigGenerator,
		vue: VueConfigGenerator,
	};

	console.log("Generating configutation files");

	const generator = new generators[framework](language);

	// TODO: Resolve the actual config file that the user may have in their system
	const prettierConfig: PrettierOptions = {};

	const packageJson = generator.generatePackageJson();

	if (yarn) {
		packageJson.scripts.dev = "yarn server";
		packageJson.scripts.prod = "yarn build && yarn server:prod";
	} else if (pnpm) {
		// pnpm server is a pnpm command
		packageJson.scripts.dev = "pnpm run server";
		packageJson.scripts.prod = "pnpm build && pnpm server:prod";
	}

	const packageJsonfileName = path.join(outputDir, "package.json");
	await fs.writeFile(
		packageJsonfileName,
		format(JSON.stringify(packageJson), {
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

	process.chdir(outputDir);

	if (!skipDependencies) {
		console.log("Installing dependencies with", packageManager);
		await runCommand(packageManager, "install");
	}

	if (initGitRepo) {
		console.log("Initializing git repository");
		await runCommand("git", "init");

		if (initGitRepo === true) initGitRepo = "main";
		if (initGitRepo !== "master") {
			await runCommand("git", "checkout", "-b", initGitRepo);
		}

		if (createInitialCommit) {
			console.log("Creating initial commit");
			if (createInitialCommit === true)
				createInitialCommit = `Initialized Vike ${
					typescript ? "TypeScript" : "vanilla JavaScript"
				} boilerplate for ${react ? "React" : "Vue"}`;
			await runCommand("git", "add", ".");
			await runCommand("git", "commit", "-m", createInitialCommit);
		}
	} else if (createInitialCommit) {
		console.warn("Ignoring initial commit because no git repo was initialized");
	}
}

async function getFiles(dir: string): Promise<string[]> {
	const files: string[] = [];

	const walker = walk(path.join(FILES_DIR, dir));
	walker.on("file", (root, fileStats, next) => {
		files.push(path.relative(FILES_DIR, path.join(root, fileStats.name)));
		next();
	});

	await new Promise<void>((resolve, reject) => {
		walker.on("end", resolve);
		walker.on("errors", (_, statsArr) => {
			const errors = statsArr.map((stat) => stat.error);
			reject(new Error(`Failed to walk ${dir}: ${errors.join(", ")}`));
		});
	});

	return files;
}
