import storage = require('node-persist');
import commander = require('commander');
import { Constants } from './constants';

export class State {
    private static readonly InstalledGamesKey = 'installedGames';
    private static readonly ModelStatesKey = 'modelState';
    private static readonly IsPython376InstalledKey = 'isPython376Installed';
    private static readonly IsPython368InstalledKey = 'isPython368Installed';

    private _isPython376Installed: boolean;
    private _isPython368Installed: boolean;
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

        if (storageKeys.includes(State.IsPython376InstalledKey)) {
            this._isPython376Installed = await storage.getItem(State.IsPython376InstalledKey);
        }

        if (storageKeys.includes(State.IsPython368InstalledKey)) {
            this._isPython368Installed = await storage.getItem(State.IsPython368InstalledKey);
        }

        if (storageKeys.includes(State.ModelStatesKey)) {
            this._modelStates = await storage.getItem(State.ModelStatesKey);
        }
    }

    get installedGames(): string[] {
        return this._installedGames;
    }

    isPythonInstalled(version: string): boolean {
        switch (version) {
            case Constants.Python376:
                return this._isPython376Installed;
            case Constants.Python368:
                return this._isPython368Installed;
            default:
                return false;
        }
    }

    get isDebug(): boolean {
        return commander.debug;
    }

    modelState(name: string): ModelState {
        return this._modelStates.find(e => e.modelName === name);
    }

    async setIsPythonInstalled(version: string, value: boolean) {
        switch (version) {
            case Constants.Python376:
                this._isPython376Installed = value;
                await storage.setItem(State.IsPython376InstalledKey, this._isPython376Installed);
                return;
            case Constants.Python368:
                this._isPython368Installed = value;
                await storage.setItem(State.IsPython368InstalledKey, this._isPython368Installed);
                return;
            default:
                return;
        }
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