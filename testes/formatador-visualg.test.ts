import * as sistemaOperacional from 'os';

import { FormatadorVisuAlg } from '../fontes/formatador/formatador';
import { LexadorVisuAlg } from '../fontes/lexador';
import { AvaliadorSintaticoVisuAlg } from '../fontes/avaliador-sintatico';

describe('Formatador', () => {
    const formatadorVisuAlg = new FormatadorVisuAlg(sistemaOperacional.EOL);
    const avaliadorSintatico = new AvaliadorSintaticoVisuAlg();
    const lexador = new LexadorVisuAlg();

    it('Olá mundo', () => {
        const retornoLexador = lexador.mapear([
            'algoritmo "olá mundo"',
            'inicio',
            'escreva("Olá mundo")',
            'fimalgoritmo'
        ], -1);

        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL)

        expect(linhasResultado).toHaveLength(5);
    });

    it('Variáveis', () => {
        const retornoLexador = lexador.mapear([
            'algoritmo "teste"',
            'var',
            'numero: inteiro',
            'inicio',
            '    escreval("Aline")',
            'fimalgoritmo'
        ], -1);

        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);

        expect(linhasResultado).toHaveLength(7);
    });

    it('Aleatorio - Números', () => {
        const retornoLexador = lexador.mapear(
            [
                'algoritmo "Exemplo Xou"',
                'var',
                'numero: inteiro',
                'inicio',
                'aleatorio 1, 6',
                'leia(numero)',
                'fimalgoritmo',
            ],
            -1
        );

        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes)
        const linhasResultado = resultado.split(sistemaOperacional.EOL)

        expect(linhasResultado).toHaveLength(8);
        expect(retornoAvaliadorSintatico).toBeTruthy();
        expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(4);
    });

    it('Lendo variaveis', () => {
        const retornoLexador = lexador.mapear([
            'algoritmo "Soma dos números"',
            'var',
            'numero1: inteiro',
            'numero2: inteiro',
            'inicio',
            'escreva("Digite o primeiro número: ")',
            'leia(numero1)',
            'leia(numero2)',
            'escreva("Digite o segundo número: ")',
            'escreva("A soma de ", numero1 , "por " , numero2 , "é igual à: " , numero1 , numero2)',
            'fimalgoritmo'
        ], -1);

        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL)

        expect(linhasResultado).toHaveLength(12);
    })

    it('Atribuição', () => {
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

        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes);

        const linhasResultado = resultado.split(sistemaOperacional.EOL)
        expect(linhasResultado).toHaveLength(11);
    })

    it('Enquanto', () => {
        const retornoLexador = lexador.mapear(
            [
                'algoritmo "Números de 1 a 10 (com enquanto...faca)"',
                'var j: inteiro',
                'inicio',
                'j <- 1',
                'enquanto j <= 10 faca',
                'escreva (j)',
                'j <- j + 1',
                'fimenquanto',
                'fimalgoritmo',
            ],
            -1
        );

        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes);

        const linhasResultado = resultado.split(sistemaOperacional.EOL)
        expect(linhasResultado).toHaveLength(11);
    })

    it('Escolha', () => {
        const retornoLexador = lexador.mapear(
            [
                'algoritmo "Times"',
                'var time: caractere',
                'inicio',
                'escreva ("Entre com o nome de um time de futebol: ")',
                'leia (time)',
                'escolha time',
                'caso "Flamengo", "Fluminense", "Vasco", "Botafogo"',
                'escreval ("É um time carioca.")',
                'caso "São Paulo", "Palmeiras", "Santos", "Corínthians"',
                'escreval ("É um time paulista.")',
                'outrocaso',
                'escreval ("É de outro estado.")',
                'fimescolha',
                'fimalgoritmo',
            ],
            -1
        );
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes);

        const linhasResultado = resultado.split(sistemaOperacional.EOL)
        expect(linhasResultado).toHaveLength(16);
    });

    it('Função', () => {
        const retornoLexador = lexador.mapear(
            [
                'Algoritmo "exemplo-funcoes"',
                'Var',
                'n: inteiro',
                'm: inteiro',
                'res: inteiro',
                'Inicio',
                'funcao soma: inteiro',
                'var aux: inteiro',
                'inicio',
                'aux <- n + m',
                'retorne aux',
                'fimfuncao',
                'n <- 4',
                'm <- -9',
                'res <- soma',
                'escreva(res)',
                'Fimalgoritmo',
            ],
            -1
        );

        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);

        expect(linhasResultado).toHaveLength(21);
        expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
    });

    it('Interrompa', () => {
        const retornoLexador = lexador.mapear(
            [
                'algoritmo "Números de 1 a 10 (com interrompa)"',
                'var x: inteiro',
                'inicio',
                'x <- 0',
                'repita',
                '   x <- x + 1',
                '   escreva (x)',
                '   se x = 10 entao',
                '      interrompa',
                '   fimse',
                'ate falso',
                'fimalgoritmo',
            ],
            -1
        );
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes)
        const linhasResultado = resultado.split(sistemaOperacional.EOL)

        expect(linhasResultado).toHaveLength(13);
        expect(retornoAvaliadorSintatico).toBeTruthy();
        expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(5);
    });

    it('Leia', () => {
        const retornoLexador = lexador.mapear(
            [
                'Algoritmo "Soma 5"',
                'Var',
                '   n1, n2, n3, n4, n5: inteiro',
                'Inicio',
                '      leia(n1, n2, n3, n4, n5)',
                '      escreva(n1 + n2 + n3 + n4 + n5)',
                'Fimalgoritmo'
            ],
            -1
        );

        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes)
        const linhasResultado = resultado.split(sistemaOperacional.EOL)

        expect(linhasResultado).toHaveLength(12);

        expect(retornoAvaliadorSintatico).toBeTruthy();
        expect(retornoAvaliadorSintatico.declaracoes.length).toBeGreaterThan(0);
    });

    it('Para', () => {
        const retornoLexador = lexador.mapear(
            [
                'algoritmo "Numeros de 1 a 10"',
                'var j: inteiro',
                'inicio',
                '    para j de 1 ate 10 faca',
                '        escreva(j)',
                '    fimpara',
                'fimalgoritmo',
            ],
            -1
        );
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes)
        const linhasResultado = resultado.split(sistemaOperacional.EOL)

        expect(linhasResultado).toHaveLength(9);
        expect(retornoAvaliadorSintatico).toBeTruthy();
        expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(4);
    });

    it('Procedimento', () => {
        const retornoLexador = lexador.mapear(
            [
                'algoritmo "semnome"',
                'var',
                'a,b:inteiro',
                'procedimento mostranumero (a:inteiro;b:inteiro)',
                'inicio',
                'se a > b entao',
                '     escreval ("A variavel escolhida é ",a)',
                'senao',
                '     escreval ("A variavel escolhida é ",b)',
                'fimse',
                'fimprocedimento',
                'inicio',
                'escreval ("Digite dois valores: ")',
                'leia (a,b)',
                'mostranumero (a,b)',
                '',
                'fimalgoritmo',
            ],
            -1
        );
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);

        expect(linhasResultado).toHaveLength(17);
        expect(retornoAvaliadorSintatico).toBeTruthy();
        expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(8);
        expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
    });

    it('Repita', () => {
        const retornoLexador = lexador.mapear(
            [
                'algoritmo "Números de 1 a 10 (com repita)"',
                'var j: inteiro',
                'inicio',
                'j <- 1',
                'repita',
                '   escreva (j)',
                '   j <- j + 1',
                'ate j > 10',
                'fimalgoritmo',
            ],
            -1
        );
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);

        expect(retornoAvaliadorSintatico).toBeTruthy();
        expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(5);
        expect(linhasResultado).toHaveLength(10);
    });

    it('XOU', () => {
        const retornoLexador = lexador.mapear(
            [
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
                'fimalgoritmo',
            ],
            -1
        );
        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes);
        const linhasResultado = resultado.split(sistemaOperacional.EOL);

        expect(linhasResultado.length).toBeGreaterThanOrEqual(20);
        expect(retornoAvaliadorSintatico).toBeTruthy();
        expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(24);
    });

    it('LimpaTela', () => {
        const retornoLexador = lexador.mapear(
            [
                'algoritmo "teste limpatela"',
                'inicio',
                'limpatela',
                'escreval("Tela limpa")',
                'fimalgoritmo'
            ],
            -1
        );

        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toContain('limpatela');
        expect(retornoAvaliadorSintatico).toBeTruthy();
    });

    it('Comentários', () => {
        const retornoLexador = lexador.mapear(
            [
                'algoritmo "teste comentários"',
                '// Este é um comentário',
                'var x: inteiro',
                'inicio',
                'x <- 5 // comentário inline',
                'escreval(x)',
                '// outro comentário',
                'fimalgoritmo'
            ],
            -1
        );

        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toContain('// ');
        expect(retornoAvaliadorSintatico).toBeTruthy();
    });

    it('Agrupamento com parênteses', () => {
        const retornoLexador = lexador.mapear(
            [
                'algoritmo "teste agrupamento"',
                'var resultado: inteiro',
                'inicio',
                'resultado <- (2 + 3) * 4',
                'escreval(resultado)',
                'fimalgoritmo'
            ],
            -1
        );

        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toContain('(');
        expect(resultado).toContain(')');
        expect(retornoAvaliadorSintatico).toBeTruthy();
    });

    it('Chamada de função', () => {
        const retornoLexador = lexador.mapear(
            [
                'algoritmo "teste chamada"',
                'var x: inteiro',
                'funcao dobro(n: inteiro): inteiro',
                'inicio',
                'retorne n * 2',
                'fimfuncao',
                'inicio',
                'x <- dobro(5)',
                'escreval(x)',
                'fimalgoritmo'
            ],
            -1
        );

        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toContain('dobro');
        expect(resultado).toContain('funcao');
        expect(retornoAvaliadorSintatico).toBeTruthy();
    });

    it('Acesso a índice de vetor', () => {
        const retornoLexador = lexador.mapear(
            [
                'algoritmo "teste vetor"',
                'var v: vetor[1..5] de inteiro',
                'var x: inteiro',
                'inicio',
                'x <- v[1]',
                'escreval(x)',
                'fimalgoritmo'
            ],
            -1
        );

        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toContain('[');
        expect(resultado).toContain(']');
        expect(retornoAvaliadorSintatico).toBeTruthy();
    });

    it('Literais - Boolean false e números', () => {
        const retornoLexador = lexador.mapear(
            [
                'algoritmo "teste literais"',
                'var a: logico',
                'var b: inteiro',
                'var c: real',
                'inicio',
                'a <- falso',
                'b <- 42',
                'c <- 3.14',
                'escreval(a, b, c)',
                'fimalgoritmo'
            ],
            -1
        );

        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toContain('falso');
        expect(resultado).toContain('42');
        expect(resultado).toContain('3.14');
        expect(retornoAvaliadorSintatico).toBeTruthy();
    });

    it('Operadores binários - Módulo', () => {
        const retornoLexador = lexador.mapear(
            [
                'algoritmo "teste modulo"',
                'var resto: inteiro',
                'inicio',
                'resto <- 10 % 3',
                'escreval(resto)',
                'fimalgoritmo'
            ],
            -1
        );

        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toContain('%');
        expect(retornoAvaliadorSintatico).toBeTruthy();
    });

    it('Operadores binários - Divisão inteira', () => {
        const retornoLexador = lexador.mapear(
            [
                'algoritmo "teste divisão inteira"',
                'var resultado: inteiro',
                'inicio',
                'resultado <- 10 \\ 3',
                'escreval(resultado)',
                'fimalgoritmo'
            ],
            -1
        );

        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes);

        expect(retornoAvaliadorSintatico).toBeTruthy();
    });

    it('Operador menor', () => {
        const retornoLexador = lexador.mapear(
            [
                'algoritmo "teste menor"',
                'var x: inteiro',
                'inicio',
                'se 5 < 10 entao',
                '    x <- 1',
                'fimse',
                'escreval(x)',
                'fimalgoritmo'
            ],
            -1
        );

        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toContain('<');
        expect(retornoAvaliadorSintatico).toBeTruthy();
    });

    it('Expressão unária - Negação antes', () => {
        const retornoLexador = lexador.mapear(
            [
                'algoritmo "teste unário"',
                'var x: inteiro',
                'var y: logico',
                'inicio',
                'x <- -5',
                'y <- nao verdadeiro',
                'escreval(x, y)',
                'fimalgoritmo'
            ],
            -1
        );

        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toContain('-');
        expect(resultado).toContain('nao');
        expect(retornoAvaliadorSintatico).toBeTruthy();
    });

    it('Expressão unária - Subtração com variável', () => {
        const retornoLexador = lexador.mapear(
            [
                'algoritmo "teste unário"',
                'var x, y: inteiro',
                'inicio',
                'x <- 5',
                'y <- -x',
                'escreval(y)',
                'fimalgoritmo'
            ],
            -1
        );

        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toContain('-');
        expect(retornoAvaliadorSintatico).toBeTruthy();
    });

    it('Se com senao', () => {
        const retornoLexador = lexador.mapear(
            [
                'algoritmo "teste se senao"',
                'var x: inteiro',
                'inicio',
                'x <- 5',
                'se x > 10 entao',
                '    escreval("maior")',
                'senao',
                '    escreval("menor")',
                'fimse',
                'fimalgoritmo'
            ],
            -1
        );

        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toContain('senao');
        expect(resultado).toContain('fimse');
        expect(retornoAvaliadorSintatico).toBeTruthy();
    });

    it('Escolha com caso vazio', () => {
        const retornoLexador = lexador.mapear(
            [
                'algoritmo "teste escolha caso vazio"',
                'var opcao: inteiro',
                'inicio',
                'opcao <- 1',
                'escolha opcao',
                'caso 1',
                '    escreval("um")',
                'caso 2',
                '    escreval("dois")',
                'outrocaso',
                'fimescolha',
                'fimalgoritmo'
            ],
            -1
        );

        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toContain('escolha');
        expect(resultado).toContain('caso');
        expect(resultado).not.toContain('outrocaso');
        expect(retornoAvaliadorSintatico).toBeTruthy();
    });

    it('EscrevaMesmaLinha - escreva sem quebra de linha', () => {
        const retornoLexador = lexador.mapear(
            [
                'algoritmo "teste escreva"',
                'inicio',
                'escreva("Digite: ")',
                'fimalgoritmo'
            ],
            -1
        );

        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toContain('escreva(');
        expect(retornoAvaliadorSintatico).toBeTruthy();
    });

    it('Escreva vazio', () => {
        const retornoLexador = lexador.mapear(
            [
                'algoritmo "teste escreval vazio"',
                'inicio',
                'escreval()',
                'fimalgoritmo'
            ],
            -1
        );

        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toContain('escreval');
        expect(retornoAvaliadorSintatico).toBeTruthy();
    });

    it('Aleatorio ON', () => {
        const retornoLexador = lexador.mapear(
            [
                'algoritmo "teste aleatorio on"',
                'var x: inteiro',
                'inicio',
                'aleatorio ON',
                'leia(x)',
                'fimalgoritmo'
            ],
            -1
        );

        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toContain('aleatorio ON');
        expect(retornoAvaliadorSintatico).toBeTruthy();
    });

    it('Função sem parâmetros', () => {
        const retornoLexador = lexador.mapear(
            [
                'algoritmo "teste funcao sem parametros"',
                'funcao retornaCinco: inteiro',
                'inicio',
                'retorne 5',
                'fimfuncao',
                'inicio',
                'escreval(retornaCinco)',
                'fimalgoritmo'
            ],
            -1
        );

        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toContain('funcao retornacinco');
        expect(resultado).toContain('retorne');
        expect(retornoAvaliadorSintatico).toBeTruthy();
    });

    it('Procedimento sem parâmetros', () => {
        const retornoLexador = lexador.mapear(
            [
                'algoritmo "teste procedimento sem parametros"',
                'procedimento saudacao',
                'inicio',
                'escreval("Olá")',
                'fimprocedimento',
                'inicio',
                'saudacao',
                'fimalgoritmo'
            ],
            -1
        );

        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toContain('procedimento saudacao');
        expect(resultado).toContain('fimprocedimento');
        expect(retornoAvaliadorSintatico).toBeTruthy();
    });

    it('Retorno sem valor', () => {
        const retornoLexador = lexador.mapear(
            [
                'algoritmo "teste retorno sem valor"',
                'procedimento teste',
                'inicio',
                'escreval("teste")',
                'retorne',
                'fimprocedimento',
                'inicio',
                'teste',
                'fimalgoritmo'
            ],
            -1
        );

        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toContain('retorne');
        expect(retornoAvaliadorSintatico).toBeTruthy();
    });

    it('Operadores lógicos - E', () => {
        const retornoLexador = lexador.mapear(
            [
                'algoritmo "teste e logico"',
                'var resultado: logico',
                'inicio',
                'resultado <- verdadeiro e falso',
                'escreval(resultado)',
                'fimalgoritmo'
            ],
            -1
        );

        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toContain(' e ');
        expect(retornoAvaliadorSintatico).toBeTruthy();
    });

    it('Múltiplas variáveis em Var sem inicialização', () => {
        const retornoLexador = lexador.mapear(
            [
                'algoritmo "teste var"',
                'var x, y, z: inteiro',
                'inicio',
                'x <- 1',
                'escreval(x)',
                'fimalgoritmo'
            ],
            -1
        );

        const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = formatadorVisuAlg.formatar(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toContain('var');
        expect(retornoAvaliadorSintatico).toBeTruthy();
    });
});