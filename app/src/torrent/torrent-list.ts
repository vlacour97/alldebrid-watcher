import Torrent from "./torrent";

export default class TorrentList {
    private elements: Torrent[];

    constructor (torrents?: Torrent[]) {
        this.elements = torrents ?? []
    }

    get length () {
        return this.elements.length
    }

    add (torrent: Torrent): void {
        this.elements.push(torrent)
    }

    get (index): Torrent|null {
        return this.elements[index] ?? null
    }

    forEach (callable): void {
        this.elements.forEach(callable)
    }

    removeByTorrent (torrent: Torrent) {
        this.elements = this.elements.filter((value: Torrent) => { return torrent !== value })
    }
}
