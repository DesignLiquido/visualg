import { AnalisadorSemanticoVisuAlg } from '../fontes/analisador-semantico';
import { AvaliadorSintaticoVisuAlg } from "../fontes/avaliador-sintatico";
import { LexadorVisuAlg } from "../fontes/lexador";

describe('Analisador semântico', () => {
    describe('analisar()', () => {
        let lexador: LexadorVisuAlg;
        let avaliadorSintatico: AvaliadorSintaticoVisuAlg;
        let analisadorSemantico: AnalisadorSemanticoVisuAlg;

        beforeEach(() => {
            lexador = new LexadorVisuAlg();
            avaliadorSintatico = new AvaliadorSintaticoVisuAlg();
            analisadorSemantico = new AnalisadorSemanticoVisuAlg();
        });

        describe('Cenários de falha', () => {
            it('Variável indefinida, não declarada (escreva)', () => {
                const retornoLexador = lexador.mapear([
                    'algoritmo "Declaração de variável"',
                    'var',
                    'inicio',
                    'escreva(idade, "teste");',
                    'fimalgoritmo'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
            });

            it('Variável indefinida, não declarada (atribuição)', () => {
                const retornoLexador = lexador.mapear([
                    'algoritmo "Atribuição de valor"',
                    'var',
                    'inicio',
                    'idade <- 2',
                    'fimalgoritmo'
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
            });

            it('Atribuição inválida', () => {
                const retornoLexador = lexador.mapear([
                    'algoritmo "Atribuição de valor"',
                    'var',
                    'idade: real',
                    'inicio',
                    'idade <- "2"',
                    'fimalgoritmo'
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                expect(retornoAnalisadorSemantico).toBeTruthy();
                // Espera 2 diagnósticos: 1 erro (incompatibilidade de tipo) + 1 aviso (variável não usada)
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(2);
            });

            it('Atribuição inválida de variáveis', () => {
                const retornoLexador = lexador.mapear([
                    'algoritmo "Atribuição inválida de variáveis"',
                    'var x: real',
                    'y: inteiro',
                    'a: caractere',
                    'l: logico',
                    'inicio',
                    'x <- "25"',
                    'y <- "6x"',
                    'a <- 0',
                    'l <- "verdadeiro e falso"',
                    'fimalgoritmo'
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                expect(retornoAnalisadorSemantico).toBeTruthy();
                // Espera 8 diagnósticos: 4 erros (incompatibilidades de tipo) + 4 avisos (variáveis não usadas)
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(8);
            });

            it("Chamada de função inexistente", () => {
                const retornoLexador = lexador.mapear([
                    'algoritmo "definindo função"',
                    'var',
                    'resultado: caracter',
                    'inicio',
                    'saudacao(4);',
                    'fimalgoritmo'
                ], -1)

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                expect(retornoAnalisadorSemantico).toBeTruthy();
                // Espera 2 diagnósticos: 1 erro (função não encontrada) + 1 aviso (variável não usada)
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(2);
            })

            it("Chamada de função com tipos de parâmetros diferentes", () => {
                const retornoLexador = lexador.mapear([
                    'algoritmo "definindo função"',
                    'var',
                    'resultado: caracter',
                    'função saudacao(nome: caracter): caracter',
                    'var',
                    'inicio',
                    'retorna "Bem vindo " + nome',
                    'fimfunção',
                    'inicio',
                    'saudacao(4);',
                    'fimalgoritmo'
                ], -1)

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                expect(retornoAnalisadorSemantico).toBeTruthy();
                // Espera 3 diagnósticos: 1 erro (tipo de parâmetro incorreto) + 2 avisos (variável não usada + caminhos de retorno incompletos)
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(3);
            })
        })
    })
})