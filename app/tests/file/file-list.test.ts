import {beforeEach, describe, expect, test} from "@jest/globals";
import FileList from "../../src/file/file-list";
import {mock} from "jest-mock-extended";
import File from "../../src/file/file";

describe(FileList.name, () => {
    let fileList: FileList;

    beforeEach(() => {
        fileList = new FileList();
    })

    test('add/get/length', () => {
        const file1 = mock<File>();
        const file2 = mock<File>();

        fileList.add(file1);
        fileList.add(file2);

        expect(fileList.length).toStrictEqual(2);
        expect(fileList.get(0)).toStrictEqual(file1);
        expect(fileList.get(1)).toStrictEqual(file2);
    })

    test('forEach', () => {
        const file1 = mock<File>();
        const file2 = mock<File>();

        fileList.add(file1);
        fileList.add(file2);

        let files: File[] = [];

        fileList.forEach((file) => {
            files.push(file);
        })

        expect(files.length).toStrictEqual(2);
        expect(files[0]).toStrictEqual(file1);
        expect(files[1]).toStrictEqual(file2);
    })
})
