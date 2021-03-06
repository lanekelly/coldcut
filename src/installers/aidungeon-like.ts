import { InstallerInterface } from '../installer';
import { Spinner } from 'cli-spinner';
import { Constants } from '../constants';
import { State } from '../state';
import { InstallPython } from '../helpers/pythoninstaller';
import * as git from 'isomorphic-git';
import { spawn, execFile } from 'child_process';
import * as fs from 'fs';
import { ModelManager } from '../modelmanager';
import { GameParametersInterface } from '../catalogmanager';

export class AIDungeonLikeInstaller implements InstallerInterface {

    private readonly state: State;
    private readonly modelManager: ModelManager;
    private readonly gameParams: GameParametersInterface;

    constructor(state: State, modelManager: ModelManager, gameParams: GameParametersInterface) {
        this.state = state;
        this.modelManager = modelManager;
        this.gameParams = gameParams;
    }

    get requiredDiskSpace(): string {
        return this.modelManager.isModelInstalled(this.gameParams.Name) ? "1.18 GB" : "6.99 GB";
    }

    async install(): Promise<void> {
        const spinner = new Spinner(`%s Installing ${this.gameParams.Name} game files`);
        spinner.start();

        if (!this.state.isPythonInstalled(Constants.Python376)) {
            await InstallPython(Constants.Python376Nuget, Constants.Python376);
            await this.state.setIsPythonInstalled(Constants.Python376, true);
        }

        try {
            await git.clone({
                dir: this.gameParams.RepoPath,
                url: this.gameParams.RemoteRepoUri,
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
            cwd: this.gameParams.RepoPath
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
            cwd: this.gameParams.RepoPath
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

        const installRequirements = execFile("./venv/Scripts/pip", ["install", "-r", "requirements.txt"], {
            cwd: this.gameParams.RepoPath
        });

        if (this.state.isDebug) {
            installRequirements.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });
        }

        const installRequirementsPromise = new Promise((resolve) => {
            installRequirements.on('close', resolve);
        });

        await installRequirementsPromise;

        await fs.promises.mkdir(this.gameParams.ModelRuntimePath, { recursive: true });

        spinner.stop(true);
        console.log('Completed installing game files.');
        console.log('Downloading AI model...');

        await this.modelManager.initModel(this.gameParams.Name);
    }
}