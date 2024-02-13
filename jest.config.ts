import type { Config } from '@jest/types';

export default async (): Promise<Config.InitialOptions> => {
    return {
        verbose: true,
        moduleDirectories: ['<rootDir>/node_modules'],
        modulePathIgnorePatterns: ['<rootDir>/dist/'],
        preset: 'ts-jest',
        testEnvironment: 'node',
        coverageReporters: ['json-summary', 'lcov', 'text', 'text-summary']
        // TODO: Até então não conseguimos fazer funcionar.
        // Mantido aqui caso seja útil no futuro.
        /* transform: {
            '^.+\\.ts$': [
                'ts-jest',
                {
                    tsconfig: 'tsconfig.test.json'
                },
            ]
        } */
    };
};
