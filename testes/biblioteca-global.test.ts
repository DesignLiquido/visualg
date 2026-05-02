import { DeleguaFuncao } from '@designliquido/delegua/interpretador/estruturas';
import { InterpretadorInterface, SimboloInterface, VariavelInterface } from '@designliquido/delegua/interfaces';
import { EscopoExecucaoInterface } from '@designliquido/delegua/interfaces/escopo-execucao';
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

    naPosicao: function (posicao: number): EscopoExecucaoInterface {
        throw new Error('Função não implementada.');
    },

    obterEscopoPorTipo: function (idChamada: string): EscopoExecucaoInterface | undefined {
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

    empilhar: function (item: EscopoExecucaoInterface): void {
        throw new Error('Função não implementada.');
    },

    eVazio: function (): boolean {
        throw new Error('Função não implementada.');
    },

    topoDaPilha: function (): EscopoExecucaoInterface {
        throw new Error('Função não implementada.');
    },

    removerUltimo: function (): EscopoExecucaoInterface {
        throw new Error('Função não implementada.');
    },
};

describe('Biblioteca Numérica', () => {
    beforeAll(() => {
        carregarBibliotecaGlobalNumerica(mockPilha);
    });

    describe('Testes triviais', () => {
        let interpretador: InterpretadorVisuAlg;

        beforeEach(() => {
            interpretador = new InterpretadorVisuAlg('', false, () => {}, () => {});
        });

        it('abs', async () => {
            const funcaoAbs = funcoes['abs'].funcao;
            expect(await funcaoAbs(interpretador, -5)).toBe(5);
        });

        it('arcCos', async () => {
            const funcaoArcCos = funcoes['arccos'].funcao;
            expect(await funcaoArcCos(interpretador, 0)).toBe(1.5707963267948966);
        });

        it('arcSen', async () => {
            const funcaoArcSen = funcoes['arcsen'].funcao;
            expect(await funcaoArcSen(interpretador, 0)).toBe(0);
        });

        it('arcTan', async () => {
            const funcaoArcTan = funcoes['arctan'].funcao;
            expect(await funcaoArcTan(interpretador, 0)).toBe(0);
        });

        it('cos', async () => {
            const funcaoCos = funcoes['cos'].funcao;
            expect(await funcaoCos(interpretador, 0)).toBe(1);
        });

        it('cotan', async () => {
            const funcaoCoTan = funcoes['cotan'].funcao;
            expect(await funcaoCoTan(interpretador, 1)).toBe(0.6420926159343306);
        });

        it('exp', async () => {
            const funcaoExp = funcoes['exp'].funcao;
            expect(await funcaoExp(interpretador, 10, 2)).toBe(100);
        });

        it('grauprad', async () => {
            const funcaoGrauPRad = funcoes['grauprad'].funcao;
            expect(await funcaoGrauPRad(interpretador, 0)).toBe(0);
        });

        it('int', async () => {
            const funcaoInt = funcoes['int'].funcao;
            expect(await funcaoInt(interpretador, '0')).toBe(0);
        });

        it('log', async () => {
            const funcaoLog = funcoes['log'].funcao;
            expect(await funcaoLog(interpretador, 100)).toBe(2);
        });

        it('logn', async () => {
            const funcaoLogN = funcoes['logn'].funcao;
            expect(await funcaoLogN(interpretador, Math.E)).toBe(1);
        });

        it('pi', async () => {
            const funcaoPi = funcoes['pi'].funcao;
            expect(await funcaoPi({} as InterpretadorInterface)).toBe(3.141592653589793);
        });

        it('quad', async () => {
            const funcaoQuad = funcoes['quad'].funcao;
            expect(await funcaoQuad(interpretador, 0)).toBe(0);
        });

        it('radpgrau', async () => {
            const funcaoRadPGrau = funcoes['radpgrau'].funcao;
            expect(await funcaoRadPGrau(interpretador, 0)).toBe(0);
        });

        it('raizq', async () => {
            const funcaoRaizQ = funcoes['raizq'].funcao;
            expect(await funcaoRaizQ(interpretador, 0)).toBe(0);
        });

        it('rand', async () => {
            const funcaoRand = funcoes['rand'].funcao;
            expect(await funcaoRand({} as InterpretadorInterface)).toBeGreaterThanOrEqual(0);
            expect(await funcaoRand({} as InterpretadorInterface)).toBeLessThanOrEqual(1);
        });

        it('randi', async () => {
            const funcaoRandI = funcoes['randi'].funcao;
            const resultado = await funcaoRandI(interpretador, 15);
            expect(resultado).toBeGreaterThanOrEqual(0);
        });

        it('sen', async () => {
            const funcaoSen = funcoes['sen'].funcao;
            expect(await funcaoSen(interpretador, 0)).toBe(0);
        });

        it('tan', async () => {
            const funcaoTan = funcoes['tan'].funcao;
            expect(await funcaoTan(interpretador, 0)).toBe(0);
        });
    });

    describe('Testes com fonte completo', () => {
        let lexador: LexadorVisuAlg;
        let avaliadorSintatico: AvaliadorSintaticoVisuAlg;
        let interpretador: InterpretadorVisuAlg;

        let _saidas: string[] = [];
        const funcaoSaida = (texto: string) => {
            _saidas.push(texto);
        }

        beforeEach(() => {
            _saidas = [];
            lexador = new LexadorVisuAlg();
            avaliadorSintatico = new AvaliadorSintaticoVisuAlg();
            interpretador = new InterpretadorVisuAlg(process.cwd(), false, funcaoSaida, funcaoSaida);
            interpretador.funcaoLimpaTela = jest.fn();
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

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(1);
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

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(6);
            expect(_saidas[0]).toBe('7');
            expect(_saidas[1]).toBe('7');
            expect(_saidas[2]).toBe('A área do circulo com raio 3 é 28.274333882308138');
            expect(_saidas[3]).toBe('Um ângulo de 90 graus tem 1.5707963267948966 radianos');
            expect(_saidas[4]).toBe('512');
            expect(_saidas[5]).toBe('1');
        });
    });
});

