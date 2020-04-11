import inquirer = require('inquirer');
import fs = require('fs');
import { State } from './state';
import * as git from 'isomorphic-git';
import { Constants } from './constants';

export interface InstallerInterface {
    install(): Promise<void>;

    requiredDiskSpace: string;
}

export class Installer {
    private readonly state: State;

    private readonly installers = new Map<string, InstallerInterface>()

    constructor(state: State) {
        this.state = state;

        git.plugins.set('fs', fs);
    }

    registerInstaller(name: string, installer: InstallerInterface): void {
        this.installers.set(name, installer);
    }

    async ExecutePrompt(): Promise<void> {

        const noninstalledGames = Constants.SupportedGames
            .filter(g => !this.state.installedGames.includes(g));

        if (noninstalledGames.length === 0) {
            console.log('All supported games are already installed.');
            return;
        }

        const installGameChoices = noninstalledGames.concat(Constants.CancelChoice);
        const questions = [
            {
                type: 'list',
                name: 'game',
                message: 'Which game to install?',
                choices: installGameChoices
            }
        ];

        let answers = await inquirer.prompt(questions);
        const choice = answers['game'] as string;

        if (choice == Constants.CancelChoice) {
            process.exit(0);
        }

        const installer = this.installers.get(choice);

        answers = await inquirer.prompt({
            type: 'confirm',
            name: 'installConfirmation',
            message: `This game will take up ${installer.requiredDiskSpace} of disk space. Continue?`,
            default: false
        });

        if (answers['installConfirmation'] === false) {
            process.exit(0);
        }

        await installer.install();

        await this.state.addInstalledGame(choice);
    }
}