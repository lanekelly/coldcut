import fs = require('fs');
import https = require('https');
import extract = require('extract-zip');
import path = require('path');
import { spawn, execFile } from 'child_process';

export async function InstallPython(pythonNupkgFileName: string, pythonInstallDirName: string): Promise<void> {

    const downloadPythonPromise = new Promise((resolve) => {
        const file = fs.createWriteStream(pythonNupkgFileName);
        https.get(`https://globalcdn.nuget.org/packages/${pythonNupkgFileName}`, function(response) {
            response.pipe(file).on('finish', resolve);
        });
    })

    await downloadPythonPromise;

    const extractPythonPromise = new Promise((resolve) => {
        extract(pythonNupkgFileName, { dir: path.resolve(process.cwd(), `system/${pythonInstallDirName}`) }, resolve);
    });

    await extractPythonPromise;

    await fs.promises.unlink(pythonNupkgFileName);
}

export async function InitVenv(cwd: string, isDebug: boolean): Promise<void> {
    const makeVenv = spawn('../../python/tools/python.exe', ['-m', 'venv', 'venv'], {
        cwd: cwd
    });

    if (isDebug) {
        makeVenv.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
    }

    const makeVenvPromise = new Promise((resolve) => {
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

    const upgradePipPromise = new Promise((resolve) => {
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

    const installRequirementsPromise = new Promise((resolve) => {
        installRequirements.on('close', resolve);
    });

    await installRequirementsPromise;
}