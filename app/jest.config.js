/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    coverageReporters: ['html', 'cobertura']
    /*coverageThreshold: {
        global: {
            lines: 80,
        },
    },*/
};