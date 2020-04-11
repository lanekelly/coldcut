import { InstallerInterface } from '../installer';
import { Spinner } from 'cli-spinner';
import { Constants } from '../constants';
import { State } from '../state';
import { InstallPython } from '../helpers/pythoninstaller';
import * as git from 'isomorphic-git';
import { execFile, spawn } from 'child_process';
import { ModelManager } from '../modelmanager';

export class CloverEditionInstaller implements InstallerInterface {
    requiredDiskSpace = "7.26 GB";

    private readonly state: State;
    private readonly modelManager: ModelManager;

    constructor(state: State, modelManager: ModelManager) {
        this.state = state;
        this.modelManager = modelManager;
    }

    async install(): Promise<void> {
        const spinner = new Spinner(`%s Installing ${Constants.CloverEdition} game files`);
        spinner.start();

        if (!this.state.isPythonInstalled(Constants.Python376)) {

            await InstallPython(Constants.Python376Nuget, Constants.Python376);
            await this.state.setIsPythonInstalled(Constants.Python376, true);
        }

        try {
            await git.clone({
                dir: Constants.CloverEditionRepoPath,
                url: Constants.CloverEditionRemoteRepoUri,
                ref: 'master',
                singleBranch: true,
                depth: 1,
                noSubmodules: true
            });
        } catch (err) {
            console.log(err);
            process.exit(1);
        }

        const makeVenv = spawn(`../../${Constants.Python376}/tools/python.exe`, ['-m', 'venv', 'venv'], {
            cwd: Constants.CloverEditionRepoPath
        });

        if (this.state.isDebug) {
            makeVenv.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });
        }

        const makeVenvPromise = new Promise((resolve) => {
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

        const upgradePipPromise = new Promise((resolve) => {
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

        const installTorchPromise = new Promise((resolve) => {
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

        const installTransformersPromise = new Promise((resolve) => {
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

        const installOptionalRequirementsPromise = new Promise((resolve) => {
            installOptionalRequirements.on('close', resolve);
        });

        await installOptionalRequirementsPromise;

        const colorama = execFile("./venv/Scripts/pip", ["install", "colorama"], {
            cwd: Constants.CloverEditionRepoPath
        });

        if (this.state.isDebug) {
            colorama.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });
        }

        const coloramaPromise = new Promise((resolve) => {
            colorama.on('close', resolve);
        });

        await coloramaPromise;

        spinner.stop(true);
        console.log('Completed installing game files.');
        console.log('Downloading AI model...');

        await this.modelManager.initModel(Constants.CloverEdition);
    }
}