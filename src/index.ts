import { program } from "commander";
import { generate } from "./generate";
import { version } from "../package.json";

program
	.description("Generates Vike application boilerplate")
	.version(version)
	.argument("<output-dir>", "Output directory")
	.option("-t, --typescript", "use TypeScript", false)
	.option("-n, --npm", "use npm package manager", false)
	.option("-y, --yarn", "use yarn package manager", false)
	.option("-p, --pnpm", "use pnpm package manager", false)
	.option("-v, --vue", "use Vue", false)
	.option("-r, --react", "use React", false)
	.option("-c, --client-router", "use client router", false)
	.option("-s, --skip-dependencies", "skip installing dependencies", false)
	.option("-i, --init-git-repo [branch]", "initialize git repo", false)
	.option(
		"-m, --create-initial-commit [message]",
		"create initial commit",
		false,
	)
	.action(
		(
			outputDir: string,
			options: {
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
			},
		) => {
			generate({ outputDir, ...options });
		},
	)
	.parse();
