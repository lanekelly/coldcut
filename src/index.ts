import commander = require('commander');
import storage = require('node-persist');
import inquirer = require('inquirer');
import * as git from 'isomorphic-git';
import fs = require('fs');
import WebTorrent = require("webtorrent");
import * as cliProgress from 'cli-progress';
import { spawn, execFile, exec } from 'child_process';
import { Spinner } from 'cli-spinner';
import extract = require('extract-zip');
import path = require('path');
import https = require('https');

git.plugins.set('fs', fs);

commander
    .command('run [game]')
    .description('Play a game.')
    .action(function (game) {
        console.log("This command doesn't work yet!");
    });

commander
    .command('install [game]')
    .description('Install a game.')
    .action(function (game) {
        if (!game) {
            console.log("No game detected.");
        }
        console.log("This command doesn't work yet!");
    });

const WelcomeText = 'Welcome to coldcut, the installer for AI text adventure games.';

const InstalledGamesKey = 'installedGames';
const IsPythonInstalledKey = "isPythonInstalled";

const SupportedGames = [
    'AIDungeon'
];

const AIDungeonRepoPath = './system/repos/AIDungeon';

async function main() {

    await storage.init({
        dir: 'system/internal-storage'
    });

    const storageKeys = await storage.keys();

    let installedGames: string[] = [];
    let isPythonInstalled = false;
    if (storageKeys.includes(InstalledGamesKey)) {
        installedGames = await storage.getItem(InstalledGamesKey);
    }

    if (storageKeys.includes(IsPythonInstalledKey)) {
        isPythonInstalled = await storage.getItem(IsPythonInstalledKey);
    }

    commander.parse(process.argv);

    if (process.argv.length === 2) {
        console.log(WelcomeText);

        if (installedGames.length === 0) {
            console.log('No installations detected.');

            let installGameChoices = SupportedGames.concat('(Cancel)');
            let questions = [
                {
                    type: 'list',
                    name: 'game',
                    message: 'Which game to install?',
                    choices: installGameChoices
                }
            ];

            let answers = await inquirer.prompt(questions);
            if (answers['game'] == "(Cancel)") {
                process.exit(0);
            }

            if (answers['game'] == 'AIDungeon') {
                answers = await inquirer.prompt({
                    type: 'confirm',
                    name: 'installConfirmation',
                    message: 'This game will take up 6.99 GB of disk space. Continue?',
                    default: false
                });
            }

            if (answers['installConfirmation'] === false) {
                process.exit(0);
            }

            let spinner = new Spinner('%s Installing AIDungeon game files');
            spinner.start();

            if (!isPythonInstalled) {

                const pythonNupkgFileName = 'python.3.7.6.nupkg';

                let downloadPythonPromise = new Promise((resolve, reject) => {
                    const file = fs.createWriteStream(pythonNupkgFileName);
                    const request = https.get("https://globalcdn.nuget.org/packages/python.3.7.6.nupkg", function(response) {
                      response.pipe(file).on('finish', resolve);
                    });
                })

                await downloadPythonPromise;

                let extractPythonPromise = new Promise((resolve, reject) => {
                    extract(pythonNupkgFileName, { dir: path.resolve(process.cwd(), 'system/python') }, resolve);
                });

                await extractPythonPromise;

                await fs.promises.unlink(pythonNupkgFileName);

                await storage.setItem(IsPythonInstalledKey, true);
            }

            const AIDungeonModelPath = './system/repos/AIDungeon/generator/gpt2/models';

            await git.clone({
                dir: AIDungeonRepoPath,
                url: "https://github.com/AIDungeon/AIDungeon",
                ref: 'master',
                singleBranch: true,
                depth: 1,
                noSubmodules: true
            });

            const makeVenv = spawn('../../python/tools/python.exe', ['-m', 'venv', 'venv'], {
                cwd: AIDungeonRepoPath
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
                cwd: AIDungeonRepoPath
            });

            // upgradePip.stderr.on('data', (data) => {
            //     console.error(`stderr: ${data}`);
            // });

            const upgradePipPromise = new Promise((resolve, reject) => {
                upgradePip.on('close', resolve);
            });

            await upgradePipPromise;

            const installRequirements = execFile("./venv/Scripts/pip", ["install", "-r", "requirements.txt"], {
                cwd: AIDungeonRepoPath
            });

            // installRequirements.stderr.on('data', (data) => {
            //     console.error(`stderr: ${data}`);
            // });

            const installRequirementsPromise = new Promise((resolve, reject) => {
                installRequirements.on('close', resolve);
            });

            await installRequirementsPromise;

            await fs.promises.mkdir(AIDungeonModelPath, { recursive: true });

            spinner.stop(true);
            console.log('Completed installing game files.');
            console.log('Downloading AI model...');

            const torrentClient = new WebTorrent();
            const torrentId = "magnet:?xt=urn:btih:b343b83b35bff774dab13e0281ce13b3daf37d3e&dn=model_v5";

            const progressBar = new cliProgress.SingleBar({
                hideCursor: true,
                format: '{bar} {percentage}% | {value}/{total}'
            }, cliProgress.Presets.shades_classic);

            let torrent = torrentClient.add(torrentId, {
                path: AIDungeonModelPath
            });

            // TODO -- need to get rid of EventEmitter issues.
            torrent.setMaxListeners(Infinity);

            torrent.on('metadata', () => {
                progressBar.start(torrent.length, torrent.downloaded);

            });

            torrent.on('download', (bytes) => {
                progressBar.update(torrent.downloaded);

            });

            let torrentDonePromise = new Promise((resolve, reject) => {
                torrent.on('done', () => {
                    progressBar.stop();

                    torrentClient.destroy();

                    resolve();
                });
            });

            await torrentDonePromise;

            installedGames.push('AIDungeon');
            await storage.setItem(InstalledGamesKey, installedGames);

            console.log("\nDone installing! Run coldcut again to play.");
        } else {

            let runGameChoices = installedGames.concat(['(Cancel)']);
            let questions = [
                {
                    type: 'list',
                    name: 'game',
                    message: 'Select a game to run.',
                    choices: runGameChoices
                }
            ];

            let answers = await inquirer.prompt(questions);
            if (answers['game'] == "(Cancel)") {
                process.exit(0);
            }

            if (answers['game'] == 'AIDungeon') {
                exec("start cmd.exe /K \".\\venv\\Scripts\\python play.py\"", {
                    cwd: AIDungeonRepoPath
                });
            }
        }
    }
}

function caseInsensitiveEquals(a: string, b: string) {
    return (a.localeCompare(b, undefined, { sensitivity: 'base'}) === 0);
}

main();