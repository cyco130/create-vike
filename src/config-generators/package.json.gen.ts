import { applyTransforms, PackageJson, specificityKeys } from "./common";
import merge from "lodash.merge";


// most specific to least specific

type Props = {
  options: SpecificityOptions,
  transforms: TransformRecords<PackageJson>
}

export const defaultTransforms: TransformRecords<PackageJson> = {
  "ts": content => merge(content, {
    scripts: {
      server: "ts-node ./server",
      "server:prod": "cross-env NODE_ENV=production ts-node ./server",
    },
    dependencies: ["@types/express", "@types/node", "ts-node", "typescript"],
  }),
  "react": content => merge(content, {
    dependencies: [
      "@vitejs/plugin-react-refresh",
      "react",
      "react-dom",
    ]
  }),
  "react-ts": content => merge(content, {
    dependencies: ["@types/express", "@types/node", "ts-node", "typescript"]
  }),
  "vue": content => merge(content, {
    dependencies: [
      "@vitejs/plugin-vue",
      "@vue/compiler-sfc",
      "@vue/server-renderer",
      "vue",
    ]
  })
};

export const generate = ({options, transforms}: Props): PackageJson => {
  transforms = merge(defaultTransforms, transforms);
  const jsonBase: PackageJson = {
    scripts: {
      dev: "npm run server",
      prod: "npm run build && npm run server:prod",
      build: "vite build && vite build --ssr",
      server: "node ./server",
      "server:prod": "cross-env NODE_ENV=production node ./server",
    },
    dependencies: ["cross-env", "express", "vite", "vite-plugin-ssr"],
  }
  return applyTransforms({data: jsonBase, transforms, options});
  
  // if (transforms.length) {
  //   jsonBase = transforms.reduce((acc, transform) => {
  //     return transform(acc);
  //   }, jsonBase);
  // }
  // if (Object.keys(transforms).includes(language)) {
  //   jsonBase = transforms[language]!(jsonBase);
  // }
  return jsonBase;
}