import {
    Atribuir,
    Chamada,
    FormatacaoEscrita,
    FuncaoConstruto,
    Literal,
    Variavel,
    Vetor,
} from '@designliquido/delegua/fontes/construtos';
import {
    Aleatorio,
    Declaracao,
    EscrevaMesmaLinha,
    Expressao,
    FuncaoDeclaracao,
    Leia,
    Retorna,
    Var,
} from '@designliquido/delegua/fontes/declaracoes';

import { AnalisadorSemanticoBase } from '@designliquido/delegua/fontes/analisador-semantico/analisador-semantico-base';
import { SimboloInterface } from '@designliquido/delegua/fontes/interfaces';
import { DiagnosticoAnalisadorSemantico, DiagnosticoSeveridade } from '@designliquido/delegua/fontes/interfaces/erros';
import { FuncaoHipoteticaInterface } from '@designliquido/delegua/fontes/interfaces/funcao-hipotetica-interface';
import { RetornoAnalisadorSemantico } from '@designliquido/delegua/fontes/interfaces/retornos/retorno-analisador-semantico';
import { VariavelHipoteticaInterface } from '@designliquido/delegua/fontes/interfaces/variavel-hipotetica-interface';

import { PilhaVariaveis } from './pilha-variaveis';
import { RetornoQuebra } from '@designliquido/delegua/fontes/quebras';

export class AnalisadorSemanticoVisuAlg extends AnalisadorSemanticoBase {
    pilhaVariaveis: PilhaVariaveis;
    variaveis: { [nomeVariavel: string]: VariavelHipoteticaInterface };
    funcoes: { [nomeFuncao: string]: FuncaoHipoteticaInterface };
    atual: number;
    diagnosticos: DiagnosticoAnalisadorSemantico[];

    constructor() {
        super();
        this.pilhaVariaveis = new PilhaVariaveis();
        this.variaveis = {};
        this.funcoes = {};
        this.atual = 0;
        this.diagnosticos = [];
    }

    erro(simbolo: SimboloInterface, mensagem: string): void {
        this.diagnosticos.push({
            simbolo: simbolo,
            mensagem: mensagem,
            hashArquivo: simbolo.hashArquivo,
            linha: simbolo.linha,
            severidade: DiagnosticoSeveridade.ERRO,
        });
    }

    aviso(simbolo: SimboloInterface, mensagem: string): void {
        this.diagnosticos.push({
            simbolo: simbolo,
            mensagem: mensagem,
            hashArquivo: simbolo.hashArquivo,
            linha: simbolo.linha,
            severidade: DiagnosticoSeveridade.AVISO,
        });
    }

    visitarExpressaoDeAtribuicao(expressao: Atribuir) {
        const { simbolo, valor } = expressao;
        let variavel = this.variaveis[simbolo.lexema];
        if (!variavel) {
            this.erro(simbolo, `Variável ${simbolo.lexema} ainda não foi declarada.`);
            return Promise.resolve();
        }

        if (variavel.tipo) {
            if (valor instanceof Literal && variavel.tipo.includes('[]')) {
                this.erro(simbolo, `Atribuição inválida, esperado tipo '${variavel.tipo}' na atribuição.`);
                return Promise.resolve();
            }
            if (valor instanceof Vetor && !variavel.tipo.includes('[]')) {
                this.erro(simbolo, `Atribuição inválida, esperado tipo '${variavel.tipo}' na atribuição.`);
                return Promise.resolve();
            }

            if (valor instanceof Literal) {
                let valorLiteral = typeof (valor as Literal).valor;
                if (!['qualquer'].includes(variavel.tipo)) {
                    if (valorLiteral === 'string') {
                        if (variavel.tipo.toLowerCase() != 'caractere') {
                            this.erro(simbolo, `Esperado tipo '${variavel.tipo}' na atribuição.`);
                            return Promise.resolve();
                        }
                    }
                    if (valorLiteral === 'number') {
                        if (!['inteiro', 'real'].includes(variavel.tipo.toLowerCase())) {
                            this.erro(simbolo, `Esperado tipo '${variavel.tipo}' na atribuição.`);
                            return Promise.resolve();
                        }
                    }
                }
            }
        }

        if (variavel) {
            this.variaveis[simbolo.lexema].valor = valor;
        }
    }

