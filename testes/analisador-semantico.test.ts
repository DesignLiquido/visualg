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
            it('Variável indefinida, não declarada (escreva)', async () => {
                const retornoLexador = lexador.mapear([
                    'algoritmo "Declaração de variável"',
                    'var',
                    'inicio',
                    'escreva(idade, "teste");',
                    'fimalgoritmo'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
            });

            it('Variável indefinida, não declarada (atribuição)', async () => {
                const retornoLexador = lexador.mapear([
                    'algoritmo "Atribuição de valor"',
                    'var',
                    'inicio',
                    'idade <- 2',
                    'fimalgoritmo'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
            });

            it('Atribuição inválida', async () => {
                const retornoLexador = lexador.mapear([
                    'algoritmo "Atribuição de valor"',
                    'var',
                    'idade: real',
                    'inicio',
                    'idade <- "2"',
                    'fimalgoritmo'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                expect(retornoAnalisadorSemantico).toBeTruthy();
                // Espera 2 diagnósticos: 1 erro (incompatibilidade de tipo) + 1 aviso (variável não usada)
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(2);
            });

            it('Atribuição inválida de variáveis', async () => {
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

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                expect(retornoAnalisadorSemantico).toBeTruthy();
                // Espera 8 diagnósticos: 4 erros (incompatibilidades de tipo) + 4 avisos (variáveis não usadas)
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(8);
            });

            it("Chamada de função inexistente", async () => {
                const retornoLexador = lexador.mapear([
                    'algoritmo "definindo função"',
                    'var',
                    'resultado: caracter',
                    'inicio',
                    'saudacao(4);',
                    'fimalgoritmo'
                ], -1)

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                expect(retornoAnalisadorSemantico).toBeTruthy();
                // Espera 2 diagnósticos: 1 erro (função não encontrada) + 1 aviso (variável não usada)
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(2);
            })

            it("Chamada de função com tipos de parâmetros diferentes", async () => {
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

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                expect(retornoAnalisadorSemantico).toBeTruthy();
                // Espera 3 diagnósticos: 1 erro (tipo de parâmetro incorreto) + 2 avisos (variável não usada + caminhos de retorno incompletos)
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(3);
            })
        })

        describe('Cenários de sucesso - Variáveis usadas em loops', () => {
            it('Variáveis usadas em loops repita...ate e para...faca não devem ser marcadas como não usadas', async () => {
                const retornoLexador = lexador.mapear([
                    'algoritmo "Teste 7"',
                    'var',
                    '    aleatorioMaximo, aleatorioMinimo, i: inteiro',
                    'inicio',
                    '',
                    'repita',
                    '    aleatorioMaximo <- int(rand * 100)',
                    '    aleatorioMinimo <- int(rand * 100)',
                    'ate aleatorioMaximo >= aleatorioMinimo',
                    '',
                    'escreval ("Máximo", aleatorioMaximo)',
                    'escreval ("Mínimo", aleatorioMinimo)',
                    '',
                    'para i de aleatorioMinimo ate aleatorioMaximo faca',
                    '    escreval(i)',
                    'fimpara',
                    '',
                    'fimalgoritmo'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                expect(retornoAnalisadorSemantico).toBeTruthy();
                // Não deve haver avisos de variáveis não usadas - todas são usadas nos loops
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });
        })

        describe('Cenários de sucesso - Acesso a vetores e matrizes', () => {
            it('Variáveis de vetores acessadas com índice devem ser marcadas como usadas', async () => {
                const retornoLexador = lexador.mapear([
                    'algoritmo "negativos"',
                    'var',
                    '  n, i: inteiro',
                    '  vet: vetor [0..9] de inteiro',
                    'inicio',
                    '  escreval("Quantos numeros voce vai digitar? ")',
                    '  leia(n)',
                    '  para i de 0 ate n-1 faca',
                    '    escreval("Digite um numero: ")',
                    '    leia(vet[i])',
                    '  fimpara',
                    '  escreval(" ")',
                    '  escreval("NUMEROS NEGATIVOS")',
                    '  para i de 0 ate n-1 faca',
                    '    se (vet[i] < 0) entao',
                    '      escreval(vet[i])',
                    '    fimse',
                    '  fimpara',
                    'fimalgoritmo'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                expect(retornoAnalisadorSemantico).toBeTruthy();
                // Não deve haver avisos de variáveis não usadas - todas são usadas (n, i, vet)
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Acesso a vetor em atribuição deve marcar o vetor como usado', async () => {
                const retornoLexador = lexador.mapear([
                    'algoritmo "teste vetor"',
                    'var',
                    '  v: vetor[1..5] de inteiro',
                    '  x, i: inteiro',
                    'inicio',
                    '  para i de 1 ate 5 faca',
                    '    v[i] <- i * 10',
                    '  fimpara',
                    '  x <- v[1]',
                    '  escreval(x)',
                    'fimalgoritmo'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                expect(retornoAnalisadorSemantico).toBeTruthy();
                // Não deve haver avisos de variáveis não usadas - todas são usadas (v, x, i)
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });
        })
    })
})