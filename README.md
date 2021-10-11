# Vike Project Generator

Generates Vike application boilerplate

## Usage
```
create-vike [options] <output-dir>

Arguments:
  output-dir                   Output directory

Options:
  -V, --version                output the version number
  -f, --framework <framework>  Frontend framework (choices: "react", "vue")
  -l, --language <language>    Programming language (choices: "js", "ts")
  -h, --help                   display help for command
```

## How it works
- Copies files from `input-files/common`, `input-files/react`, and `input-files/vue` renaming and transforming them as necessary.
- Generates plain JS files from the TS files via `detype`.
- Configuration files (`package.json`, `tsconfig.json`, and `vite.config.{js,ts}`) are generated programmatically.
- Boilerplate package versions are kept in `src/config-generators/package-versions.json`.

## Roadmap
- Create an interactive frontend
- Apply TS > JS transform in build-time to speed up generation
- Resolve user's default prettier config if any and use it instead of the default
