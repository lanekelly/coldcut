import storage = require('node-persist');
import commander = require('commander');

export class State {
    private static readonly InstalledGamesKey = 'installedGames';
    private static readonly IsPythonInstalledKey = 'isPythonInstalled';

    private _isPythonInstalled: boolean;
    private _installedGames: string[] = [];

    async Init() {
        await storage.init({
            dir: 'system/internal-storage'
        });

        const storageKeys = await storage.keys();

        if (storageKeys.includes(State.InstalledGamesKey)) {
            this._installedGames = await storage.getItem(State.InstalledGamesKey);
        }

        if (storageKeys.includes(State.IsPythonInstalledKey)) {
            this._isPythonInstalled = await storage.getItem(State.IsPythonInstalledKey);
        }
    }

    get installedGames(): string[] {
        return this._installedGames;
    }

    get isPythonInstalled(): boolean {
        return this._isPythonInstalled;
    }

    get isDebug(): boolean {
        return commander.debug;
    }

    async setIsPythonInstalled(value: boolean) {
        this._isPythonInstalled = value;

        await storage.setItem(State.IsPythonInstalledKey, this._isPythonInstalled);
    }

    async addInstalledGame(value: string) {
        this._installedGames.push(value);

        await storage.setItem(State.InstalledGamesKey, this._installedGames);
    }
}