import commander = require('commander');
import inquirer = require('inquirer');
import { State } from './state';
import { exec } from 'child_process';
import { Installer } from './installer';
import { Constants } from './constants';
import { AIDungeonInstaller } from './installers/aidungeon';
import { ThaDunge2Installer } from './installers/thadunge2';

commander
    .option('-d, --debug', 'output diagnostic information while running');

const WelcomeText = 'Welcome to coldcut, the installer for AI text adventure games.';

async function main() {

    commander.parse(process.argv);

    const state = new State();
    await state.Init();

    const installer = new Installer(state);
    installer.registerInstaller(Constants.AIDungeon, new AIDungeonInstaller(state));
    installer.registerInstaller(Constants.thadunge2, new ThaDunge2Installer(state));

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
            }

            if (answers['game'] == Constants.AIDungeon) {
                exec("start cmd.exe /K \".\\venv\\Scripts\\python play.py\"", {
                    cwd: Constants.AIDungeonRepoPath
                });
            }

            if (answers['game'] === Constants.thadunge2) {
                exec("start cmd.exe /K \".\\venv\\Scripts\\python play.py\"", {
                    cwd: Constants.thadunge2RepoPath
                });
            }
        }
    }
}

main();