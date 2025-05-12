import { DeleguaFuncao } from '@designliquido/delegua/interpretador/estruturas';
import { InterpretadorInterface, SimboloInterface, VariavelInterface } from '@designliquido/delegua/interfaces';
import { EscopoExecucao } from '@designliquido/delegua/interfaces/escopo-execucao';
import { PilhaEscoposExecucaoInterface } from '@designliquido/delegua/interfaces/pilha-escopos-execucao-interface';

import { InterpretadorVisuAlg } from '../fontes/interpretador';
import { AvaliadorSintaticoVisuAlg } from '../fontes/avaliador-sintatico';
import { 
    carregarBibliotecaGlobalCaracter, 
    carregarBibliotecaGlobalNumerica 
} from '../fontes/interpretador/comum';
import { LexadorVisuAlg } from "../fontes/lexador";

const funcoes: {[nome: string]: { funcao: (interpretador: InterpretadorInterface, ...argumentos: any[]) => Promise<any> }} = {};
const mockPilha: PilhaEscoposExecucaoInterface | any = {
    atribuirVariavel: function (simbolo: SimboloInterface, valor: any): void {
        throw new Error('Função não implementada.');
    },

    atribuirVariavelEm: function (distancia: number, simbolo: SimboloInterface, valor: any): void {
        throw new Error('Função não implementada.');
    },

    definirVariavel: function (nomeVariavel: string, valor: any): void {
        funcoes[nomeVariavel] = valor;
    },

    definirConstante: function (nomeConstante: string, valor: any, subtipo?: string | undefined): void {
        funcoes[nomeConstante] = valor;
    },

    elementos: function (): number {
        throw new Error('Função não implementada.');
    },

    naPosicao: function (posicao: number): EscopoExecucao {
        throw new Error('Função não implementada.');
    },

    obterEscopoPorTipo: function (idChamada: string): EscopoExecucao | undefined {
        throw new Error('Função não implementada.');
    },

    obterTodasVariaveis: function (todasVariaveis: any[]): { valor: any; nome: string; tipo: string; }[] {
        throw new Error('Função não implementada.');
    },

    obterValorVariavel: function (simbolo: SimboloInterface): VariavelInterface {
        throw new Error('Função não implementada.');
    },

    obterVariavelEm: function (distancia: number, nome: string): VariavelInterface {
        throw new Error('Função não implementada.');
    },

    obterVariavelPorNome: function (nome: string): VariavelInterface {
        throw new Error('Função não implementada.');
    },

    obterTodasDeclaracaoClasse: function () {
        throw new Error('Função não implementada.');
    },

    obterTodasDeleguaFuncao: function (): { [nome: string]: DeleguaFuncao; } {
        throw new Error('Função não implementada.');
    },

    pilha: [],

    empilhar: function (item: EscopoExecucao): void {
        throw new Error('Função não implementada.');
    },

    eVazio: function (): boolean {
        throw new Error('Função não implementada.');
    },

    topoDaPilha: function (): EscopoExecucao {
        throw new Error('Função não implementada.');
    },

    removerUltimo: function (): EscopoExecucao {
        throw new Error('Função não implementada.');
    },
};

