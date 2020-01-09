import fs = require('fs');
import https = require('https');
import extract = require('extract-zip');
import path = require('path');

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