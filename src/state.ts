import storage = require('node-persist');
import commander = require('commander');

export class State {
    private static readonly InstalledGamesKey = 'installedGames';
    private static readonly IsPythonInstalledKey = 'isPythonInstalled';
    private static readonly ModelStatesKey = 'modelState';

    private _isPythonInstalled: boolean;
    private _installedGames: string[] = [];
    private _modelStates: ModelState[] = [];

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

        if (storageKeys.includes(State.ModelStatesKey)) {
            this._modelStates = await storage.getItem(State.ModelStatesKey);
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

    modelState(name: string): ModelState {
        return this._modelStates.find(e => e.modelName === name);
    }

    async setIsPythonInstalled(value: boolean) {
        this._isPythonInstalled = value;

        await storage.setItem(State.IsPythonInstalledKey, this._isPythonInstalled);
    }

    async addInstalledGame(value: string) {
        this._installedGames.push(value);

        await storage.setItem(State.InstalledGamesKey, this._installedGames);
    }

    async setModelState(value: ModelState) {
        let newState = this._modelStates.filter(m => m.modelName !== value.modelName);
        newState.push(value);

        this._modelStates = newState;

        await storage.setItem(State.ModelStatesKey, this._modelStates);
    }
}

export interface ModelState {
    modelName: string;
    isInstalled: boolean;
    currentPath: string;
}