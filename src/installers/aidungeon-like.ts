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

    get requiredDiskSpace() {
        return this.modelManager.isModelInstalled(this.gameParams.Name) ? "1.18 GB" : "6.99 GB";
    }

    async install() {
        let spinner = new Spinner(`%s Installing ${this.gameParams.Name} game files`);
        spinner.start();

        if (!this.state.isPythonInstalled) {

            await InstallPython();
            await this.state.setIsPythonInstalled(true);
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

        const makeVenv = spawn('../../python/tools/python.exe', ['-m', 'venv', 'venv'], {
            cwd: this.gameParams.RepoPath
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
            cwd: this.gameParams.RepoPath
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
            cwd: this.gameParams.RepoPath
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

        await fs.promises.mkdir(this.gameParams.ModelRuntimePath, { recursive: true });

        spinner.stop(true);
        console.log('Completed installing game files.');
        console.log('Downloading AI model...');

        await this.modelManager.initModel(this.gameParams.Name);
    }
}