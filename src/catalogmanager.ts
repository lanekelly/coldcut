import { Constants } from "./constants";

export interface GameParametersInterface {
    Name: string;
    RepoPath: string;
    ModelRuntimePath: string;
    RemoteRepoUri: string;
}

export class CatalogManager {

    private readonly gameParameters = new Map<string, GameParametersInterface>();

    constructor() {
        // TODO - load this from a file somewhere in the future.
        this.gameParameters.set(Constants.ZenDungeon, {
            Name: Constants.ZenDungeon,
            RepoPath: Constants.ZenDungeonRepoPath,
            ModelRuntimePath: Constants.ZenDungeonModelRuntimePath,
            RemoteRepoUri: Constants.ZenDungeonGitRepo
        });
    }

    get(game: string): GameParametersInterface {
        return this.gameParameters.get(game);
    }
}