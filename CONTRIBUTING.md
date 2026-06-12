# The big Tiny monorepo

Welcome to the TinyMCE monorepo. For TinyMCE itself look to the [modules/tinymce](modules/tinymce) folder.

## Some background

As TinyMCE transitioned to a modern codebase through 2017 and 2018 many external dependencies were added from previously closed-source projects. This became unwieldy to develop, so in June 2019 the decision was made to bring those projects together in a monorepo.

This repo is built with Yarn workspaces and uses publish tooling support from Lerna. NPM is not supported and attempts to use it will fail.

An important feature of this monorepo is the use of TypeScript 3.0 features "project references" and "build mode":
https://www.typescriptlang.org/docs/handbook/project-references.html

### A quick note about `modules`

Most monorepos use a `packages` folder to hold the included projects, but we have chosen `modules` instead. There are few reasons for this:

* These projects are not extra packages of TinyMCE, they are self contained libraries used as module dependencies for the editor.
* Enough examples exist of projects not using `packages` that we don't think it will be difficult to understand
* It tab completes better (`packages` overlaps with `package.json`)

## Getting started

Install [Node.js](https://nodejs.org/en/) on your system.
Clone this repository on your system
```
$ git clone https://github.com/mild-blue/opentiny.git
```

### Install dependencies

* `yarn`

### Build OpenTiny

* `yarn build`

This will produce an editor build in `modules/tinymce/js`, with distribution zips in `modules/tinymce/dist/tinymce_[number].zip`.

## Developing OpenTiny

* `yarn dev`

This performs compilation steps which webpack requires but are usually once-off. It also runs `tsc` to make later commands faster (`tsc -b` enforces incremental compilation).

### Builds

To build the editor in development, use `yarn tinymce-grunt`. This will output to the `modules/tinymce/js` folder (`build` is effectively `dev` followed by `tinymce-grunt`).

Task names can be included, for example `yarn tinymce-grunt bundle` will execute the bundle task. More information on TinyMCE grunt tasks is available in the [TinyMCE readme](modules/tinymce/README.md).

## Development scripts

There are many top-level helper scripts for TinyMCE and Oxide (the default skin) defined in `package.json`.

### TinyMCE

`yarn start`
This boots the TinyMCE webpack dev server at http://localhost:3000. With this running changes to _any_ `.ts` source file in the monorepo (excluding tests) should be reflected in WebPack within a few seconds.

`yarn watch`
runs `tsc -b -w` for those times when you don't need to iterate in the browser.

`yarn tsc`
an alias to `tsc -b` just in case you forget

`yarn eslint`
runs `eslint` across the entire repository with the rule set that is required to pass in CI. Use `yarn eslint --fix` to automatically fix minor problems. The [ESLint vscode plugin](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) can be used to apply lint fixes on save.

`yarn tinymce-grunt`
easy access to the TinyMCE grunt commands from the root folder.

### Oxide

```
yarn oxide-build
yarn oxide-icons-build
```

These commands build the skin and icons but should not normally be required outside of other development scripts.

`yarn oxide-start` will set up a watch and rebuild process for creating custom skins.

### Focussed development

If you are working in a single module and don't want to deal with the overheads of whole-monorepo compilation, you can run `yarn --focus` from that module's folder to install the latest published versions of monorepo projects in a local `node_modules`. For more information see this yarn blog post:
https://yarnpkg.com/blog/2018/05/18/focused-workspaces/

## Testing

Testing relies on `yarn lerna changed` to determine which modules need testing, and a grunt script then separates them into two groups depending on whether they need GUI browser testing or can be tested with chrome-headless.

### CI test scripts
```
yarn browser-test
yarn headless-test
```

### Dev test scripts
```
yarn browser-test-manual
yarn headless-test-manual
```

Development testing will be adjusted in future so that there's only one manual entry point for ease of development. They are still separate for now because there are two projects that use bedrock route configurations; a route config combination process is required to run them at the same time.

### Running a subset of tests

To run a single test: `yarn bedrock -f file`

To run a whole folder of tests: `yarn bedrock -d folder`

## CI builds

CI builds rely on the `ci` and `ci-all` package.json scripts, in addition to the above testing scripts, to run type checking and linting before executing the full test suite. A `ci-local` package.json script has also been added for convenience to simulate this process in development and then run tests.

## Version management

It is important that you never hand-edit a `package.json` file, particularly the `dependency` and `version` fields. And we do mean _never_. Doing so may break the automated scripts. See the `publishing` section below for more information.

### dev dependencies

All dev dependencies are in the project root, so to add or upgrade a specific dependency:
`yarn add -D -W <package>`

### normal dependencies

To add a dependency inside a monorepo package:
`yarn workspace <fullname> add <othername>`

This works whether adding an external dependency or a dependency on another monorepo package.

Note that both names must be the entire scoped `name` of the package, not the folder, for example
`yarn workspace @tinymce/oxide add @tinymce/oxide-icons-default`

## Publishing process

> The upstream TinyMCE publishing process (Lerna-driven CI publishing patch releases twice a day) does **not** apply
> to this fork.

OpenTiny is published to the public npm registry as [`opentiny`](https://www.npmjs.com/package/opentiny) by the
[`npm-publish.yml`](.github/workflows/npm-publish.yml) GitHub Actions workflow. The process is release-driven:

1. Merge your changes to `main`.
2. Create a git tag and a GitHub release for it. Tags follow the upstream-style `6.9.x` numbering — pick the next
   patch (or minor) version as appropriate.
3. Creating the release triggers `npm-publish.yml`, which installs dependencies, runs `yarn build`, copies
   `publish/package.json` into `js/tinymce`, sets the package version from the latest git tag, and publishes the
   `js/tinymce` output to npm.

Notes:

- The `version` fields committed in the repository's `package.json` files are **not** what gets published — the
  version is injected from the release tag at publish time.
- After publishing a new `opentiny` version, update the pinned `opentiny` dependency in
  [opentiny-react](https://github.com/mild-blue/opentiny-react) and create a release there too, so the React wrapper
  is published against the new editor version.

## Adding globals

TinyMCE puts a `tinymce` object in the global namespace, and has a tree of objects down from there.
If you wish to add to this, you need to do the following:

1. Ensure your module is located under `modules/tinymce/src/core/main/ts/api`
2. Expose any types under `interface TinyMCE` in `modules/tinymce/src/core/main/ts/api/Tinymce.ts`
3. Expose any objects/functions as part of `const publicApi` in `modules/tinymce/src/core/main/ts/api/Tinymce.ts`
4. Ensure your values are exposed in `modules/tinymce/src/core/main/json/globals.json`

Ensure the paths all match. e.g. if you're exposing `modules/tinymce/src/core/main/ts/api/dom/StyleSheetLoader.ts`

1. The module is under `.../api/dom/StyleSheetLoader.ts`
2. The type is `TinyMCE.dom.StyleSheetLoader`
3. The constructor function is `publicApi.dom.StyleSheetLoader`
4. globals.json contains `"tinymce.core.api.dom.StyleSheetLoader"`

