import commander = require('commander');
import inquirer = require('inquirer');
import { State } from './state';
import { exec } from 'child_process';
import { Installer } from './installer';
import { Constants } from './constants';
import { AIDungeonInstaller } from './installers/aidungeon';
import { ThaDunge2Installer } from './installers/thadunge2';
import { CloverEditionInstaller } from './installers/cloveredition';
import { ModelManager } from './modelmanager';
import { AIDungeonLikeInstaller } from './installers/aidungeon-like';
import { CatalogManager } from './catalogmanager';

commander
    .option('-d, --debug', 'output diagnostic information while running');

const WelcomeText = 'Welcome to coldcut, the installer for AI text adventure games.';

async function main() {

    commander.parse(process.argv);

    const state = new State();
    await state.Init();

    const installer = new Installer(state);
    const modelManager = new ModelManager(state);
    const catalogManager = new CatalogManager();
    installer.registerInstaller(Constants.AIDungeon, new AIDungeonInstaller(state, modelManager));
    installer.registerInstaller(Constants.thadunge2, new ThaDunge2Installer(state, modelManager));
    installer.registerInstaller(Constants.CloverEdition, new CloverEditionInstaller(state, modelManager));
    installer.registerInstaller(Constants.ZenDungeon, new AIDungeonLikeInstaller(state, modelManager, catalogManager.get(Constants.ZenDungeon)));

    if (commander.args.length === 0) {
        console.log(WelcomeText);

        if (state.installedGames.length === 0) {
            console.log('No installations detected.');

            await installer.ExecutePrompt();

            console.log("\nDone installing! Run coldcut again to play.");
        } else {
            let addedChoices = [];
            if (state.installedGames.length < Constants.SupportedGames.length) {
                addedChoices.push(Constants.InstallAnotherGameChoice);
            }

            addedChoices.push(Constants.CancelChoice);

            let runGameChoices = state.installedGames.concat(addedChoices);
            let questions = [
                {
                    type: 'list',
                    name: 'game',
                    message: 'Select a game to run.',
                    choices: runGameChoices
                }
            ];

            let answers = await inquirer.prompt(questions);
            if (answers['game'] === Constants.CancelChoice) {
                process.exit(0);
            }

            if (answers['game'] === Constants.InstallAnotherGameChoice) {
                await installer.ExecutePrompt();
                console.log("\nDone installing! Run coldcut again to play.");
            }

            if (answers['game'] == Constants.AIDungeon) {
                await modelManager.prepareModelForGame(Constants.AIDungeon)
                exec("start cmd.exe /K \".\\venv\\Scripts\\python play.py\"", {
                    cwd: Constants.AIDungeonRepoPath
                });
            }

            if (answers['game'] === Constants.thadunge2) {
                await modelManager.prepareModelForGame(Constants.thadunge2);
                exec("start cmd.exe /K \".\\venv\\Scripts\\python play.py\"", {
                    cwd: Constants.thadunge2RepoPath
                });
            }

            if (answers['game'] === Constants.CloverEdition) {
                await modelManager.prepareModelForGame(Constants.CloverEdition);
                exec("start cmd.exe /K \".\\venv\\Scripts\\python play.py\"", {
                    cwd: Constants.CloverEditionRepoPath
                });
            }

            var gameParams = catalogManager.get(answers['game'] as string);
            await modelManager.prepareModelForGame(gameParams.Name);
            exec("start cmd.exe /K \".\\venv\\Scripts\\python play.py\"", {
                cwd: gameParams.RepoPath
            });
        }
    }
}

main();