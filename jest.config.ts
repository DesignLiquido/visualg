import type { Config } from '@jest/types';

export default async (): Promise<Config.InitialOptions> => {
    return {
        verbose: true,
        moduleDirectories: ['<rootDir>/node_modules'],
        modulePathIgnorePatterns: ['<rootDir>/dist/'],
        preset: 'ts-jest',
        testEnvironment: 'node',
        coverageReporters: ['json-summary', 'lcov', 'text', 'text-summary'],
        moduleNameMapper: {
            // Se for utilizar módulos linkados, comentar a linha abaixo:
            '@designliquido/delegua/(.*)': '<rootDir>/node_modules/@designliquido/delegua/$1'
            // E descomentar a linha abaixo:
            // '@designliquido/delegua/(.*)': '<rootDir>/node_modules/@designliquido/delegua/fontes/$1'
        },
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
