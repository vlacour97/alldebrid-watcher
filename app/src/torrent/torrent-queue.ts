import TorrentList from "./torrent-list";
import Torrent from "./torrent";

export default class TorrentQueue {
    private readonly outputSize: number;
    private elements: TorrentList = new TorrentList();

    push (torrents: TorrentList) {
        torrents.forEach(this.elements.add.bind(this.elements))
    }

    pull () {
        const torrent = this.elements.get(0)

        this.evacuate(torrent);

        return torrent;
    }

    evacuate (torrent: Torrent) {
        this.elements.removeByTorrent(torrent)
    }
}
