import { spawn } from "child_process";

export async function runCommand(command: string, ...args: string[]) {
	return new Promise<void>((resolve, reject) => {
		const child = spawn(command, args, { stdio: "inherit" });

		child.on("close", (code) => {
			if (code === 0) {
				resolve();
			} else {
				reject();
			}
		});
	});
}
