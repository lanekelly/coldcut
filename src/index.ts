import { Clone, Repository, CloneOptions } from "nodegit";

import { spawn, spawnSync, execFile }  from "child_process";
import WebTorrent = require("webtorrent");
import fs = require("fs");
import path = require('path');
import pty = require('node-pty');
import storage = require('node-persist');

async function main() {
    await storage.init({
        dir: 'system'
    });

    console.log("initialized system storage");

    const keys = await storage.keys();

    let needsInstallation = true;
    if (keys.includes('hasCompleteInstallation')) {
        let hasCompleteInstallation = await storage.getItem('hasCompleteInstallation');
        needsInstallation = !hasCompleteInstallation;

        spawnGame();
    }

    if (needsInstallation) {
        // TODO - may be a bit faster if depth=1
        // TODO - always checkout specific commit to guarantee it's functional
        let firstRepo: Promise<void> = Clone.clone("https://github.com/AIDungeon/AIDungeon", "./repos/AIDungeon")
        .then(function (repo: Repository) {
            console.log("done downloading AI Dungeon");
        })
        .catch(function (reason) {
            console.log("error cloning AIDungeon", JSON.stringify(reason))
        });

        let secondRepo: Promise<void> = Clone.clone("https://github.com/thadunge2/AIDungeon.git", "./repos/thadunge2").then(function (repo: Repository) {
            console.log("done downloading ThaDunge2");
        })
        .catch(function (reason) {
            console.log("error cloning ThaDunge2", JSON.stringify(reason))
        });

        Promise.all([firstRepo, secondRepo]).then(function () {
            console.log("both repos finished clone operation");
        
            // python -m venv tutorial_env
            const ls = spawn('python', ['-m', 'venv', 'venv'], {
                cwd: "./repos/AIDungeon"
            });

            ls.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
            });
            
            ls.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
            });
            
            ls.on('close', (code) => {
            console.log(`child process exited with code ${code}`);

            // install --upgrade pip setuptools
            const pip1 = execFile("./venv/bin/pip", ["install", "--upgrade", "pip", "setuptools"], {
                cwd: "./repos/AIDungeon"
            });

            pip1.on('close', (code) => {
                console.log(`child process exited with code ${code}`);

                // install -r "${BASE_DIR}/requirements.txt"
                const pip2 = execFile("./venv/bin/pip", ["install", "-r", "requirements.txt"], {
                    cwd: "./repos/AIDungeon"
                });

                pip2.on('close', (code) => {
                    console.log(`child process exited with code ${code}`);

                    // start torrent
                    const client = new WebTorrent();

                    const torrentId = "magnet:?xt=urn:btih:b343b83b35bff774dab13e0281ce13b3daf37d3e&dn=model_v5";

                    let torrent = client.add(torrentId, {
                        path: "./models/default"
                    });

                    torrent.on('ready', function () {
                        console.log("torrent: ready");
                    });

                    torrent.on('warning', function (err) {
                        console.log("torrent: warning", JSON.stringify(err));
                    });

                    torrent.on('error', function (err) {
                        console.log("torrent: error", JSON.stringify(err));
                    });

                    torrent.on('done', function () {
                        console.log("torrent: done");

                        client.destroy(function () {
                            console.log("closing client");

                            fs.mkdir('./repos/AIDungeon/generator/gpt2/models', { recursive: true }, (err) => {
                                if (err) throw err;

                                console.log("created models dir");

                                let destinationLink = path.resolve(__dirname, '../models/default/model_v5');
                                fs.symlink(destinationLink, "./repos/AIDungeon/generator/gpt2/models/model_v5", (err) => {
                                    if (err) {
                                        if (err.code === 'EEXIST') {
                                            console.log("symlink already present");
                                        } else {
                                            throw err;
                                        }
                                    } 

                                    console.log("created symlink for model_v5");

                                    storage.setItem('hasCompleteInstallation', true).then(function (result) {
                                        console.log("updated system storage to mark complete installation");

                                        spawnGame();
                                    });
                                });
                            });
                        });
                    });

                    let downloadStatsRateLimiter = 0;
                    const interval = 100;
                    torrent.on('download', function (bytes) {
                        if (downloadStatsRateLimiter > interval) {
                            console.log('just downloaded:', bytes, '| total downloaded:', torrent.downloaded, '| speed:', torrent.downloadSpeed, '| progress:', torrent.progress * 100 + "%");

                            downloadStatsRateLimiter = 0;
                        }
                        
                        downloadStatsRateLimiter++;
                    });

                    torrent.on('upload', function (bytes) {
                        console.log("torrent: upload", JSON.stringify(bytes));
                    });
                });
            });
            });
        });
    }
}

function spawnGame() {
    var ptyProcess = pty.spawn("./venv/bin/python", ['play.py'], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: "./repos/AIDungeon",
        env: process.env
    });

    process.stdin.on('data', function (data: any) {
        ptyProcess.write(data);
    });
    
    ptyProcess.on('data', function(data: any) {
        process.stdout.write(data);
    });

    ptyProcess.on('exit', function(exitCode: number, signal?: number) {
        console.log("exiting", exitCode, signal);
        process.exit();
    });
}

main();