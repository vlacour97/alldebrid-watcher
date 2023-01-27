import File from "./file";

export default class FileList {
    private elements: File[];

    constructor (files?: File[]) {
        this.elements = files ?? []
    }

    get length () {
        return this.elements.length
    }

    add (file: File): void {
        this.elements.push(file)
    }

    get (index): File|null {
        return this.elements[index] ?? null
    }

    forEach (callable): void {
        this.elements.forEach(callable)
    }
}