    private gerarNumeroAleatorio(min: number, max: number) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    private encontrarLeiaNoAleatorio(declaracao: Declaracao, menorNumero: number, maiorNumero: number) {
        if ('declaracoes' in declaracao) {
            // Se a declaração tiver um campo 'declaracoes', ela é um Bloco
            const declaracoes = declaracao.declaracoes as Declaracao[];
            for (const subDeclaracao of declaracoes) {
                this.encontrarLeiaNoAleatorio(subDeclaracao, menorNumero, maiorNumero);
            }
        } else if (declaracao instanceof Leia) {
            // Se encontrarmos um Leia, podemos efetuar as operações imediatamente
            for (const argumento of declaracao.argumentos) {
                this.atualizarVariavelComValorAleatorio(argumento as Variavel, menorNumero, maiorNumero);
            }
        }
    }

    private atualizarVariavelComValorAleatorio(variavel: Variavel, menorNumero: number, maiorNumero: number) {
        if (this.variaveis[variavel.simbolo.lexema]) {
            let valor: number | string = 0;
            if (
                this.variaveis[variavel.simbolo.lexema].tipo.toLowerCase() === 'inteiro' ||
                this.variaveis[variavel.simbolo.lexema].tipo.toLowerCase() === 'real'
            )
                valor = this.gerarNumeroAleatorio(menorNumero, maiorNumero);
            else if (this.variaveis[variavel.simbolo.lexema].tipo.toLowerCase() === 'caracter')
                valor = this.palavraAleatoriaCom5Digitos();

            this.variaveis[variavel.simbolo.lexema].valor = valor;
        }
    }

    private palavraAleatoriaCom5Digitos(): string {
        const caracteres = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let palavra = '';

        for (let i = 0; i < 5; i++) {
            const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
            palavra += caracteres.charAt(indiceAleatorio);
        }
        return palavra;
    }

    visitarDeclaracaoAleatorio(declaracao: Aleatorio): Promise<any> {
        //Isso acontece quando não é informado os número máximos e mínimos
        let menorNumero = 0;
        let maiorNumero = 100;

        if (declaracao.argumentos) {
            menorNumero = Math.min(declaracao.argumentos.min, declaracao.argumentos.max);
            maiorNumero = Math.max(declaracao.argumentos.min, declaracao.argumentos.max);
        }

        for (let corpoDeclaracao of declaracao.corpo.declaracoes) {
            this.encontrarLeiaNoAleatorio(corpoDeclaracao, menorNumero, maiorNumero);
        }

        return Promise.resolve();
    }

    visitarDeclaracaoVar(declaracao: Var): Promise<any> {
        this.variaveis[declaracao.simbolo.lexema] = {
            imutavel: false,
            tipo: declaracao.tipo,
            valor:
                declaracao.inicializador !== null
                    ? declaracao.inicializador.valor !== undefined
                        ? declaracao.inicializador.valor
                        : declaracao.inicializador
                    : undefined,
        };
        return Promise.resolve();
    }

    visitarDeclaracaoDeExpressao(declaracao: Expressao) {
        switch (declaracao.expressao.constructor.name) {
            case 'Atribuir':
                this.visitarExpressaoDeAtribuicao(declaracao.expressao as Atribuir);
                break;
            case 'Chamada':
                this.visitarExpressaoDeChamada(declaracao.expressao as Chamada);
                break;
            default:
                console.log(declaracao.expressao);
                break;
        }

        return Promise.resolve();
    }

    visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao) {
        for (let parametro of declaracao.funcao.parametros) {
            if (parametro.hasOwnProperty('tipoDado') && !parametro.tipoDado.tipo) {
                this.erro(declaracao.simbolo, `O tipo '${parametro.tipoDado.tipoInvalido}' não é valido`);
            }
        }

        if (declaracao.funcao.tipoRetorno === undefined) {
            this.erro(declaracao.simbolo, `Declaração de retorno da função é inválida`);
        }

        if (declaracao.funcao.parametros.length >= 255) {
            this.erro(declaracao.simbolo, 'Não pode haver mais de 255 parâmetros');
        }

        this.funcoes[declaracao.simbolo.lexema] = {
            valor: declaracao.funcao,
        };

        return Promise.resolve();
    }

    visitarDeclaracaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha) {
        declaracao.argumentos.forEach((argumento: FormatacaoEscrita) => {
            if (argumento.expressao instanceof Variavel) {
                if (!this.variaveis[argumento.expressao.simbolo.lexema]) {
                    this.erro(
                        argumento.expressao.simbolo,
                        `Variável '${argumento.expressao.simbolo.lexema}' não existe.`
                    );
                    return Promise.resolve();
                }

                if (this.variaveis[argumento.expressao.simbolo.lexema]?.valor === undefined) {
                    this.aviso(
                        argumento.expressao.simbolo,
                        `Variável '${argumento.expressao.simbolo.lexema}' não foi inicializada.`
                    );
                }
            }
        });

        return Promise.resolve();
    }

    visitarExpressaoDeChamada(expressao: Chamada) {
        if (expressao.entidadeChamada instanceof Variavel) {
            const variavel = expressao.entidadeChamada as Variavel;
            const funcaoChamada = this.variaveis[variavel.simbolo.lexema] || this.funcoes[variavel.simbolo.lexema];
            if (!funcaoChamada) {
                this.erro(variavel.simbolo, `Função '${variavel.simbolo.lexema}' não foi declarada.`);
                return Promise.resolve();
            }
            const funcao = funcaoChamada.valor as FuncaoConstruto;
            if (funcao.parametros.length != expressao.argumentos.length) {
                this.erro(
                    variavel.simbolo,
                    `Esperava ${funcao.parametros.length} ${
                        funcao.parametros.length > 1 ? 'argumentos' : 'argumento'
                    }, mas obteve ${expressao.argumentos.length}.`
                );
            }

            for (let [indice, argumentoFuncao] of funcao.parametros.entries()) {
                const argumentoChamada = expressao.argumentos[indice];
                if (argumentoChamada) {
                    if (
                        argumentoFuncao.tipoDado?.tipo.toLowerCase() === 'caracter' &&
                        typeof argumentoChamada.valor !== 'string'
                    ) {
                        this.erro(
                            variavel.simbolo,
                            `O tipo do valor passado para o parâmetro '${argumentoFuncao.nome.lexema}' (${argumentoFuncao.tipoDado.nome}) é diferente do esperado pela função.`
                        );
                    } else if (
                        ['inteiro', 'real'].includes(argumentoFuncao.tipoDado?.tipo.toLowerCase()) &&
                        typeof argumentoChamada.valor !== 'number'
                    ) {
                        this.erro(
                            variavel.simbolo,
                            `O tipo do valor passado para o parâmetro '${argumentoFuncao.nome.lexema}' (${argumentoFuncao.tipoDado.nome}) é diferente do esperado pela função.`
                        );
                    }
                }
            }
        }
        return Promise.resolve();
    }

    visitarExpressaoRetornar(declaracao: Retorna): Promise<RetornoQuebra> {
        return Promise.resolve(null);
    }

    analisar(declaracoes: Declaracao[]): RetornoAnalisadorSemantico {
        this.variaveis = {};
        this.atual = 0;
        this.diagnosticos = [];
        while (this.atual < declaracoes.length) {
            declaracoes[this.atual].aceitar(this);
            this.atual++;
        }

        return {
            diagnosticos: this.diagnosticos,
        } as RetornoAnalisadorSemantico;
    }
}