describe('Biblioteca Numérica', () => {
    let interpretador: InterpretadorVisuAlg;

    beforeAll(() => {
        carregarBibliotecaGlobalNumerica(mockPilha);
    });

    describe('Testes triviais', () => {
        it('abs', async () => {
            const funcaoAbs = funcoes['abs'].funcao;
            expect(await funcaoAbs({} as InterpretadorInterface, -5)).toBe(5);
        });

        it('arcCos', async () => {
            const funcaoArcCos = funcoes['arccos'].funcao;
            expect(await funcaoArcCos({} as InterpretadorInterface, 0)).toBe(1.5707963267948966);
        });

        it('arcSen', async () => {
            const funcaoArcSen = funcoes['arcsen'].funcao;
            expect(await funcaoArcSen({} as InterpretadorInterface, 0)).toBe(0);
        });

        it('arcTan', async () => {
            const funcaoArcTan = funcoes['arctan'].funcao;
            expect(await funcaoArcTan({} as InterpretadorInterface, 0)).toBe(0);
        });

        it('cos', async () => {
            const funcaoCos = funcoes['cos'].funcao;
            expect(await funcaoCos({} as InterpretadorInterface, 0)).toBe(1);
        });

        it('cotan', async () => {
            const funcaoCoTan = funcoes['cotan'].funcao;
            expect(await funcaoCoTan({} as InterpretadorInterface, 1)).toBe(0.6420926159343306);
        });

        it('exp', async () => {
            const funcaoExp = funcoes['exp'].funcao;
            expect(await funcaoExp({} as InterpretadorInterface, 10, 2)).toBe(100);
        });

        it('grauprad', async () => {
            const funcaoGrauPRad = funcoes['grauprad'].funcao;
            expect(await funcaoGrauPRad({} as InterpretadorInterface, 0)).toBe(0);
        });

        it('int', async () => {
            const funcaoInt = funcoes['int'].funcao;
            expect(await funcaoInt({} as InterpretadorInterface, '0')).toBe(0);
        });

        it('log', async () => {
            const funcaoLog = funcoes['log'].funcao;
            expect(await funcaoLog({} as InterpretadorInterface, 100)).toBe(2);
        });

        it('logn', async () => {
            const funcaoLogN = funcoes['logn'].funcao;
            expect(await funcaoLogN({} as InterpretadorInterface, Math.E)).toBe(1);
        });

        it('pi', async () => {
            const funcaoPi = funcoes['pi'].funcao;
            expect(await funcaoPi({} as InterpretadorInterface)).toBe(3.141592653589793);
        });

        it('quad', async () => {
            const funcaoQuad = funcoes['quad'].funcao;
            expect(await funcaoQuad({} as InterpretadorInterface, 0)).toBe(0);
        });

        it('radpgrau', async () => {
            const funcaoRadPGrau = funcoes['radpgrau'].funcao;
            expect(await funcaoRadPGrau({} as InterpretadorInterface, 0)).toBe(0);
        });

        it('raizq', async () => {
            const funcaoRaizQ = funcoes['raizq'].funcao;
            expect(await funcaoRaizQ({} as InterpretadorInterface, 0)).toBe(0);
        });

        it('rand', async () => {
            const funcaoRand = funcoes['rand'].funcao;
            expect(await funcaoRand({} as InterpretadorInterface)).toBeGreaterThanOrEqual(0);
            expect(await funcaoRand({} as InterpretadorInterface)).toBeLessThanOrEqual(1);
        });

        it('randi', async () => {
            const funcaoRandI = funcoes['randi'].funcao;
            const resultado = await funcaoRandI({} as InterpretadorInterface, 15);
            expect(resultado).toBeGreaterThanOrEqual(0);
        });

        it('sen', async () => {
            const funcaoSen = funcoes['sen'].funcao;
            expect(await funcaoSen({} as InterpretadorInterface, 0)).toBe(0);
        });

        it('tan', async () => {
            const funcaoTan = funcoes['tan'].funcao;
            expect(await funcaoTan({} as InterpretadorInterface, 0)).toBe(0);
        });
    });

    describe('Testes com fonte completo', () => {
        let lexador: LexadorVisuAlg;
        let avaliadorSintatico: AvaliadorSintaticoVisuAlg;
        let interpretador: InterpretadorVisuAlg;

        beforeEach(() => {
            lexador = new LexadorVisuAlg();
            avaliadorSintatico = new AvaliadorSintaticoVisuAlg();
            interpretador = new InterpretadorVisuAlg(process.cwd());
        });

        it('Argumentos como variáveis', async () => {
            const retornoLexador = lexador.mapear([
                'algoritmo "número aleatório"',
                'var',
                '    k: inteiro',
                '    l: inteiro',
                'inicio',
                '    l <- 10',
                '    k <- randi(l)',
                '    escreva (k)',
                'fimalgoritmo'
            ], -1);

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });
        
        it('Chamadas diversas', async () => {
            const retornoLexador = lexador.mapear([
                'Algoritmo "exemplo_funcoes"',
                'var a, b, c : real',
                'inicio',
                'a <- 2',
                'b <- 9',
                'escreval( b - a )',
                'escreval( abs( a - b ) )',
                'c <- raizq( b )',
                'escreval("A área do circulo com raio " , c , " é " , pi * quad(c) )',
                'escreval("Um ângulo de 90 graus tem " , grauprad(90) , " radianos" )',
                'escreval( exp(a,b) )',
                'escreval( int( b / ( a + c ) ) )',
                'Fimalgoritmo'
            ], -1);

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });
    });
});

