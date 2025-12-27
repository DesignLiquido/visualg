import { LexadorVisuAlg } from '../fontes/lexador';

import tiposDeSimbolos from "../fontes/tipos-de-simbolos/lexico-regular";

describe('Lexador', () => {
    describe('mapear()', () => {
        let lexador: LexadorVisuAlg;

        beforeEach(() => {
            lexador = new LexadorVisuAlg();
        });

        describe('Cenários de sucesso', () => {
            it('Sucesso - Código vazio', async () => {
                const resultado = lexador.mapear([''], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(0);
            });

            it('Sucesso - Ponto-e-vírgula, opcional', async () => {
                const resultado = lexador.mapear([';;;;;;;;;;;;;;;;;;;;;'], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(0);
            });

            it('Sucesso - estrutura mínima', async () => {
                const resultado = lexador.mapear([
                    "algoritmo \"vazio\"",
                    "var",
                    "inicio",
                    "fimalgoritmo"
                ], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(8);
                expect(resultado.simbolos).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ tipo: tiposDeSimbolos.ALGORITMO }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.CARACTERE }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.QUEBRA_LINHA }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.VAR }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.QUEBRA_LINHA }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.INICIO }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.QUEBRA_LINHA }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.FIM_ALGORITMO })
                    ])
                );
            });

            it('Sucesso - Olá mundo', async () => {
                const resultado = lexador.mapear(
                    [
                        "algoritmo \"ola-mundo\"",
                        "var",
                        "a: inteiro",
                        "inicio"
                    ], -1);
    
                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(10);
                expect(resultado.simbolos).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ tipo: tiposDeSimbolos.ALGORITMO }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.CARACTERE }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.QUEBRA_LINHA }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.VAR }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.QUEBRA_LINHA }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.IDENTIFICADOR }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.DOIS_PONTOS }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.INTEIRO }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.INICIO }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.QUEBRA_LINHA })
                    ])
                );
            });

            it('Sucesso - Registro', async () => {
                const resultado = lexador.mapear(
                    [
                        `algoritmo "EXEMPLO_METALNOVO"`,
                        `Tipo deposito = registro`,
                        `    codigo: inteiro`,
                        `    descricao: caractere`,
                        `    type: caractere`,
                        `    preco: real`,
                        `    quantidade: inteiro`,
                        `Fimregistro`,
                        `Var`,
                        `    produto: vetor[1..50] de deposito`,
                        `    i: inteiro`,
                        `    maisCaro, maisBarato: deposito`,
                        `    Procedimento lerProdutos()`,
                        `    Inicio`,
                        `        para i de 1 ate 50 faca`,
                        `            escreva("CODIGO DO PRODUTO: ")`,
                        `            leia(produto[i].codigo)`,
                        `            escreva("DESCRIÇÃO DO PRODUTO: ")`,
                        `            leia(produto[i].descricao)`,
                        `            escreval("TIPOS DE PRODUTOS")`,
                        `            escreval("PREGO = P")`,
                        `            escreval("ARRUELA = A")`,
                        `            escreval("PORCA = O")`,
                        `            escreval("PARAFUSO = U")`,
                        `            escreva("TIPO DE PRODUTO: ")`,
                        `            leia(produto[i].type)`,
                        `            escreva("PRECO DO PRODUTO: ")`,
                        `            leia(produto[i].preco)`,
                        `            escreva("QUANTIDADE DE PRODUTOS: ")`,
                        `            leia(produto[i].quantidade)`,
                        `            escreval("")`,
                        `        fimpara`,
                        `    Fimprocedimento`,
                        `    Procedimento imprimirProdutos()`,
                        `    Inicio`,
                        `        para i de 1 ate 50 faca`,
                        `            escreval("CODIGO DO PRODUTO: ", produto[i].codigo)`,
                        `            escreval("DESCRIÇÃO DO PRODUTO: ", produto[i].descricao)`,
                        `            escreval("TIPO DE PRODUTO: ", produto[i].type)`,
                        `            escreval("PRECO DO PRODUTO: ", produto[i].preco)`,
                        `            escreval("QUANTIDADE DE PRODUTOS: ", produto[i].quantidade)`,
                        `            escreval("")`,
                        `        fimpara`,
                        `    Fimprocedimento`,
                        `    Procedimento reajustarPrecos()`,
                        `    Inicio`,
                        `        para i de 1 ate 50 faca`,
                        `            se (produto[i].type = "P") ou (produto[i].type = "p") entao`,
                        `                produto[i].preco <- produto[i].preco + (produto[i].preco * 0.07)`,
                        `            senao`,
                        `                se (produto[i].type = "U") ou (produto[i].type = "u") entao`,
                        `                    produto[i].preco <- produto[i].preco + (produto[i].preco * 0.11)`,
                        `                senao`,
                        `                    se (produto[i].type = "O") ou (produto[i].type = "o") entao`,
                        `                    produto[i].preco <- produto[i].preco + (produto[i].preco * 0.08)`,
                        `                    senao`,
                        `                    se (produto[i].type = "A") ou (produto[i].type = "a") entao`,
                        `                        produto[i].preco <- produto[i].preco + (produto[i].preco * 0.08)`,
                        `                    senao`,
                        `                        escreval("Codigo invalido")`,
                        `                    fimse`,
                        `                    fimse`,
                        `                fimse`,
                        `            fimse`,
                        `        fimpara`,
                        `    Fimprocedimento`,
                        `    Procedimento imprimirMaisCaro()`,
                        `    Inicio`,
                        `        maisCaro <- produto[1]`,
                        `        para i de 2 ate 50 faca`,
                        `            se produto[i].preco > maisCaro.preco entao`,
                        `                maisCaro <- produto[i]`,
                        `            fimse`,
                        `        fimpara`,
                        `        escreval("CODIGO DO PRODUTO MAIS CARO: ", maisCaro.codigo)`,
                        `        escreval("DESCRICAO DO PRODUTO MAIS CARO: ", maisCaro.descricao)`,
                        `        escreval("PRECO DO PRODUTO MAIS CARO: ", maisCaro.preco)`,
                        `    Fimprocedimento`,
                        `    Procedimento imprimirMaisBarato()`,
                        `    Inicio`,
                        `        maisBarato <- produto[1]`,
                        `        para i de 2 ate 50 faca`,
                        `            se produto[i].preco < maisBarato.preco entao`,
                        `                maisBarato <- produto[i]`,
                        `            fimse`,
                        `        fimpara`,
                        `        escreval("CODIGO DO PRODUTO MAIS BARATO: ", maisBarato.codigo)`,
                        `        escreval("DESCRICAO DO PRODUTO MAIS BARATO: ", maisBarato.descricao)`,
                        `        escreval("PRECO DO PRODUTO MAIS BARATO: ", maisBarato.preco)`,
                        `    Fimprocedimento`,
                        `Inicio`,
                        `    escreval("|=====================================|")`,
                        `    escreval("|    LEITURA DE DADOS DOS PRODUTOS    |")`,
                        `    escreval("|=====================================|")`,
                        `    lerProdutos()`,
                        `    escreval("|=====================================|")`,
                        `    escreval("| LISTA DE PRODUTOS ANTES DO REAJUSTE |")`,
                        `    escreval("|=====================================|")`,
                        `    imprimirProdutos()`,
                        `    reajustarPrecos()`,
                        `    escreval("|=====================================|")`,
                        `    escreval("|   LISTA DE PRODUTOS APOS REAJUSTE   |")`,
                        `    escreval("|=====================================|")`,
                        `    imprimirProdutos()`,
                        `    escreval("|=====================================|")`,
                        `    escreval("|          PRODUTO MAIS CARO          |")`,
                        `    escreval("|=====================================|")`,
                        `    imprimirMaisCaro()`,
                        `    escreval("|=====================================|")`,
                        `    escreval("|         PRODUTO MAIS BARATO         |")`,
                        `    escreval("|=====================================|")`,
                        `    imprimirMaisBarato()`,
                        `Fimalgoritmo`
                    ], -1);

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(750);
                expect(resultado.simbolos).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ tipo: tiposDeSimbolos.TIPO }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.REGISTRO }),
                        expect.objectContaining({ tipo: tiposDeSimbolos.FIM_REGISTRO })
                    ])
                );
            });
        });
    });
});
