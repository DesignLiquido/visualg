import {
    Atribuir,
    Chamada,
    FormatacaoEscrita,
    FuncaoConstruto,
    Leia,
    Literal,
    Variavel,
    Vetor,
} from '@designliquido/delegua/construtos';
import {
    Declaracao,
    EscrevaMesmaLinha,
    Expressao,
    FuncaoDeclaracao,
    Retorna,
    Var,
} from '@designliquido/delegua/declaracoes';

import { AnalisadorSemanticoBase } from '@designliquido/delegua/analisador-semantico/analisador-semantico-base';
import { SimboloInterface } from '@designliquido/delegua/interfaces';
import { DiagnosticoAnalisadorSemantico, DiagnosticoSeveridade } from '@designliquido/delegua/interfaces/erros';
import { FuncaoHipoteticaInterface } from '@designliquido/delegua/interfaces/funcao-hipotetica-interface';
import { RetornoAnalisadorSemantico } from '@designliquido/delegua/interfaces/retornos/retorno-analisador-semantico';
import { VariavelHipoteticaInterface } from '@designliquido/delegua/interfaces/variavel-hipotetica-interface';
import { RetornoQuebra } from '@designliquido/delegua/quebras';
import { TipoDadosElementar } from '@designliquido/delegua/tipo-dados-elementar';

