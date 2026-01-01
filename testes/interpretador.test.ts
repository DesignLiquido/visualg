import { AvaliadorSintaticoVisuAlg } from '../fontes/avaliador-sintatico';
import { InterpretadorVisuAlg } from "../fontes/interpretador/interpretador-visualg";
import { LexadorVisuAlg } from '../fontes/lexador';

describe('Interpretador', () => {
    describe('interpretar()', () => {
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

        describe('Cenários de sucesso', () => {
            it('Trivial', async () => {
                const retornoLexador = lexador.mapear([
                    'algoritmo "olá-mundo"',
                    'inicio',
                    'fimalgoritmo'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Atribuição', async () => {
                const saidasMensagens = [
                    "1",
                    "b"
                ]
                const retornoLexador = lexador.mapear(
                    [
                        'algoritmo "Atribuição"',
                        'var a: inteiro',
                        'var b: caracter',
                        'inicio',
                        'a <- 1',
                        'b := "b"',
                        'escreva (a)',
                        'escreva (b)',
                        'fimalgoritmo',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                interpretador.funcaoDeRetornoMesmaLinha = (saida: any) => {
                    expect(saidasMensagens.includes(saida)).toBeTruthy()
                }

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it("Enquanto", async () => {
                const saidasMensagens = ['verdadeiro', 'num1 não é maior que 0', 'num1 não é maior que 0', 'num1 é maior que 0']
                // Aqui vamos simular a resposta para três variáveis de `leia()`.
                const respostas = [
                    "-1", "-2", "1"
                ];
                interpretador.interfaceEntradaSaida = {
                    question: (mensagem: string, callback: Function) => {
                        callback(respostas.shift());
                    }
                };

                const retornoLexador = lexador.mapear([
                    'algoritmo "teste5"',
                    'var',
                    '    num1, num2: inteiro',
                    '    texto1, texto2: caractere',
                    '    teste: logico',
                    'inicio',
                    '    teste <- verdadeiro',
                    '    leia (num1)',
                    '    escreval(teste)',
                    '    enquanto teste = verdadeiro faca',
                    '         escreval("num1 não é maior que 0")',
                    '         leia (num1)',
                    '         se num1 > 0 entao',
                    '             teste <- falso',
                    '         fimse',
                    '    fimenquanto',
                    '    escreval("num1 é maior que 0")',
                    'fimalgoritmo'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                interpretador.funcaoDeRetorno = (saida: any) => {
                    expect(saidasMensagens.includes(saida)).toBeTruthy()
                }

                const retornoInterpretador = await (interpretador as any).interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Enquanto com variável modificada em loop', async () => {
                let saidas: string[] = [];
                // Aqui vamos simular a resposta para quatro variáveis de `leia()`.
                const respostas = [
                    "-1", "-2", "1", "0"
                ];

                interpretador.interfaceEntradaSaida = {
                    question: (mensagem: string, callback: Function) => {
                        callback(respostas.shift());
                    }
                };

                const retornoLexador = lexador.mapear([
                    'algoritmo "atividade_enquanto_1"',
                    'var',
                    '    x: real',
                    'inicio',
                    '    x := 1',
                    '    enquanto x <> 0 faca',
                    '        escreval("Digite um número")',
                    '        leia(x)',
                    '    fimenquanto',
                    'fimalgoritmo'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                interpretador.funcaoDeRetornoMesmaLinha = (saida: any) => {
                    saidas.push(saida);
                }

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('limpatela', async () => {
                const saidasMensagens = [
                    "Teste 1",
                    "Teste 2",
                    "Teste 3",
                    "Teste 4",
                    "Teste 5",
                ]
                const metodoVisitarExpressaoLimpaTela = jest.spyOn(interpretador, 'visitarExpressaoLimpaTela');

                const retornoLexador = lexador.mapear([
                    'Algoritmo "limpatela"',
                    'Var',
                    'Inicio',
                    '    escreval("Teste 1")',
                    '    limpatela',
                    '    escreval("Teste 2")',
                    '    limpatela',
                    '    escreval("Teste 3")',
                    '    escreval("Teste 4")',
                    '    limpatela',
                    '    escreval("Teste 5")',
                    'Fimalgoritmo'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                interpretador.funcaoDeRetorno = (saida: any) => {
                    expect(saidasMensagens.includes(saida)).toBeTruthy()
                }

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(metodoVisitarExpressaoLimpaTela).toHaveBeenCalledTimes(3);
            });

            it('Leia', async () => {
                // Aqui vamos simular a resposta para cinco variáveis de `leia()`.
                const respostas = ["1", "2", "3", "4", "5"];
                interpretador.interfaceEntradaSaida = {
                    question: (mensagem: string, callback: Function) => {
                        callback(respostas.shift());
                    }
                };

                const retornoLexador = lexador.mapear([
                    'Algoritmo "Soma 5"',
                    'Var',
                    '    n1, n2, n3, n4, n5: inteiro',
                    'Inicio',
                    '    leia(n1, n2, n3, n4, n5)',
                    '    escreva(n1 + n2 + n3 + n4 + n5)',
                    'Fimalgoritmo'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                interpretador.funcaoDeRetornoMesmaLinha = (saida: any) => {
                    expect(saida).toEqual("15")
                }

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Equação de Segundo Grau', async () => {
                const saidasMensagens = ['Informe o valor de A: ', 'Informe o valor de B: ', 'Informe o valor de C: ', 'Esta equação não possui raízes reais.']
                const respostas = ["10", "21", "14"];
                interpretador.interfaceEntradaSaida = {
                    question: (mensagem: string, callback: Function) => {
                        callback(respostas.shift());
                    }
                };
                const retornoLexador = lexador.mapear([
                    'algoritmo "EquaçãoDoSegundoGrau"',
                    'var',
                       'a, b, c, delta, x1, x2: REAL',
                    'função calcula_delta(): REAL',
                    'var',
                       'delta : REAL',
                    'inicio',
                        'delta := b*b - 4*a*c',
                        'RETORNE delta',
                    'fimfunção',
                    'inicio',
                        'ESCREVA ("Informe o valor de A: ")',
                        'LEIA (a)',
                        'ESCREVA ("Informe o valor de B: ")',
                        'LEIA (b)',
                        'ESCREVA ("Informe o valor de C: ")',
                        'LEIA (c)',
                        'delta := calcula_delta',
                        'SE ( delta < 0 ) ENTAO',
                           'ESCREVA ("Esta equação não possui raízes reais.")',
                        'SENAO',
                            'SE (delta = 0) ENTAO',
                               'x1 := (-b + RAIZQ(delta)) / (2*a)',
                               'ESCREVA ("Esta equação possui apenas uma raiz: ", x1)',
                            'SENAO',
                                'x1 := (-b + RAIZQ(delta)) / (2*a)',
                                'x2 := (-b - RAIZQ(delta)) / (2*a)',
                                'ESCREVA ("Esta equação possui duas raízes: ", x1, " e ", x2)',
                            'FIMSE',
                        'FIMSE',
                    'fimalgoritmo',
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toBeTruthy();
                expect(_saidas).toHaveLength(4);
                expect(_saidas).toEqual(saidasMensagens);
            });

            describe('Repita', () => {
                it('Repita Até com acento', async () => {
                    const saidasMensagens = ['1 - Dizer olá!', '2 - Dizer oi! ', '0 - Sair do programa']
                    const respostas = ["0"];
                    interpretador.interfaceEntradaSaida = {
                        question: (mensagem: string, callback: Function) => {
                            callback(respostas.shift());
                        }
                    };
    
                    const retornoLexador = lexador.mapear([
                        'algoritmo "Repita Até"',
                            'var',
                            'opcao: inteiro',
                        'inicio',
                            'repita',
                                'escreval("1 - Dizer olá!")',
                                'escreval("2 - Dizer oi! ")',
                                'escreval("0 - Sair do programa")',
                                'leia(opcao)',
                                'se (opcao = 1) entao',
                                    'escreval("Olá!")',
                                'fimse',
                                'se (opcao = 2) entao',
                                    'escreval("Oi!")',
                                'fimse',
                            'até (opcao = 0)',
                        'fimalgoritmo'
                    ], -1);
    
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
    
                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saidasMensagens.includes(saida)).toBeTruthy()
                    }
    
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
    
                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
    
                it('Repita Até - interrupção', async () => {
                    let _saidas = '';
                    const retornoLexador = lexador.mapear([
                        'algoritmo "Números de 1 a 10 (com interrompa)"',
                        'var x: inteiro',
                        'inicio',
                        'x <- 0',
                        'repita',
                        '   x <- x + 1',
                        '   escreva (x)',
                        '   se x >= 10 entao',
                        '      interrompa',
                        '   fimse',
                        'ate falso',
                        'fimalgoritmo'
                    ], -1);
    
                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saidas += saida;
                    }
    
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
    
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
    
                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            it('IMC', async () => {
                const saidasMensagens = ['Massa(Kg): ', 'Altura (m): ', 'Parabens! Voce esta no seu peso ideal']
                // Aqui vamos simular a resposta para duas variáveis de `leia()`.
                const respostas = ["78", "1.78"];
                interpretador.interfaceEntradaSaida = {
                    question: (mensagem: string, callback: Function) => {
                        callback(respostas.shift());
                    }
                };

                const retornoLexador = lexador.mapear([
                    'Algoritmo "CalculaIMC"',
                    '',
                    'Var',
                    '    M: Real',
                    '    A: Real',
                    '    IMC: Real',
                    '',
                    'Inicio',
                    '   Escreva("Massa(Kg): ")',
                    '   Leia(M)',
                    '   Escreva("Altura (m): ")',
                    '   Leia(A)',
                    '   IMC <- M / (A ^ 2)',
                    '   Escreval("IMC: ", IMC:5:2)',
                    '   Se (IMC >= 18.5) e (IMC < 25) então',
                    '      Escreva("Parabens! Voce esta no seu peso ideal")',
                    '   senão',
                    '      Escreva("Voce nao esta na faixa de peso ideal")',
                    '   Fimse',
                    '',
                    'Fimalgoritmo'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                interpretador.funcaoDeRetornoMesmaLinha = (saida: any) => {
                    expect(saidasMensagens.includes(saida)).toBeTruthy()
                }

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it("Declaração de Vetores", async () => {
                const retornoLexador = lexador.mapear([
                    'algoritmo "teste"',
                    'var',
                    'result_j1, result_j2 : vetor[1..2] de inteiro',
                    'inicio',
                    'fimalgoritmo'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            describe('Matrizes', () => {
                it("Matriz - Simples", async () => {
                    let _saidas = '';
                    // Aqui vamos simular a resposta para seis variáveis de `leia()`.
                    const respostas = [
                        "2", "2", "5", "6", "3", "1"
                    ];
                    interpretador.interfaceEntradaSaida = {
                        question: (mensagem: string, callback: Function) => {
                            callback(respostas.shift());
                        }
                    };

                    const retornoLexador = lexador.mapear([
                        'Algoritmo "uso de matrizes"',
                        '//Author: rar',
                        'var',
                        '    //declaração de variaveis',
                        '    M, N, i, j: inteiro',
                        '    matA: vetor [0..4, 0..2] de inteiro',
                        'inicio',
                        '    //secao de comandos',
                        '    escreva("Digite quantas linhas a matriz vai ter: ")',
                        '    leia(M)',
                        '    escreva("Digite quantas colunas a matriz vai ter: ")',
                        '    leia(N)',
                        '    para i de 0 ate M-1 faca',
                        '        para j de 0 ate N-1 faca',
                        '           escreva("Elemento: [", i, "," , j, "] : ")',
                        '           leia (matA[i, j])',
                        '        fimpara',
                        '    fimpara',
                        '    escreval (" ")',
                        '    escreval ("A matriz digitada é: ")',
                        '    para i de 0 ate M-1 faca',
                        '        para j de 0 ate N-1 faca',
                        '           escreva(matA[i, j], " ")',
                        '        fimpara',
                        '        escreval(" ")',
                        '    fimpara',
                        'fimalgoritmo'
                    ], -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saidas += saida + '\n';
                    }

                    interpretador.funcaoDeRetornoMesmaLinha = (saida: any) => {
                        _saidas += saida;
                    }
    
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
    
                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it("Matriz - Jogo da Velha", async () => {
                    const retornoLexador = lexador.mapear([
                        'Algoritmo "Jogo da Velha"',
                        'Var',
                            'i, q, t: inteiro',
                            'jogoMatriz : vetor [1..3, 1..3] de caractere',
                        'Inicio',
                            'q <- 4',
                           't <- 7',
                           'para i de 1 ate 3 faca',
                              'jogoMatriz[1,i] <- numpcarac(i)',
                              'jogoMatriz[2,i] <- numpcarac(q)',
                              'jogoMatriz[3,i] <- numpcarac(t)',
                              'q <- q + 1',
                              't <- t + 1',
                           'fimpara',
                           'Escreval("      | ", jogoMatriz[1,1], " | ", jogoMatriz[1,2], " | ", jogoMatriz[1,3], " |")',
                           'Escreval("      +---+---+---+")',
                           'Escreval("      | ", jogoMatriz[2,1], " | ", jogoMatriz[2,2], " | ", jogoMatriz[2,3], " |")',
                           'Escreval("      +---+---+---+")',
                           'Escreval("      | ", jogoMatriz[3,1], " | ", jogoMatriz[3,2], " | ", jogoMatriz[3,3], " |")',
                        'Fimalgoritmo'
                    ], -1);
    
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
    
                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Para', () => {
                it('Para com passo negativo', async () => {
                    const saidasMensagens = ['Digite um valor: ', '10', '8', '6', '4', '2', '0']
                    // Aqui vamos simular a resposta para uma variável de `leia()`.
                    const respostas = [
                        "10"
                    ];
                    (interpretador as any).interfaceEntradaSaida = {
                        question: (mensagem: string, callback: Function) => {
                            callback(respostas.shift());
                        }
                    };
    
                    const retornoLexador = lexador.mapear([
                        'algoritmo "valoresPares"',
                        '',
                        'var',
                        'Cont, V: Inteiro',
                        '',
                        'inicio',
                        '    escreval("Digite um valor: ")',
                        '    Leia(V)',
                        '    para CONT de V ate 0 passo -2 faca',
                        '        Escreval(CONT)',
                        '    Fimpara',
                        '',
                        'fimalgoritmo'
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
    
                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saidasMensagens.includes(saida)).toBeTruthy()
                    }
    
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
    
                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
    
                it('Para com passo dinâmico', async () => {
                    const saidasMensagens = ['---------------------------', 'Digite o1º numero: ', 'Você deseja inserir mais um número? (S/N)', '---------------------------', 'Digite o2º numero: ', '---------------------------', 'Digite o3º numero: ', '---------------------------', 'Digite o4º numero: ', 'Valores repetidos não serão computados.', 'Você deseja inserir mais um número? (S/N)', '---------------------------', 'Digite o4º numero: ', '---------------------------', 'Digite o5º numero: ', 'Valores repetidos não serão computados.', 'Você deseja inserir mais um número? (S/N)']
                    // Aqui vamos simular a resposta para doze variáveis de `leia()`.
                    const respostas = [
                        "2", 'S', "5", 'S', "6", 'S', "5", 'S', "3", 'S', "5", 'N'
                    ];
                    (interpretador as any).interfaceEntradaSaida = {
                        question: (mensagem: string, callback: Function) => {
                            callback(respostas.shift());
                        }
                    };
    
                    const retornoLexador = lexador.mapear([
                        'algoritmo "semnome"',
                        'var',
                        '    li: vetor[0..9] de inteiro',
                        '    i, j, k: inteiro',
                        '    resposta: caractere',
                        'inicio',
                        '    i <- 0',
                        '    k <- 0',
                        '    enquanto resposta <> "N" faca',
                        '        escreval("---------------------------")',
                        '        escreval("Digite o", i + 1, "º numero: ")',
                        '        leia(li[i])',
                        '        se (i > 0) entao',
                        '            para j de 0 ate i - 1 faca',
                        '                se li[i] = li[j] entao',
                        '                    escreval("Valores repetidos não serão computados.")',
                        '                    i <- i - 1',
                        '                    interrompa',
                        '                fimse',
                        '            fimpara',
                        '        fimse',
                        '        escreval ("Você deseja inserir mais um número? (S/N)")',
                        '        leia(resposta)',
                        '        se (resposta <> "N") entao',
                        '            i <- i + 1',
                        '        fimse',
                        '    fimenquanto',
                        '    para k de 0 ate i faca',
                        '        escreva(li[k], " ")',
                        '    fimPara',
                        'fimAlgoritmo'
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
    
                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saidasMensagens.includes(saida)).toBeTruthy()
                    }
    
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
    
                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Para, reatribuição do valor inicial de variável de controle', async () => {
                    let _saidas = '';
                    const retornoLexador = lexador.mapear([
                        'algoritmo "valor x"',
                        'var',
                        '    x: inteiro',
                        'inicio',
                        '    x <- 0',
                        '    para x de 1 ate 6 faca',
                        '        escreval(x)',
                        '    fimpara',
                        '    para x de 1 ate 6 faca',
                        '        escreval(x)',
                        '    fimpara',
                        'fimalgoritmo'
                    ], -1);
    
                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saidas += saida;
                    }
    
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
    
                    expect(retornoInterpretador.erros).toHaveLength(0);
                });

                it('Para aninhado', async () => {
                    let _saidas = '';
                    const retornoLexador = lexador.mapear(['algoritmo "combinacoes"',
                        'var',
                        '    c1, c2: inteiro',
                        'inicio',
                        '    para c1 de 1 ate 3 passo 1 faca',
                        '        para c2 de 1 ate 3 passo 1 faca',
                        '            escreval(c1, c2)',
                        '        fimpara',
                        '    fimpara',
                        'fimalgoritmo'], -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saidas += saida + ', ';
                    }

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
    
                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toBe('11, 12, 13, 21, 22, 23, 31, 32, 33, ');
                });

                it("Média de Vetor", async () => {
                    const saidasMensagens = [
                        'Digite o par de notas do 1º Aluno', 
                        'Digite o par de notas do 2º Aluno', 
                        'Digite o par de notas do 3º Aluno', 
                        'Digite o par de notas do 4º Aluno', 
                        'Digite o par de notas do 5º Aluno', 
                        'Digite o par de notas do 6º Aluno', 
                        'Digite o par de notas do 7º Aluno', 
                        'Digite o par de notas do 8º Aluno', 
                        'Digite o par de notas do 9º Aluno', 
                        'Digite o par de notas do 10º Aluno', 
                        '-', 
                        'Media do 1º aluno: 90.5', 
                        'Media do 2º aluno: 83.5', 
                        'Media do 3º aluno: 71.5', 
                        'Media do 4º aluno: 94.5', 
                        'Media do 5º aluno: 76.5', 
                        'Media do 6º aluno: 90', 
                        'Media do 7º aluno: 80', 
                        'Media do 8º aluno: 65', 
                        'Media do 9º aluno: 75', 
                        'Media do 10º aluno: 85'
                    ];
    
                    // Aqui vamos simular a resposta para diversas variáveis de `leia()`.
                    const respostas = [
                        "90", "80", "50", "100", "60", "70", "75", "85", "89", "91",
                        "74", "79", "99", "90", "65", "78", "100", "67", "93", "88"
                    ];
                    (interpretador as any).interfaceEntradaSaida = {
                        question: (mensagem: string, callback: Function) => {
                            callback(respostas.pop());
                        }
                    };
    
                    const retornoLexador = lexador.mapear([
                        'algoritmo "media-vetor"',
                        'var',
                        'media:vetor[1..10] de real',
                        'i:inteiro',
                        'n1,n2:real',
                        'inicio',
                        'para i de 1 ate 10 faca',
                        '     escreval ("Digite o par de notas do ",i,"º Aluno")',
                        '     leia (n1,n2)',
                        '     media[i]<-(n1+n2)/2',
                        'fimpara',
                        'escreval ("-")',
                        'para i de 1 ate 10 faça',
                        '       escreval ("Media do ",i,"º aluno: ", media[i])',
                        'fimpara',
                        'fimalgoritmo'
                    ], -1);
    
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
    
                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saidasMensagens.includes(saida)).toBeTruthy()
                    }
    
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
    
                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
            });

            describe('Procedimentos', () => {
                it('Sem parâmetros', async () => {
                    const retornoLexador = lexador.mapear([
                        'algoritmo "DetectorPesado"',
                        'var',
                        '    I: inteiro',
                        '    N, Pesado: caractere',
                        '    P, Mai: real',
                        'procedimento Topo',
                        'inicio',
                        '    LimpaTela',
                        '    EscrevaL("-----------------------------------")',
                        '    EscrevaL("D E T E C T O R   D E   P E S A D O")',
                        '    EscrevaL("-----------------------------------")',
                        'fimprocedimento',
                        'inicio',
                        '    Topo',
                        'fimalgoritmo'
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
    
                    let chamadasLimpaTela = 0;
                    interpretador.funcaoLimpaTela = () => {
                        chamadasLimpaTela++;
                    }

                    const _saidas: string[] = [];
                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saidas.push(saida);
                    }
    
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
    
                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(chamadasLimpaTela).toBe(1);
                    expect(_saidas).toHaveLength(3);
                });

                it('Com parâmetros', async () => {
                    const saidasMensagens = ['Digite dois valores: ', 'A variavel escolhida é 3']
                    // Aqui vamos simular a resposta para duas variáveis de `leia()`.
                    const respostas = [
                        "2", "3"
                    ];
                    (interpretador as any).interfaceEntradaSaida = {
                        question: (mensagem: string, callback: Function) => {
                            callback(respostas.pop());
                        }
                    };
    
                    const retornoLexador = lexador.mapear([
                        'algoritmo "semnome"',
                        '// Função :',
                        '// Autor :',
                        '// Data : 27/02/2014',
                        '// Seção de Declarações ',
                        'var',
                        'a,b:inteiro',
                        'procedimento mostranumero (a:inteiro;b:inteiro)',
                        'inicio',
                        '    se a > b entao',
                        '        escreval ("A variavel escolhida é ",a)',
                        '    senao',
                        '        escreval ("A variavel escolhida é ",b)',
                        '    fimse',
                        'fimprocedimento',
                        'inicio',
                        'escreval ("Digite dois valores: ")',
                        'leia (a,b)',
                        'mostranumero (a,b)',
                        '',
                        'fimalgoritmo'
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
    
                    interpretador.funcaoDeRetorno = (saida: any) => {
                        expect(saidasMensagens.includes(saida)).toBeTruthy()
                    }
    
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
    
                    expect(retornoInterpretador.erros).toHaveLength(0);
                });
    
                it('Procedimento com passagem por referência', async () => {
                    const retornoLexador = lexador.mapear([
                        'algoritmo "Exemplo Parametros Referencia"',
                        'var',
                        '   m,n,res: inteiro',
                        '   procedimento soma (x,y: inteiro; var result: inteiro)',
                        '   inicio',
                        '       result <- x + y',
                        '   fimprocedimento',
                        'inicio',
                        '   n <- 4',
                        '   m <- -9',
                        '   soma(n,m,res)',
                        '   escreva(res)',
                        'fimalgoritmo'
                    ], -1);
    
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
    
                    let _saidas = "";
                    interpretador.funcaoDeRetornoMesmaLinha = (saida: string) => {
                        _saidas = String(saida);
                    }
    
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
    
                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toBe("-5");
                });

                it('Issue 89', async () => {
                    const retornoLexador = lexador.mapear([
                        'Algoritmo "ex04_procSomaReferencia_1.0"',
                        'var',
                        '    X, Y: inteiro',
                        '//==================',
                        'Procedimento Soma (A, B: inteiro)',
                        '    inicio',
                        '        A <- A + 1',
                        '        B <- B + 2',
                        '        escreval ("Valor de A = ", A)',
                        '        escreval ("Valor de A = ", B)',
                        '        escreval ("Valor de A + B = ", A + B)',
                        '    fimProcedimento',
                        '//==================',
                        'inicio',
                        '    X <- 4',
                        '    Y <- 8',
                        '    Soma (X, Y)',
                        '    escreval ("valor de X = ", X)',
                        '    escreval ("valor de Y = ", Y)',
                        'fimAlgoritmo'
                    ], -1);
    
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
    
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
    
                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toHaveLength(5);
                    expect(_saidas[0]).toBe("Valor de A = 5");
                    expect(_saidas[1]).toBe("Valor de A = 10");
                    expect(_saidas[2]).toBe("Valor de A + B = 15");
                    expect(_saidas[3]).toBe("valor de X = 4");
                    expect(_saidas[4]).toBe("valor de Y = 8");
                });
            });

            it('Operadores Lógicos', async () => {
                const saidasMensagens = ['A verdadeiro', 'A falso', 'A falso', 'A verdadeiro', 'B falso', 'C verdadeiro']
                const retornoLexador = lexador.mapear([
                    'algoritmo "Exemplo Xou"',
                    'var A, B, C, resultA, resultB, resultC: logico',
                    'inicio',
                    'A <- verdadeiro',
                    'B <- verdadeiro',
                    'C <- falso',
                    'resultA <- A ou B',
                    'escreval("A ", resultA)',
                    'resultA <- A xou B',
                    'escreval("A ", resultA)',
                    'resultA <- nao B',
                    'escreval("A ", resultA)',
                    'resultB <- B',
                    'resultA <- (A e B) ou (A xou B)',
                    'resultB <- (A ou B) e (A e C)',
                    'resultC <- A ou C e B xou A e nao B',
                    'escreval("A ", resultA)',
                    'escreval("B ", resultB)',
                    'escreval("C ", resultC)',
                    'fimalgoritmo'
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                interpretador.funcaoDeRetorno = (saida: string) => {
                    expect(saidasMensagens.includes(saida)).toBeTruthy()
                }

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Aleatorio', async () => {
                const retornoLexador = lexador.mapear([
                    'algoritmo "declaração aleatorio on"',
                    'var',
                    'numero: inteiro',
                    'inicio',
                    'aleatorio on',
                    'leia(numero)',
                    'fimalgoritmo'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            describe('Impressão de resultados formatados', () => {
                it('Uma casa decimal, dez espaços à frente', async () => {
                    let _saidas = '';
                    const retornoLexador = lexador.mapear([
                        'algoritmo "X SOMA"',
                        'var',
                        '    x, SOMA: inteiro',
                        'inicio',
                        '    x <- 0',
                        '    SOMA <- 0',
                        '    para x de 1 ate 6 faca',
                        '        SOMA <- x + 1',
                        '    fimpara',
                        '    escreval("x: ", x:10:1, "  SOMA:", soma)',
                        'fimalgoritmo'
                    ], -1);
    
                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saidas += saida;
                    }
    
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
    
                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toContain('x:          6,0');
                });

                it('Duas ou mais casas decimais', async () => {
                    let _saidas = '';
                    // Aqui vamos simular a resposta para duas variáveis de `leia()`.
                    const respostas = [
                        "2", "50", "65"
                    ];
                    (interpretador as any).interfaceEntradaSaida = {
                        question: (mensagem: string, callback: Function) => {
                            callback(respostas.shift());
                        }
                    };

                    const retornoLexador = lexador.mapear([
                        'algoritmo "conversor"',
                        'var',
                        '    mre, dol : real',
                        '    cont, num : inteiro',
                        'inicio',
                        '    cont <- 1',
                        '    escreval("Quantas vezes você quer converter: ")',
                        '    leia(num)',
                        '    enquanto (cont <= num) faca',
                        '        escreval("Qual o valor em R$: ")',
                        '        leia(mre)',
                        '        dol <- mre / 5.47',
                        '        escreval("Você tem US$",dol:5:2, " dólares")',
                        '        cont <- cont + 1',
                        '    fimenquanto',
                        '    escreval("Conversão Finalizada!")',
                        'fimalgoritmo'
                    ], -1);

                    interpretador.funcaoDeRetorno = (saida: any) => {
                        _saidas += saida;
                    }
    
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
    
                    expect(retornoInterpretador.erros).toHaveLength(0);
                    expect(_saidas).toContain('9,14');
                    expect(_saidas).toContain('11,88');
                });
            });

            it('Sucesso - Registro', async () => {
                // Aqui vamos simular a resposta para duas variáveis de `leia()`.
                const respostas = [
                    "1", "Descrição 1", "2", "Descrição 2", "3", "Descrição 3", "4", "Descrição 4"
                ];
                (interpretador as any).interfaceEntradaSaida = {
                    question: (mensagem: string, callback: Function) => {
                        callback(respostas.shift());
                    }
                };

                let _saidas = '';
                const retornoLexador = lexador.mapear(
                    [
                        `algoritmo "teste registro"`,
                        `Tipo deposito = registro`,
                        `    codigo: inteiro`,
                        `    descricao: caractere`,
                        `Fimregistro`,
                        `Var`,
                        `    testeProduto: deposito`,
                        `    produto: vetor[1..3] de deposito`,
                        `    i: inteiro`,
                        `Inicio`,
                        `    leia(testeProduto.codigo)`,
                        `    leia(testeProduto.descricao)`,
                        `    para i de 1 ate 3 faca`,
                        `        escreva("CODIGO DO PRODUTO: ")`,
                        `        leia(produto[i].codigo)`,
                        `        escreva("DESCRIÇÃO DO PRODUTO: ")`,
                        `        leia(produto[i].descricao)`,
                        `    fimpara`,
                        `Fimalgoritmo`
                    ], -1);

                interpretador.funcaoDeRetorno = (saida: any) => {
                    _saidas += saida;
                }

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Números Primos', async () => {
                // Aqui vamos simular a resposta para uma variável de `leia()`.
                const respostas = [
                    "50"
                ];
                (interpretador as any).interfaceEntradaSaida = {
                    question: (mensagem: string, callback: Function) => {
                        callback(respostas.shift());
                    }
                };

                let _saidas = '';
                const retornoLexador = lexador.mapear(
                    [
                        `Algoritmo "NumerosPrimos"
                        Var
                            Fatorial,Numero,Primo,Resposta : Inteiro
                            Flag : Logico
                        inicio
                            Limpatela
                            Escreva("Deseja até que número primo: ")
                            leia(Numero)
                            Escreval(" ")
                            Escreva(" 1")   // montagem
                            Para Primo de 2 ate Numero faca
                                Fatorial<- 2
                                Flag <- Falso
                                enquanto (Primo<>fatorial) faca
                                    Resposta <- Primo MOD Fatorial
                                    Fatorial <- Fatorial + 1
                                    se Resposta = 0 entao
                                        Flag <- Verdadeiro
                                    fimse
                                fimenquanto
                                se (Nao Flag) entao
                                    escreva(" , ",Primo)
                                fimse
                            fimpara
                            Escreval(" ")
                        Fimalgoritmo`
                    ], -1);

                interpretador.funcaoDeRetorno = (saida: any) => {
                    _saidas += saida;
                }

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Cobaias', async () => {
                // Aqui vamos simular a resposta para cinco variáveis de `leia()`.
                const respostas = [
                    "2", "10", "C", "15", "R"
                ];
                (interpretador as any).interfaceEntradaSaida = {
                    question: (mensagem: string, callback: Function) => {
                        callback(respostas.shift());
                    }
                };

                let _saidas = '';
                const retornoLexador = lexador.mapear(
                    [
                        `Algoritmo "experiencias"
                        Var

                            x, i, n, rato, sapo, coelho, totalQ, quantidade : inteiro
                            pRato, pCoelho, pSapo : real
                            animal : caractere

                        Inicio

                            escreva("Quantos casos de teste serao digitados? ")
                            leia(n)

                            para i de 1 ate n faca
                                escreva("Quantidade de cobaias: ")
                                leia(quantidade)
                                totalQ <- totalQ + quantidade

                                escreva("Tipo de cobaia: ")
                                leia(animal)

                                escolha animal
                                caso "C"
                                    coelho <- coelho + quantidade
                                caso "S"
                                    sapo <- sapo + quantidade
                                caso "R"
                                    rato <- rato + quantidade
                                outrocaso
                                    escreval("Opção Inválida")
                                fimescolha

                            fimpara

                            pCoelho <- coelho / totalQ * 100
                            pSapo <- sapo / totalQ * 100
                            pRato <- rato / totalQ * 100

                            escreval()
                            escreval("RELATÓRIO FINAL:")
                            escreval("Total: ", totalQ)
                            escreval("Total de Coelhos: ", coelho)
                            escreval("Total de Ratos: ", rato)
                            escreval("Total de Sapos: ", sapo)
                            escreval()
                            escreval("Percentual de Coelhos: ", pCoelho:4:2,"%")
                            escreval("Percentual de Sapos: ", pSapo:4:2,"%")
                            escreval("Percentual de Ratos: ", pRato:4:2,"%")

                        Fimalgoritmo`
                    ], -1);

                interpretador.funcaoDeRetorno = (saida: any) => {
                    _saidas += saida;
                }

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });
        });
    });
});
