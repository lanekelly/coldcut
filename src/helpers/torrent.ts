import WebTorrent = require("webtorrent");
import * as cliProgress from 'cli-progress';

export async function Torrent(destinationPath: string, magnetLink: string): Promise<void> {
    const torrentClient = new WebTorrent();
    const torrentId = magnetLink;

    const progressBar = new cliProgress.SingleBar({
        hideCursor: true,
        format: '{bar} {percentage}% | {value}/{total}'
    }, cliProgress.Presets.shades_classic);

    const torrent = torrentClient.add(torrentId, {
        path: destinationPath
    });

    torrent.setMaxListeners(Infinity);

    torrent.on('metadata', () => {
        progressBar.start(torrent.length, torrent.downloaded);

    });

    torrent.on('download', () => {
        progressBar.update(torrent.downloaded);

    });

    const torrentDonePromise = new Promise((resolve) => {
        torrent.on('done', () => {
            progressBar.stop();

            torrentClient.destroy();

            resolve();
        });
    });

    await torrentDonePromise;
}