import { PilhaVariaveis } from './pilha-variaveis';
import { Aleatorio } from '../declaracoes';

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

    adicionarDiagnostico(
        simbolo: SimboloInterface,
        mensagem: string,
        severidade: DiagnosticoSeveridade = DiagnosticoSeveridade.ERRO
    ): void {
        this.diagnosticos.push({
            simbolo: simbolo,
            mensagem: mensagem,
            hashArquivo: simbolo.hashArquivo,
            linha: simbolo.linha,
            severidade: severidade,
        });
    }

    visitarExpressaoDeAtribuicao(expressao: Atribuir) {
        const { alvo, valor } = expressao;
        // Provavelmente o alvo é sempre `Variavel`
        const alvoVariavel: Variavel = alvo as Variavel;

        let variavel = this.variaveis[alvoVariavel.simbolo.lexema];
        if (!variavel) {
            this.adicionarDiagnostico(alvoVariavel.simbolo, `Variável ${alvoVariavel.simbolo.lexema} ainda não foi declarada.`);
            return Promise.resolve();
        }

        if (variavel.tipo) {
            if (valor instanceof Literal && variavel.tipo.includes('[]')) {
                this.adicionarDiagnostico(
                    alvoVariavel.simbolo,
                    `Atribuição inválida, esperado tipo '${variavel.tipo}' na atribuição.`
                );
                return Promise.resolve();
            }
            if (valor instanceof Vetor && !variavel.tipo.includes('[]')) {
                this.adicionarDiagnostico(
                    alvoVariavel.simbolo,
                    `Atribuição inválida, esperado tipo '${variavel.tipo}' na atribuição.`
                );
                return Promise.resolve();
            }

            if (valor instanceof Literal) {
                let valorLiteral = typeof (valor as Literal).valor;
                if (!['qualquer'].includes(variavel.tipo)) {
                    if (valorLiteral === 'string') {
                        if (variavel.tipo.toLowerCase() != 'caractere') {
                            this.adicionarDiagnostico(alvoVariavel.simbolo, `Esperado tipo '${variavel.tipo}' na atribuição.`);
                            return Promise.resolve();
                        }
                    }
                    if (valorLiteral === 'number') {
                        if (!['inteiro', 'real'].includes(variavel.tipo.toLowerCase())) {
                            this.adicionarDiagnostico(alvoVariavel.simbolo, `Esperado tipo '${variavel.tipo}' na atribuição.`);
                            return Promise.resolve();
                        }
                    }
                }
            }
        }

        if (variavel) {
            this.variaveis[alvoVariavel.simbolo.lexema].valor = valor;
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
        // Valores padrão para mínimo e máximo.
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
            tipo: declaracao.tipo as TipoDadosElementar,
            valor:
                declaracao.inicializador !== null
                    ? declaracao.inicializador.valor !== undefined
                        ? declaracao.inicializador.valor
                        : declaracao.inicializador
                    : undefined,
            valorDefinido: true,
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
            if (parametro.hasOwnProperty('tipoDado') && !parametro.tipoDado) {
                this.adicionarDiagnostico(
                    declaracao.simbolo,
                    `O tipo '${parametro.tipoDado}' não é valido`
                );
            }
        }

        if (declaracao.funcao.parametros.length >= 255) {
            this.adicionarDiagnostico(declaracao.simbolo, 'Não pode haver mais de 255 parâmetros');
        }

        this.funcoes[declaracao.simbolo.lexema] = {
            valor: declaracao.funcao,
        };

        // TODO: Ao inspecionar corpo da função, verificar se todas as
        // declarações `Retorna` retornam um tipo diferente do tipo da função
        // (se for função).

        return Promise.resolve();
    }

    visitarDeclaracaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha) {
        declaracao.argumentos.forEach((argumento: FormatacaoEscrita) => {
            if (argumento.expressao instanceof Variavel) {
                if (!this.variaveis[argumento.expressao.simbolo.lexema]) {
                    this.adicionarDiagnostico(
                        argumento.expressao.simbolo,
                        `Variável '${argumento.expressao.simbolo.lexema}' não existe.`
                    );
                    return Promise.resolve();
                }

                if (this.variaveis[argumento.expressao.simbolo.lexema]?.valor === undefined) {
                    this.adicionarDiagnostico(
                        argumento.expressao.simbolo,
                        `Variável '${argumento.expressao.simbolo.lexema}' não foi inicializada.`,
                        DiagnosticoSeveridade.AVISO
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
                this.adicionarDiagnostico(variavel.simbolo, `Função '${variavel.simbolo.lexema}' não foi declarada.`);
                return Promise.resolve();
            }

            const funcao = funcaoChamada.valor as FuncaoConstruto;
            if (funcao.parametros.length != expressao.argumentos.length) {
                this.adicionarDiagnostico(
                    variavel.simbolo,
                    `Esperava ${funcao.parametros.length} ${
                        funcao.parametros.length > 1 ? 'argumentos' : 'argumento'
                    }, mas obteve ${expressao.argumentos.length}.`
                );
            }

            for (let [indice, argumento] of expressao.argumentos.entries()) {
                const parametroCorrespondente = funcao.parametros[indice];
                const tipoDadoParametro = parametroCorrespondente.tipoDado.toLowerCase();

                if (argumento instanceof Variavel) {
                    const lexemaVariavelCorrespondente = (argumento as Variavel).simbolo.lexema;
                    const tipoVariavelCorrespondente = this.variaveis[lexemaVariavelCorrespondente].tipo.toLowerCase();

                    if (tipoVariavelCorrespondente !== tipoDadoParametro) {
                        this.adicionarDiagnostico(
                            variavel.simbolo,
                            `O tipo do valor passado para o parâmetro '${parametroCorrespondente.nome.lexema}' (${tipoVariavelCorrespondente}) é diferente do esperado pela função (${tipoDadoParametro}).`
                        );
                    }
                }

                if (argumento instanceof Literal) {
                    switch (argumento.valor.constructor.name) {
                        case 'Number':
                            if (!['inteiro', 'real'].includes(tipoDadoParametro)) {
                                this.adicionarDiagnostico(
                                    variavel.simbolo,
                                    `O tipo do valor passado para o parâmetro '${parametroCorrespondente.nome.lexema}' (inteiro ou real) é diferente do esperado pela função (${tipoDadoParametro}).`
                                );
                            }
                            break;
                        // TODO: Finalizar.
                    }
                }
            }
        }

        return Promise.resolve();
    }

    visitarExpressaoLeia(declaracao: Leia): Promise<any> {
        for (let argumento of declaracao.argumentos) {
            const argumentoComoVariavel = argumento as Variavel;
            // TODO: Reabilitar na próxima versão do núcleo de Delégua.
            // this.variaveis[argumentoComoVariavel.simbolo.lexema].valorDefinido = true;
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