describe('Biblioteca de caracteres', () => {
    let interpretador: InterpretadorVisuAlg;

    beforeAll(() => {
        carregarBibliotecaGlobalCaracter(mockPilha);
    });

    describe('Testes triviais', () => {
        it('asc', async () => {
            const funcaoAsc = funcoes['asc'].funcao;
            expect(await funcaoAsc({} as InterpretadorInterface, 'a')).toBe(97);
        });

        it('carac', async () => {
            const funcaoCarac = funcoes['carac'].funcao;
            expect(await funcaoCarac({} as InterpretadorInterface, 97)).toBe('a');
        });

        it('caracpnum', async () => {
            const funcaoCaracPNum = funcoes['caracpnum'].funcao;
            expect(await funcaoCaracPNum({} as InterpretadorInterface, '97')).toBe(97);
        });

        it('compr', async () => {
            const funcaoCompr = funcoes['compr'].funcao;
            expect(await funcaoCompr({} as InterpretadorInterface, 'a')).toBe(1);
        });

        it('copia', async () => {
            const funcaoCopia = funcoes['copia'].funcao;
            expect(await funcaoCopia({} as InterpretadorInterface, 'Uma cadeia de caracteres', 4, 6)).toBe('cadeia');
        });

        it('maiusc', async () => {
            const funcaoMaiusc = funcoes['maiusc'].funcao;
            expect(await funcaoMaiusc({} as InterpretadorInterface, 'a')).toBe('A');
        });

        it('minusc', async () => {
            const funcaoMinusc = funcoes['minusc'].funcao;
            expect(await funcaoMinusc({} as InterpretadorInterface, 'A')).toBe('a');
        });

        it('numpcarac', async () => {
            const funcaoNumPCarac = funcoes['numpcarac'].funcao;
            expect(await funcaoNumPCarac({} as InterpretadorInterface, 1)).toBe('1');
        });

        it('pos', async () => {
            const funcaoPos = funcoes['pos'].funcao;
            expect(await funcaoPos({} as InterpretadorInterface, 'a', 'a')).toBe(1);
        });
    });

    describe('Testes com fonte completo', () => {
        let lexador: LexadorVisuAlg;
        let avaliadorSintatico: AvaliadorSintaticoVisuAlg;
        let interpretador: InterpretadorVisuAlg;

        beforeEach(() => {
            lexador = new LexadorVisuAlg();
            avaliadorSintatico = new AvaliadorSintaticoVisuAlg();
            interpretador = new InterpretadorVisuAlg(process.cwd());
        });
        
        it('Chamadas diversas', async () => {
            const retornoLexador = lexador.mapear([
                'Algoritmo "exemplo_funcoes2"',
                'var',
                'a, b, c : caractere',
                'inicio',
                'a <- "2"',
                'b <- "9"',
                'escreval( b + a ) // será escrito "92" na tela',
                'escreval( caracpnum(b) + caracpnum(a) ) // será escrito 11 na tela',
                'escreval( numpcarac(3+3) + a ) // será escrito "62" na tela',
                'c <- "Brasil"',
                'escreval(maiusc(c)) // será escrito "BRASIL" na tela',
                'escreval(compr(c)) // será escrito 6 na tela',
                'b <- "O melhor do Brasil"',
                'escreval(pos(c,b)) // será escrito 13 na tela',
                'escreval(asc(c)) // será escrito 66 na tela - código ASCII de "B"',
                'a <- carac(65) + carac(66) + carac(67)',
                'escreval(a) // será escrito "ABC" na tela',
                'Fimalgoritmo'
            ], -1);

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });
    });
});
