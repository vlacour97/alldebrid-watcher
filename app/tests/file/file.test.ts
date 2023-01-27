import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import File from "../../src/file/file";

describe(File.name, () => {
    let file: File;

    beforeEach(() => {
        file = new File('link', 'filename')
    })

    test('getters', () => {
        expect(file.link).toEqual('link');
        expect(file.filename).toEqual('filename');
    })
})
