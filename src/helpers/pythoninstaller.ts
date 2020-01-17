import fs = require('fs');
import https = require('https');
import extract = require('extract-zip');
import path = require('path');
import { spawn, execFile } from 'child_process';

export async function InstallPython() {
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
}

export async function InitVenv(cwd: string, isDebug: boolean) {
    const makeVenv = spawn('../../python/tools/python.exe', ['-m', 'venv', 'venv'], {
        cwd: cwd
    });

    if (isDebug) {
        makeVenv.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
    }

    const makeVenvPromise = new Promise((resolve, reject) => {
        makeVenv.on('close', resolve);
    });

    await makeVenvPromise;

    const upgradePip = execFile("./venv/Scripts/pip", ["install", "--upgrade", "pip", "setuptools", "--user"], {
        cwd: cwd
    });

    if (isDebug) {
        upgradePip.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
    }

    const upgradePipPromise = new Promise((resolve, reject) => {
        upgradePip.on('close', resolve);
    });

    await upgradePipPromise;

    const installRequirements = execFile("./venv/Scripts/pip", ["install", "-r", "requirements.txt"], {
        cwd: cwd
    });

    if (isDebug) {
        installRequirements.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
    }

    const installRequirementsPromise = new Promise((resolve, reject) => {
        installRequirements.on('close', resolve);
    });

    await installRequirementsPromise;
}