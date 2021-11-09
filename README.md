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
- Generates TypeScript and JavaScript files from the templates in `input-files` via `detype`.
- Copies files from `files/<language>/<framework>` where:
  - `<language>` is `shared`, `ts`, or `js`
  - `<framework>` is `common`, `react`, or `vue`
- Configuration files (`package.json`, `tsconfig.json`, and `vite.config.{js,ts}`) are generated programmatically.
- Boilerplate package versions are kept in `src/config-generators/package-versions.json`.

## Roadmap
- Create an interactive frontend
- Resolve user's default prettier config if any and use it instead of the default
