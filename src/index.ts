import { program, Option } from "commander";
import { generate } from "./generate";
import { version } from "../package.json";

program.description("Generates Vike application boilerplate").version(version);

program.argument("<output-dir>", "Output directory");

program.addOption(
	new Option("-f, --framework <framework>", "Frontend framework").choices([
		"react",
		"vue",
	]),
);

program.addOption(
	new Option("-l, --language <language>", "Programming language").choices([
		"js",
		"ts",
	]),
);

program.action(
	(
		outputDir: string,
		options: { framework: "react" | "vue"; language: "js" | "ts" },
	) => {
		generate({ outputDir, ...options });
	},
);

program.parse();
