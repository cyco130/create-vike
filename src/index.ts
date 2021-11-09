import { program, Option } from "commander";
import { generate } from "./generate";
import { version } from "../package.json";

program
	.description("Generates Vike application boilerplate")
	.version(version)
	.argument("<output-dir>", "Output directory")
	.addOption(
		new Option("-f, --framework <framework>", "Frontend framework").choices([
			"react",
			"vue",
		]),
	)
	.addOption(
		new Option("-l, --language <language>", "Programming language").choices([
			"js",
			"ts",
		]),
	)
	.action(
		(
			outputDir: string,
			options: { framework: "react" | "vue"; language: "js" | "ts" },
		) => {
			generate({ outputDir, ...options });
		},
	)
	.parse();
