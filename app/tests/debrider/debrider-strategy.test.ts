import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import DebriderStrategy from "../../src/debrider/debrider-strategy";
import Container from "../../src/dependency-injection/container";
import {mock} from "jest-mock-extended";
import DebriderInterface from "../../src/debrider/debrider-interface";
import Torrent from "../../src/torrent/torrent";

describe(DebriderStrategy.name, () => {
    let container: Container;
    let debrider: DebriderStrategy;

    beforeEach(() => {
        container = mock<Container>();
        debrider = new DebriderStrategy('toto', container)
    })

    test('initialize', () => {
        const subDebrider: DebriderInterface = mock<DebriderInterface>();

        jest.spyOn(container, 'get').mockReturnValue(subDebrider)

        debrider.initialize();

        expect(container.get).toHaveBeenCalledWith('toto');
        expect(subDebrider.initialize).toHaveBeenCalled()
    })

    test('getDebridedFiles', () => {
        const subDebrider: DebriderInterface = mock<DebriderInterface>();
        const torrent: Torrent = mock<Torrent>();

        jest.spyOn(container, 'get').mockReturnValue(subDebrider)

        debrider.getDebridedFiles(torrent);

        expect(container.get).toHaveBeenCalledWith('toto');
        expect(subDebrider.getDebridedFiles).toHaveBeenCalledWith(torrent)
    })

    test('close', () => {
        const subDebrider: DebriderInterface = mock<DebriderInterface>();

        jest.spyOn(container, 'get').mockReturnValue(subDebrider)

        debrider.close();

        expect(container.get).toHaveBeenCalledWith('toto');
        expect(subDebrider.close).toHaveBeenCalled()
    })
})
