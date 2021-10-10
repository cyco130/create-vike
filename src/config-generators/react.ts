import { ConfigGenerator, PackageJson, ViteConfig } from "./common";

export default class ReactConfigGenerator extends ConfigGenerator {
	modifyTsConfig(): void {
		// Do nothing
	}

	modifyPackageJson(pkg: PackageJson): void {
		pkg.dependencies.push(...REACT_DEPENDENCIES);
		if (this.language === "ts") {
			pkg.dependencies.push(...REACT_TS_DEPENDENCIES);
		}
	}

	getViteConfig(): ViteConfig {
		return {
			frameworkImportName: "reactRefresh",
			frameworkImportPackage: "@vitejs/plugin-react-refresh",
		};
	}
}

const REACT_DEPENDENCIES = [
	"@vitejs/plugin-react-refresh",
	"react",
	"react-dom",
];

const REACT_TS_DEPENDENCIES = ["@types/react", "@types/react-dom"];
