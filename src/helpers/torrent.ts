import WebTorrent = require("webtorrent");
import * as cliProgress from 'cli-progress';

export async function Torrent(destinationPath: string, magnetLink: string) {
    const torrentClient = new WebTorrent();
    const torrentId = magnetLink;

    const progressBar = new cliProgress.SingleBar({
        hideCursor: true,
        format: '{bar} {percentage}% | {value}/{total}'
    }, cliProgress.Presets.shades_classic);

    let torrent = torrentClient.add(torrentId, {
        path: destinationPath
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
}
