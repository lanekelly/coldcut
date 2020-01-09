import { Constants } from '../constants';
import * as git from 'isomorphic-git';
import { spawn, execFile } from "child_process";
import fs = require('fs');
import { State } from '../state';
import { Spinner } from 'cli-spinner';
import { InstallerInterface } from '../installer';
import { InstallPython } from '../helpers/pythoninstaller';
import { Torrent } from '../helpers/torrent';

export class AIDungeonInstaller implements InstallerInterface {
    requiredDiskSpace = "6.99 GB";

    private readonly state: State;

    constructor(state: State) {
        this.state = state;
    }

    async install() {

        let spinner = new Spinner('%s Installing AIDungeon game files');
        spinner.start();

        if (!this.state.isPythonInstalled) {

            await InstallPython();
            await this.state.setIsPythonInstalled(true);
        }

        await git.clone({
            dir: Constants.AIDungeonRepoPath,
            url: "https://github.com/AIDungeon/AIDungeon",
            ref: 'master',
            singleBranch: true,
            depth: 1,
            noSubmodules: true
        });

        const makeVenv = spawn('../../python/tools/python.exe', ['-m', 'venv', 'venv'], {
            cwd: Constants.AIDungeonRepoPath
        });

        // TODO - add debug flag and emit stderr

        // makeVenv.stderr.on('data', (data) => {
        //     console.error(`stderr: ${data}`);
        // });

        const makeVenvPromise = new Promise((resolve, reject) => {
            makeVenv.on('close', resolve);
        });

        await makeVenvPromise;

        const upgradePip = execFile("./venv/Scripts/pip", ["install", "--upgrade", "pip", "setuptools", "--user"], {
            cwd: Constants.AIDungeonRepoPath
        });

        // upgradePip.stderr.on('data', (data) => {
        //     console.error(`stderr: ${data}`);
        // });

        const upgradePipPromise = new Promise((resolve, reject) => {
            upgradePip.on('close', resolve);
        });

        await upgradePipPromise;

        const installRequirements = execFile("./venv/Scripts/pip", ["install", "-r", "requirements.txt"], {
            cwd: Constants.AIDungeonRepoPath
        });

        // installRequirements.stderr.on('data', (data) => {
        //     console.error(`stderr: ${data}`);
        // });

        const installRequirementsPromise = new Promise((resolve, reject) => {
            installRequirements.on('close', resolve);
        });

        await installRequirementsPromise;

        await fs.promises.mkdir(Constants.AIDungeonModelPath, { recursive: true });

        spinner.stop(true);
        console.log('Completed installing game files.');
        console.log('Downloading AI model...');

        await Torrent(Constants.AIDungeonModelPath, Constants.AIDungeonDefaultModelMagnetLink);
    }
}