describe('Biblioteca de caracteres', () => {
    let interpretador: InterpretadorVisuAlg;

    beforeAll(() => {
        carregarBibliotecaGlobalCaracter(mockPilha);
    });

    beforeEach(() => {
        interpretador = new InterpretadorVisuAlg('', false, () => {}, () => {});
    });

    describe('Testes triviais', () => {
        it('asc', async () => {
            const funcaoAsc = funcoes['asc'].funcao;
            expect(await funcaoAsc(interpretador, 'a')).toBe(97);
        });

        it('carac', async () => {
            const funcaoCarac = funcoes['carac'].funcao;
            expect(await funcaoCarac(interpretador, 97)).toBe('a');
        });

        it('caracpnum', async () => {
            const funcaoCaracPNum = funcoes['caracpnum'].funcao;
            expect(await funcaoCaracPNum(interpretador, '97')).toBe(97);
        });

        it('compr', async () => {
            const funcaoCompr = funcoes['compr'].funcao;
            expect(await funcaoCompr(interpretador, 'a')).toBe(1);
        });

        describe('copia', () => {
            it('Trivial', async () => {
                const funcaoCopia = funcoes['copia'].funcao;
                expect(await funcaoCopia(interpretador, 'Uma cadeia de caracteres', 5, 6)).toBe('cadeia');
            });

            it('Com início e fim iguais', async () => {
                const funcaoCopia = funcoes['copia'].funcao;
                expect(await funcaoCopia(interpretador, 'Uma cadeia de caracteres', 1, 1)).toBe('U');
            });
        });

        it('maiusc', async () => {
            const funcaoMaiusc = funcoes['maiusc'].funcao;
            expect(await funcaoMaiusc(interpretador, 'a')).toBe('A');
        });

        it('minusc', async () => {
            const funcaoMinusc = funcoes['minusc'].funcao;
            expect(await funcaoMinusc(interpretador, 'A')).toBe('a');
        });

        it('numpcarac', async () => {
            const funcaoNumPCarac = funcoes['numpcarac'].funcao;
            expect(await funcaoNumPCarac(interpretador, 1)).toBe('1');
        });

        it('pos', async () => {
            const funcaoPos = funcoes['pos'].funcao;
            expect(await funcaoPos(interpretador, 'a', 'a')).toBe(1);
        });
    });

    describe('Testes com fonte completo', () => {
        let lexador: LexadorVisuAlg;
        let avaliadorSintatico: AvaliadorSintaticoVisuAlg;
        let interpretador: InterpretadorVisuAlg;

        let _saidas: string[] = [];
        const funcaoSaida = (texto: string) => {
            _saidas.push(texto);
        }

        beforeEach(() => {
            _saidas = [];
            lexador = new LexadorVisuAlg();
            avaliadorSintatico = new AvaliadorSintaticoVisuAlg();
            interpretador = new InterpretadorVisuAlg(process.cwd(), false, funcaoSaida, funcaoSaida);
            interpretador.funcaoLimpaTela = jest.fn();
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

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toHaveLength(8);
            expect(_saidas[0]).toBe('92');
            expect(_saidas[1]).toBe('11');
            expect(_saidas[2]).toBe('62');
            expect(_saidas[3]).toBe('BRASIL');
            expect(_saidas[4]).toBe('6');
            expect(_saidas[5]).toBe('13');
            expect(_saidas[6]).toBe('66');
            expect(_saidas[7]).toBe('ABC');
        });
    });
});
