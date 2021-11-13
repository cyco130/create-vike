import versions from "./src/config-generators/package-versions.json";
import { spawn } from "child_process";
import semver from "semver";
import chalk from "chalk";

console.log("{");

const entries = Object.entries(versions);
let i = 0;

for (const [pkg, version] of entries) {
	const latest = await new Promise((resolve, reject) => {
		const child = spawn("npm", ["view", pkg, "version", "--json"], {
			stdio: ["ignore", "pipe", "inherit"],
			shell: true,
		});

		let output = "";

		child.on("error", reject);
		child.stdout.on("data", (data) => {
			output += data;
		});
		child.on("close", (code) => {
			if (code !== 0) {
				reject(new Error(`npm view ${pkg} version --json failed`));
			}

			resolve(JSON.parse(output));
		});
	});

	const simplified = version.startsWith("^") ? version.slice(1) : version;
	const isSame = simplified === latest;
	const isUpToDate = semver.satisfies(latest, version);

	i++;
	const end = i < entries.length ? "," : "";

	const color = isSame ? chalk.gray : isUpToDate ? chalk.green : chalk.red;

	console.log(
		"\t",
		JSON.stringify(pkg) + ":",
		color(JSON.stringify(latest) + end),
	);
}

console.log("}");
