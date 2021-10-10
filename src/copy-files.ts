import fs from "fs";
import path from "path";
import { walk } from "walk";

export type CopyFilesFilter = (args: {
	path: string;
	readContent: () => Promise<string>;
	srcPath: string;
	destPath: string;
}) => Promise<CopyFilesFilterResult>;

type CopyFilesFilterResult =
	| { operation: "copy" }
	| { operation: "skip" }
	| { operation: "rename"; newPath: string }
	| { operation: "transform"; newPath?: string; newContent: string };

export async function copyFiles(
	src: string,
	dest: string,
	filter: CopyFilesFilter,
): Promise<void> {
	return new Promise<void>((resolve) => {
		const walker = walk(src, {});

		walker.on("file", async (root, fileStats, next) => {
			const srcPath = path.join(root, fileStats.name);
			const relativePath = path.relative(src, srcPath);
			const destPath = path.join(dest, relativePath);

			const filterResult = await filter({
				path: relativePath,
				readContent: () => fs.promises.readFile(srcPath, "utf-8"),
				srcPath,
				destPath,
			});

			switch (filterResult.operation) {
				case "skip":
					break;

				case "copy":
					{
						const outFileDir = path.dirname(destPath);
						await fs.promises.mkdir(outFileDir, { recursive: true });
						await fs.promises.copyFile(srcPath, destPath);
					}
					break;

				case "rename":
					{
						const outFileName = path.join(dest, filterResult.newPath);
						const outFileDir = path.dirname(outFileName);
						await fs.promises.mkdir(outFileDir, { recursive: true });
						await fs.promises.copyFile(srcPath, outFileName);
					}
					break;

				case "transform":
					{
						const outFileName = path.join(
							dest,
							filterResult.newPath ?? relativePath,
						);
						const outFileDir = path.dirname(outFileName);
						await fs.promises.mkdir(outFileDir, { recursive: true });
						await fs.promises.writeFile(
							outFileName,
							filterResult.newContent,
							"utf-8",
						);
					}
					break;

				default:
					assertNever(filterResult);
			}

			next();
		});

		walker.on("end", resolve);
	});
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function assertNever(arg: never) {
	throw new Error("Unexpected type");
}
