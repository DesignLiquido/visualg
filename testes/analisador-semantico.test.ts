import { AnalisadorSemantico } from '../fontes/analisador-semantico/analisador-semantico'
import { AvaliadorSintatico } from "../fontes/avaliador-sintatico";
import { Lexador } from "../fontes/lexador";

describe('Analisador sêmantico', () => {
    describe('analisar()', () => {
        let lexador: Lexador;
        let avaliadorSintatico: AvaliadorSintatico;
        let analisadorSemantico: AnalisadorSemantico

        beforeEach(() => {
            lexador = new Lexador();
            avaliadorSintatico = new AvaliadorSintatico();
            analisadorSemantico = new AnalisadorSemantico();
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
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
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
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(4);
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
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
            })

            it("Chamada de função com número de parametro diferentes", () => {
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
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
            })
        })
    })
})