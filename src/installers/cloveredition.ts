import { InstallerInterface } from '../installer';
import { Spinner } from 'cli-spinner';
import { Constants } from '../constants';
import { State } from '../state';
import { InstallPython, InitVenv } from '../helpers/pythoninstaller';
import * as git from 'isomorphic-git';
import { execFile, spawn } from 'child_process';
import { Torrent } from '../helpers/torrent';

export class CloverEditionInstaller implements InstallerInterface {
    requiredDiskSpace = "TODO";

    private readonly state: State;

    constructor(state: State) {
        this.state = state;
    }

    async install() {
        let spinner = new Spinner(`%s Installing ${Constants.CloverEdition} game files`);
        spinner.start();

        if (!this.state.isPythonInstalled) {

            await InstallPython();
            await this.state.setIsPythonInstalled(true);
        }

        try {
            await git.clone({
                dir: Constants.CloverEditionRepoPath,
                url: 'https://github.com/cloveranon/Clover-Edition.git',
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
            cwd: Constants.CloverEditionRepoPath
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
            cwd: Constants.CloverEditionRepoPath
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

        const installTorch = execFile("./venv/Scripts/pip", ["install", "torch", "-f", "https://download.pytorch.org/whl/torch_stable.html"], {
            cwd: Constants.CloverEditionRepoPath
        });

        if (this.state.isDebug) {
            installTorch.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });
        }

        const installTorchPromise = new Promise((resolve, reject) => {
            installTorch.on('close', resolve);
        });

        await installTorchPromise;

        const installTransformers = execFile("./venv/Scripts/pip", ["install", "transformers"], {
            cwd: Constants.CloverEditionRepoPath
        });

        if (this.state.isDebug) {
            installTransformers.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });
        }

        const installTransformersPromise = new Promise((resolve, reject) => {
            installTransformers.on('close', resolve);
        });

        await installTransformersPromise;

        const installOptionalRequirements = execFile("./venv/Scripts/pip", ["install", "-r", "optional-requirements.txt"], {
            cwd: Constants.CloverEditionRepoPath
        });

        // TODO install colorama

        if (this.state.isDebug) {
            installOptionalRequirements.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });
        }

        const installOptionalRequirementsPromise = new Promise((resolve, reject) => {
            installOptionalRequirements.on('close', resolve);
        });

        await installOptionalRequirementsPromise;

        spinner.stop(true);
        console.log('Completed installing game files.');
        console.log('Downloading AI model...');

        await Torrent(Constants.CloverEditionModelPath, Constants.CloverEditionDefaultModelMagnetLink);
    }
}