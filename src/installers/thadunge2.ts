import { InstallerInterface } from '../installer';
import { Spinner } from 'cli-spinner';
import { Constants } from '../constants';
import { State } from '../state';
import { InstallPython } from '../helpers/pythoninstaller';
import * as git from 'isomorphic-git';
import { spawn, execFile } from 'child_process';
import * as fs from 'fs';
import { Torrent } from '../helpers/torrent';

export class ThaDunge2Installer implements InstallerInterface {
    requiredDiskSpace = "6.99 GB";

    private readonly state: State;

    constructor(state: State) {
        this.state = state;
    }

    async install() {
        let spinner = new Spinner(`%s Installing ${Constants.thadunge2} game files`);
        spinner.start();

        if (!this.state.isPythonInstalled) {

            await InstallPython();
            await this.state.setIsPythonInstalled(true);
        }

        try {
            await git.clone({
                dir: Constants.thadunge2RepoPath,
                url: 'https://github.com/thadunge2/AIDungeon.git',
                ref: 'master',
                singleBranch: true,
                depth: 1,
                noSubmodules: true
            });
        } catch (err) {
            console.log(err);
            process.exit(1);
        }


        const makeVenv = spawn('../../python/tools/python.exe', ['-m', 'venv', 'venv'], {
            cwd: Constants.thadunge2RepoPath
        });

        if (this.state.isDebug) {
            makeVenv.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });
        }

        const makeVenvPromise = new Promise((resolve, reject) => {
            makeVenv.on('close', resolve);
        });

        await makeVenvPromise;

        const upgradePip = execFile("./venv/Scripts/pip", ["install", "--upgrade", "pip", "setuptools", "--user"], {
            cwd: Constants.thadunge2RepoPath
        });

        if (this.state.isDebug) {
            upgradePip.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });
        }

        const upgradePipPromise = new Promise((resolve, reject) => {
            upgradePip.on('close', resolve);
        });

        await upgradePipPromise;

        const installRequirements = execFile("./venv/Scripts/pip", ["install", "-r", "requirements.txt"], {
            cwd: Constants.thadunge2RepoPath
        });

        if (this.state.isDebug) {
            installRequirements.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });
        }

        const installRequirementsPromise = new Promise((resolve, reject) => {
            installRequirements.on('close', resolve);
        });

        await installRequirementsPromise;

        await fs.promises.mkdir(Constants.thadunge2ModelPath, { recursive: true });

        spinner.stop(true);
        console.log('Completed installing game files.');
        console.log('Downloading AI model...');

        await Torrent(Constants.thadunge2ModelPath, Constants.AIDungeonDefaultModelMagnetLink);
    }
}