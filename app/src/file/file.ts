export default class File {
    private readonly _link: string
    private readonly _filename: string

    constructor(link: string, filename: string) {
        this._link = link;
        this._filename = filename;
    }

    get link(): string {
        return this._link;
    }

    get filename(): string {
        return this._filename;
    }
}
