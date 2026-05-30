# Contributing

Contributions are welcome. This document describes how to set up the project, run tests, and submit changes.

## Prerequisites

- **Node.js** >= 18.0.0
- **zip** command (pre-installed on macOS/Linux; install via your package manager on Windows/WSL)
- A Chromium browser (Chrome, Edge, or Brave) for manual extension testing

## Setup

```bash
git clone https://github.com/FreddyCreates/potential-succotash.git
cd potential-succotash
```

No `npm install` is needed — the project has zero runtime dependencies. All code uses Node.js built-in modules only.

## Project Structure

```
extensions/          # 26 Chrome Manifest V3 browser extensions
sdk/                 # 11 sovereign AI SDKs (ESM modules)
protocols/           # 11 intelligence protocols
organism/            # Organism implementations in 6 languages
organism-cli/        # Terminal CLI for extension management
scripts/             # Build and validation scripts
test/                # Node.js test runner tests
.github/workflows/   # CI/CD pipelines
```

## Running Tests

```bash
# All tests
node --test test/**/*.test.js

# By area
node --test test/sdk/*.test.js
node --test test/extensions/*.test.js
node --test test/cli/*.test.js
```

## Linting

```bash
# Validate all extension manifests
node scripts/lint-manifests.js
```

## Building Extensions

```bash
# Generate icons (if missing) and build all extension zips
bash build-extensions.sh

# Dry-run (validate only, no zips)
bash build-extensions.sh --check

# Output goes to dist/extensions/
```

## Adding a New Extension

1. Create a directory under `extensions/` with your extension slug
2. Add `manifest.json` (Manifest V3), `background.js`, and `content.js`
3. Run `node scripts/generate-icons.js` to generate placeholder icons
4. Add an entry to `extensions/index.js`
5. Run `node scripts/lint-manifests.js` to validate
6. Run `node --test test/extensions/*.test.js` to verify

## Adding a New SDK

1. Create a directory under `sdk/` with a `package.json` and `src/index.js`
2. Add the SDK name to the `EXPECTED_SDKS` array in `test/sdk/sdk-structure.test.js`
3. Run tests to verify: `node --test test/sdk/*.test.js`

## Submitting Changes

1. Fork the repository and create a feature branch
2. Make your changes
3. Run the full test suite: `node --test test/**/*.test.js`
4. Run lint: `node scripts/lint-manifests.js`
5. Build extensions: `bash build-extensions.sh`
6. Open a pull request against `main`

## Code Style

- Extensions are vanilla JavaScript (no bundler, no transpiler, no frameworks)
- SDKs use ESM (`import`/`export`) and target Node.js >= 18
- No external runtime dependencies — everything uses Node.js built-ins
- Use `'use strict'` in all CJS modules
