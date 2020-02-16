import { Constants } from "./constants";
import { State } from "./state";
import { Torrent } from "./helpers/torrent";
import fs = require('fs');
import path = require('path');

export class ModelManager {
    // TODO: reconcile this with Game class
    private gameData = [
        {
            game: Constants.AIDungeon,
            runtimePath: Constants.AIDungeonModelRuntimePath,
            defaultModel: Constants.AIDungeonDefaultModel
        },
        {
            game: Constants.thadunge2,
            runtimePath: Constants.thadunge2ModelRuntimePath,
            defaultModel: Constants.AIDungeonDefaultModel
        },
        {
            game: Constants.CloverEdition,
            runtimePath: Constants.CloverEditionModelRuntimePath,
            defaultModel: Constants.CloverEditionDefaultModel
        },
        {
            game: Constants.ZenDungeon,
            runtimePath: Constants.ZenDungeonModelRuntimePath,
            defaultModel: Constants.AIDungeonDefaultModel
        },
        {
            game: Constants.Storybro,
            runtimePath: Constants.StorybroModelRuntimePath,
            defaultModel: Constants.AIDungeonDefaultModel
        }
    ];

    private models = [
        {
            modelName: Constants.AIDungeonDefaultModel,
            installPath: Constants.AIDungeonDefaultModelInstallPath,
            magnetLink: Constants.AIDungeonDefaultModelMagnetLink
        },
        {
            modelName: Constants.CloverEditionDefaultModel,
            installPath: Constants.CloverEditionDefaultModelInstallPath,
            magnetLink: Constants.CloverEditionDefaultModelMagnetLink
        }
    ];

    private readonly state: State;

    constructor(state: State) {
        this.state = state;
    }

    async initModel(gameName: string) {
        let gameData = this.gameData.find(e => e.game === gameName);
        let model = this.models.find(e => e.modelName === gameData.defaultModel);

        let currentState = this.state.modelState(model.modelName);

        if (!currentState || !currentState.isInstalled) {
            await Torrent(model.installPath, model.magnetLink);

            if (!currentState) {
                currentState = {
                    modelName: model.modelName,
                    isInstalled: true,
                    currentPath: model.installPath
                };
            } else {
                currentState.isInstalled = true;
                currentState.currentPath = model.installPath;
            }

            await this.state.setModelState(currentState);
        }
    }

    isModelInstalled(gameName: string) {
        let gameData = this.gameData.find(e => e.game === gameName);
        let model = this.models.find(e => e.modelName === gameData.defaultModel);

        let currentState = this.state.modelState(model.modelName);

        return currentState && currentState.isInstalled;
    }

    async prepareModelForGame(gameName: string) {
        let gameData = this.gameData.find(e => e.game === gameName);
        let model = this.models.find(e => e.modelName === gameData.defaultModel);

        let currentState = this.state.modelState(model.modelName);

        // Anyone upgrading from 1.0 -> 1.1.
        // Assuming if they got this far, they have the game installed with the model in the runtime path.
        if (!currentState) {
            currentState = {
                modelName: model.modelName,
                isInstalled: true,
                currentPath: gameData.runtimePath
            }

            await this.state.setModelState(currentState);
        }

        if (currentState.currentPath !== gameData.runtimePath) {
            // need to move model here
            let fileList = await fs.promises.readdir(currentState.currentPath);
            for (let fileName of fileList) {
                let oldPath = path.join(currentState.currentPath, fileName);
                let newPath = path.join(gameData.runtimePath, fileName);

                if (this.state.isDebug) {
                    console.log(`Moving file from ${oldPath} to ${newPath}`);
                }

                await fs.promises.rename(oldPath, newPath);
            }

            currentState.currentPath = gameData.runtimePath;

            await this.state.setModelState(currentState);
        }
    }
}

