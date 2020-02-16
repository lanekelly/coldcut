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
        this.gameParameters.set(Constants.AIDungeon, {
            Name: Constants.AIDungeon,
            RepoPath: Constants.AIDungeonRepoPath,
            ModelRuntimePath: Constants.AIDungeonModelRuntimePath,
            RemoteRepoUri: Constants.AIDungeonRemoteRepoUri
        });

        this.gameParameters.set(Constants.thadunge2, {
            Name: Constants.thadunge2,
            RepoPath: Constants.thadunge2RepoPath,
            ModelRuntimePath: Constants.thadunge2ModelRuntimePath,
            RemoteRepoUri: Constants.thadunge2RemoteRepoUri
        });

        this.gameParameters.set(Constants.CloverEdition, {
            Name: Constants.CloverEdition,
            RepoPath: Constants.CloverEditionRepoPath,
            ModelRuntimePath: Constants.CloverEditionModelRuntimePath,
            RemoteRepoUri: Constants.CloverEditionRemoteRepoUri
        });

        this.gameParameters.set(Constants.ZenDungeon, {
            Name: Constants.ZenDungeon,
            RepoPath: Constants.ZenDungeonRepoPath,
            ModelRuntimePath: Constants.ZenDungeonModelRuntimePath,
            RemoteRepoUri: Constants.ZenDungeonRemoteRepoUri
        });

        this.gameParameters.set(Constants.Storybro, {
            Name: Constants.Storybro,
            RepoPath: Constants.StorybroRepoPath,
            ModelRuntimePath: Constants.StorybroModelRuntimePath,
            RemoteRepoUri: null // installed via pip
        });
    }

    get(game: string): GameParametersInterface {
        return this.gameParameters.get(game);
    }
}