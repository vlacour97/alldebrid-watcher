import {describe, expect, jest, test} from "@jest/globals";
import appContainer, {ServiceLabel} from "../../../src/dependency-injection/app-container";
import {ServiceParamType} from "../../../src/dependency-injection/param-provider";
import Downloader from "../../../src/downloader/decorator/downloader";
import {DownloaderType} from "../../../src/downloader/downloader-interface";

class Foo {
    public foo1
    public foo2

    constructor(foo1, foo2) {
        this.foo1 = foo1
        this.foo2 = foo2
    }
}

jest.mock('../../../src/dependency-injection/app-container');
describe('Downloader', () => {
    const mockedContainer = appContainer as jest.Mocked<typeof appContainer>;
    let fooImplementation;

    test('Downloader', () => {

        mockedContainer.add.mockImplementation((name, callback, labels) => {
            fooImplementation = callback();

            return mockedContainer;
        })

        Downloader(
            DownloaderType.FILESYSTEM,
            [
                {
                    id: 'foo1_value',
                    type: ServiceParamType.VALUE
                },
                {
                    id: 'foo2_value',
                    type: ServiceParamType.VALUE
                }
            ]
        )(Foo)

        expect(mockedContainer.add).toHaveBeenCalledWith(DownloaderType.FILESYSTEM, expect.any(Function), [ServiceLabel.DOWNLOADER])
        expect(fooImplementation).toBeInstanceOf(Foo);
        expect(fooImplementation.foo1).toEqual('foo1_value');
        expect(fooImplementation.foo2).toEqual('foo2_value');
    })
})
