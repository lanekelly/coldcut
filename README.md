# coldcut
Coldcut is a single-exe installer for AI text adventure games on Windows.

Currently supported games:
- [AI Dungeon](https://github.com/AIDungeon/AIDungeon)
- [thadunge2](https://github.com/thadunge2/AIDungeon)
- [CloverEdition](https://github.com/cloveranon/Clover-Edition)

## Using coldcut

Grab the latest release or build from source (see instructions below).

Either double-click the included .exe or run the following from a terminal.

```
.\coldcut.exe
```

An interactive prompt will guide you through the installation.

## Building from source on Windows

### Prereqs

- Node v12
- Yarn

```
yarn global add typescript
yarn global add pkg
tsc && pkg dist/index.js --targets node12 --output build/coldcut
```