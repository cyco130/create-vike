import { ConfigGenerator, PackageJson, TsConfig, ViteConfig } from "./common";

export default class VueConfigGenerator extends ConfigGenerator {
	modifyTsConfig(config: TsConfig): void {
		delete config.compilerOptions.jsx;
	}

	modifyPackageJson(pkg: PackageJson): void {
		pkg.dependencies.push(...VUE_DEPENDENCIES);
	}

	getViteConfig(): ViteConfig {
		return {
			frameworkImportName: "vue",
			frameworkImportPackage: "@vitejs/plugin-vue",
		};
	}
}

const VUE_DEPENDENCIES = [
	"@vitejs/plugin-vue",
	"@vue/compiler-sfc",
	"@vue/server-renderer",
	"vue",
];
