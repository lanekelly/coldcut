import { InstallerInterface } from '../installer';
import { Spinner } from 'cli-spinner';
import { Constants } from '../constants';
import { State } from '../state';
import { InstallPython } from '../helpers/pythoninstaller';
import { spawn, execFile } from 'child_process';
import * as fs from 'fs';
import { ModelManager } from '../modelmanager';
import { GameParametersInterface } from '../catalogmanager';

export class StorybroInstaller implements InstallerInterface {

    private readonly state: State;
    private readonly modelManager: ModelManager;
    private readonly gameParams: GameParametersInterface;

    constructor(state: State, modelManager: ModelManager, gameParams: GameParametersInterface) {
        this.state = state;
        this.modelManager = modelManager;
        this.gameParams = gameParams;
    }

    get requiredDiskSpace(): string {
        return this.modelManager.isModelInstalled(this.gameParams.Name) ? "1.19 GB" : "7.01 GB";
    }

    async install(): Promise<void> {
        const spinner = new Spinner(`%s Installing ${this.gameParams.Name} game files`);
        spinner.start();

        if (!this.state.isPythonInstalled(Constants.Python368)) {
            await InstallPython(Constants.Python368Nuget, Constants.Python368);
            await this.state.setIsPythonInstalled(Constants.Python368, true);
        }

        await fs.promises.mkdir(this.gameParams.RepoPath, { recursive: true });

        const makeVenv = spawn(`../../${Constants.Python368}/tools/python.exe`, ['-m', 'venv', 'venv'], {
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

        const installRequirements = execFile("./venv/Scripts/pip", ["install", "storybro"], {
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
        await fs.promises.mkdir(`${Constants.StorybroRepoPath}/grammars`);
        await fs.promises.mkdir(`${Constants.StorybroRepoPath}/stories`);

        const configString = "models_path=\"models\"\nstories_path=\"stories\"\ngrammars_path=\"grammars\"";

        await fs.promises.writeFile(`${Constants.StorybroRepoPath}/cc.config`, configString);

        spinner.stop(true);
        console.log('Completed installing game files.');
        console.log('Downloading AI model...');

        await this.modelManager.initModel(this.gameParams.Name);
    }
}