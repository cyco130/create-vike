import path from "path";
import { generate, GenerationOptions } from "./generate";
import rimraf from "rimraf";
import { promisify } from "util";
import glob from "fast-glob";
import fs from "fs";
import os from "os";

const ORIGINAL_FILES_DIR = path.resolve(__dirname, "../original-boilerplates");
const TEMP_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "create-vike-test-"));

jest.setTimeout(10_000);

describe("Project generator", () => {
	beforeEach(async () => {
		await promisify(rimraf)(TEMP_DIR);
	});

	afterAll(async () => {
		await promisify(rimraf)(TEMP_DIR);
	});

	interface GenerationTestParams {
		name: string;
		dir: string;
		options: Omit<GenerationOptions, "outputDir">;
	}

	const testParams: GenerationTestParams[] = [
		{
			name: "TypeScript + React",
			dir: "ts-react",
			options: { framework: "react", language: "ts" },
		},
		{
			name: "JavaScript + React",
			dir: "js-react",
			options: { framework: "react", language: "js" },
		},
		{
			name: "TypeScript + Vue",
			dir: "ts-vue",
			options: { framework: "vue", language: "ts" },
		},
		{
			name: "JavaScript + Vue",
			dir: "js-vue",
			options: { framework: "vue", language: "js" },
		},
	];

	for (const { name, dir, options } of testParams) {
		it("generates " + name + " project", async () => {
			const dirName = path.join(ORIGINAL_FILES_DIR, dir);

			const originalFileNames = (
				await glob(path.join(dirName, "**/*"), { dot: true })
			)
				.map((fn) => path.relative(dirName, fn))
				.sort();

			await generate({
				outputDir: TEMP_DIR,
				...options,
			});

			const generatedFileNames = (
				await glob(path.join(TEMP_DIR, "**/*"), { dot: true })
			)
				.map((fn) => path.relative(TEMP_DIR, fn))
				.sort();

			expect(generatedFileNames).toStrictEqual(originalFileNames);

			for (const fn of generatedFileNames) {
				const originalName = originalFileNames.find((ofn) => ofn === fn);
				if (originalName) {
					const originalContent = await fs.promises.readFile(
						path.join(ORIGINAL_FILES_DIR, dir, fn),
						"utf-8",
					);

					const generatedContent = await fs.promises.readFile(
						path.join(TEMP_DIR, fn),
						"utf-8",
					);

					if (generatedContent !== originalContent) {
						console.log(
							path.join(TEMP_DIR, fn) +
								"\n" +
								path.join(ORIGINAL_FILES_DIR, dir, fn),
						);
						expect(generatedContent).toBe(originalContent);
					}
				}
			}
		});
	}
});
