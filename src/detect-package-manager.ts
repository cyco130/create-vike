export function detectPackageManager(): "yarn" | "npm" | "pnpm" | null {
	// This environment variable is set by npm and yarn but pnpm seems less consistent:
	// See issue: https://github.com/pnpm/pnpm/issues/3985
	const agent = process.env.npm_config_user_agent;

	if (agent) {
		const [program] = agent.split("/");

		if (program === "yarn") return "yarn";
		if (program === "pnpm") return "pnpm";
		if (program === "npm") return "npm";
	}

	if (process.platform !== "win32") {
		// This environment variable is set on Linux (and hopefully other Unix-like systems including MacOS)
		const parent = process.env._;

		if (parent) {
			if (parent.endsWith("pnpx") || parent.endsWith("pnpm")) return "pnpm";
			if (parent.endsWith("yarn")) return "yarn";
			if (parent.endsWith("npx") || parent.endsWith("npm")) return "npm";
		}
	}

	// No luck :(
	return null;
}
