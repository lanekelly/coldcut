import commander = require('commander');
import inquirer = require('inquirer');
import { State } from './state';
import { exec } from 'child_process';
import { Installer } from './installer';
import { Constants } from './constants';
import { CloverEditionInstaller } from './installers/cloveredition';
import { ModelManager } from './modelmanager';
import { AIDungeonLikeInstaller } from './installers/aidungeon-like';
import { CatalogManager } from './catalogmanager';
import { StorybroInstaller } from './installers/storybro';

commander
    .option('-d, --debug', 'output diagnostic information while running');

const WelcomeText = 'Welcome to coldcut, the installer for AI text adventure games.';

async function main(): Promise<void> {

    commander.parse(process.argv);

    const state = new State();
    await state.Init();

    const installer = new Installer(state);
    const modelManager = new ModelManager(state);
    const catalogManager = new CatalogManager();
    installer.registerInstaller(Constants.AIDungeon, new AIDungeonLikeInstaller(state, modelManager, catalogManager.get(Constants.AIDungeon)));
    installer.registerInstaller(Constants.thadunge2, new AIDungeonLikeInstaller(state, modelManager, catalogManager.get(Constants.thadunge2)));
    installer.registerInstaller(Constants.CloverEdition, new CloverEditionInstaller(state, modelManager));
    installer.registerInstaller(Constants.ZenDungeon, new AIDungeonLikeInstaller(state, modelManager, catalogManager.get(Constants.ZenDungeon)));
    installer.registerInstaller(Constants.Storybro, new StorybroInstaller(state, modelManager, catalogManager.get(Constants.Storybro)));

    if (commander.args.length === 0) {
        console.log(WelcomeText);

        if (state.installedGames.length === 0) {
            console.log('No installations detected.');

            await installer.ExecutePrompt();

            console.log("\nDone installing! Run coldcut again to play.");
        } else {
            const addedChoices = [];
            if (state.installedGames.length < Constants.SupportedGames.length) {
                addedChoices.push(Constants.InstallAnotherGameChoice);
            }

            addedChoices.push(Constants.CancelChoice);

            const runGameChoices = state.installedGames.concat(addedChoices);
            const questions = [
                {
                    type: 'list',
                    name: 'game',
                    message: 'Select a game to run.',
                    choices: runGameChoices
                }
            ];

            const answers = await inquirer.prompt(questions);
            if (answers['game'] === Constants.CancelChoice) {
                process.exit(0);
            }

            if (answers['game'] === Constants.InstallAnotherGameChoice) {
                await installer.ExecutePrompt();
                console.log("\nDone installing! Run coldcut again to play.");
                process.exit(0);
            }

            const gameParams = catalogManager.get(answers['game'] as string);
            await modelManager.prepareModelForGame(gameParams.Name);

            if (gameParams.Name === Constants.Storybro) {

                console.log("Instructions:")
                console.log("You must pass the \"cc.config\" config file to storybro to use the AI model managed by coldcut.\n")
                console.log("Example: \"storybro --config cc.config play newstory\"\n")

                const prompt = [
                    {
                        type: 'input',
                        name: 'nothing',
                        message: 'Press enter to launch.'
                    }
                ];

                await inquirer.prompt(prompt);

                exec("start cmd.exe /K \".\\venv\\Scripts\\activate\"", {
                    cwd: gameParams.RepoPath
                });
            } else {
                exec("start cmd.exe /K \".\\venv\\Scripts\\python play.py\"", {
                    cwd: gameParams.RepoPath
                });
            }
        }
    }
}

main();