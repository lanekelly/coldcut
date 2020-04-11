# coldcut
Coldcut is a single-exe installer for AI text adventure games on Windows.

Currently supported games:
- [AI Dungeon](https://github.com/AIDungeon/AIDungeon)
- [thadunge2](https://github.com/thadunge2/AIDungeon)
- [CloverEdition](https://github.com/cloveranon/Clover-Edition)
- [Storybro](https://github.com/storybro/storybro)
- [ZenDungeon](https://gitlab.com/aolko/ZenDungeon)

## Using coldcut

Grab the latest release or build from source (see instructions below).

Either double-click the included .exe or run the following from a terminal.

```
.\coldcut.exe
```

An interactive prompt will guide you through the installation.

## Prereqs for local development

- [Node v12](https://nodejs.org/en/blog/release/v12.13.0/)
- [Yarn](https://classic.yarnpkg.com/en/docs/install/#windows-stable)

## Building and running from source on Windows

```
yarn
yarn tsc
node .\dist\index.js
```

## Packaging a new version for release
Coldcut uses [zeit/pkg](https://github.com/zeit/pkg) to produce a standalone executable.

```
yarn global add pkg
```

In PowerShell:
```
.\pkg.ps1
```
Afterwords, **coldcut.exe** can be found in the *build/* folder, while the zipped release, **coldcut-win-x64.zip**, is found in *deploy/*.