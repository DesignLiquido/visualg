import {
    AcessoElementoMatriz,
    AcessoIndiceVariavel,
    Atribuir,
    Binario,
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
    Fazer,
    FuncaoDeclaracao,
    Para,
    Retorna,
    Var,
} from '@designliquido/delegua/declaracoes';

import { AnalisadorSemanticoBase } from '@designliquido/delegua/analisador-semantico/analisador-semantico-base';
import { EscopoVariavel } from '@designliquido/delegua/analisador-semantico/escopo-variavel';
import { GerenciadorEscopos } from '@designliquido/delegua/analisador-semantico/gerenciador-escopos';
import { ConstrutoInterface, SimboloInterface, RetornoAnalisadorSemanticoInterface } from '@designliquido/delegua/interfaces';
import { FuncaoHipoteticaInterface } from '@designliquido/delegua/interfaces/funcao-hipotetica-interface';
import { RetornoQuebra } from '@designliquido/delegua/quebras';

import { PilhaVariaveis } from './pilha-variaveis';
import { Aleatorio } from '../declaracoes';
import { TipoInferencia } from '@designliquido/delegua/inferenciador';

function ehTipoVetor(tipo: string): boolean {
    if (!tipo) return false;
    return tipo.includes('[]') || /vetor\s*\[.*?\]\s*de\s+\w+/i.test(tipo);
}

export class AnalisadorSemanticoVisuAlg extends AnalisadorSemanticoBase {
    pilhaVariaveis: PilhaVariaveis;
    funcoes: { [nomeFuncao: string]: FuncaoHipoteticaInterface };
    atual: number;

    constructor() {
        super();
        this.gerenciadorEscopos = new GerenciadorEscopos();
        this.pilhaVariaveis = new PilhaVariaveis();
        this.funcoes = {};
        this.atual = 0;
    }

    visitarExpressaoDeAtribuicao(expressao: Atribuir) {
        const { alvo, valor } = expressao;

        // O alvo pode ser uma variável simples ou acesso a vetor/matriz
        if (alvo instanceof Variavel) {
            // Atribuição a variável simples
            const alvoVariavel: Variavel = alvo as Variavel;

            const variavel = this.gerenciadorEscopos.buscar(alvoVariavel.simbolo.lexema);
            if (!variavel) {
                this.erro(
                    alvoVariavel.simbolo,
                    `Variável '${alvoVariavel.simbolo.lexema}' ainda não foi declarada.`
                );
                return Promise.resolve();
            }

            if (variavel.tipo) {
                if (valor instanceof Literal && ehTipoVetor(variavel.tipo)) {
                    this.erro(
                        alvoVariavel.simbolo,
                        `Atribuição inválida, esperado tipo '${variavel.tipo}' na atribuição.`
                    );
                    return Promise.resolve();
                }
                if (valor instanceof Vetor && !ehTipoVetor(variavel.tipo)) {
                    this.erro(
                        alvoVariavel.simbolo,
                        `Atribuição inválida, esperado tipo '${variavel.tipo}' na atribuição.`
                    );
                    return Promise.resolve();
                }

                if (valor instanceof Literal) {
                    let valorLiteral = typeof (valor as Literal).valor;
                    if (!['qualquer'].includes(variavel.tipo)) {
                        if (valorLiteral === 'string') {
                            if (variavel.tipo.toLowerCase() !== 'caractere') {
                                this.erro(
                                    alvoVariavel.simbolo,
                                    `Esperado tipo '${variavel.tipo}' na atribuição.`
                                );
                                return Promise.resolve();
                            }
                        }
                        if (valorLiteral === 'number') {
                            if (!['inteiro', 'real'].includes(variavel.tipo.toLowerCase())) {
                                this.erro(
                                    alvoVariavel.simbolo,
                                    `Esperado tipo '${variavel.tipo}' na atribuição.`
                                );
                                return Promise.resolve();
                            }
                        }
                        if (valorLiteral === 'boolean') {
                            if (variavel.tipo.toLowerCase() !== 'logico') {
                                this.erro(
                                    alvoVariavel.simbolo,
                                    `Esperado tipo '${variavel.tipo}' na atribuição.`
                                );
                                return Promise.resolve();
                            }
                        }
                    }
                }
            }

            // Marcar variável como inicializada com o novo valor
            this.gerenciadorEscopos.marcarComoInicializada(alvoVariavel.simbolo.lexema, valor);
        } else {
            // Atribuição a elemento de vetor/matriz (ex: v[i] <- 10)
            // Marcar todas as variáveis envolvidas no acesso como usadas
            this.marcarVariaveisUsadasEmExpressao(alvo);
        }

        // Marcar variáveis usadas no valor sendo atribuído
        this.marcarVariaveisUsadasEmExpressao(valor);

        return Promise.resolve();
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
        const escopoVariavel = this.gerenciadorEscopos.buscar(variavel.simbolo.lexema);
        if (escopoVariavel) {
            let valor: number | string = 0;
            if (
                escopoVariavel.tipo.toLowerCase() === 'inteiro' ||
                escopoVariavel.tipo.toLowerCase() === 'real'
            )
                valor = this.gerarNumeroAleatorio(menorNumero, maiorNumero);
            else if (escopoVariavel.tipo.toLowerCase() === 'caracter')
                valor = this.palavraAleatoriaCom5Digitos();

            this.gerenciadorEscopos.marcarComoInicializada(variavel.simbolo.lexema, valor);
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
        const escopoVariavel: EscopoVariavel = {
            nome: declaracao.simbolo.lexema,
            tipo: declaracao.tipo as TipoInferencia,
            imutavel: false,
            valor:
                declaracao.inicializador !== null
                    ? declaracao.inicializador.valor !== undefined
                        ? declaracao.inicializador.valor
                        : declaracao.inicializador
                    : undefined,
            inicializada: declaracao.inicializador !== null,
            usada: false,
            hashArquivo: declaracao.simbolo.hashArquivo,
            linha: declaracao.simbolo.linha,
        };

        const declarada = this.gerenciadorEscopos.declarar(declaracao.simbolo.lexema, escopoVariavel);
        if (!declarada) {
            this.erro(declaracao.simbolo, `Variável '${declaracao.simbolo.lexema}' já foi declarada neste escopo.`);
        }

        return Promise.resolve();
    }

    visitarDeclaracaoDeExpressao(declaracao: Expressao) {
        switch (declaracao.expressao.constructor) {
            case Atribuir:
                this.visitarExpressaoDeAtribuicao(declaracao.expressao as Atribuir);
                break;
            case Binario:
                this.visitarExpressaoBinaria(declaracao.expressao);
                break;
            case Chamada:
                this.visitarExpressaoDeChamada(declaracao.expressao as Chamada);
                break;
            case Leia:
                this.visitarExpressaoLeia(declaracao.expressao as Leia);
                break;
            default:
                // Outros tipos de expressão tratados pela classe base ou não necessários para análise semântica
                break;
        }

        return Promise.resolve();
    }

    visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao) {
        for (let parametro of declaracao.funcao.parametros) {
            if (parametro.hasOwnProperty('tipoDado') && !parametro.tipoDado) {
                this.erro(declaracao.simbolo, `O tipo '${parametro.tipoDado}' não é válido`);
            }
        }

        if (declaracao.funcao.parametros.length >= 255) {
            this.erro(declaracao.simbolo, 'Não pode haver mais de 255 parâmetros');
        }

        this.funcoes[declaracao.simbolo.lexema] = {
            valor: declaracao.funcao,
        };

        // Empilhar um novo escopo para a função
        this.gerenciadorEscopos.empilharEscopo();

        // Declarar parâmetros como variáveis no escopo da função
        for (let parametro of declaracao.funcao.parametros) {
            const parametroVariavel: EscopoVariavel = {
                nome: parametro.nome.lexema,
                tipo: parametro.tipoDado || 'qualquer',
                imutavel: parametro.tipoDado?.startsWith('const') || false,
                inicializada: true, // Parâmetros são sempre inicializados
                usada: false,
                hashArquivo: parametro.nome.hashArquivo,
                linha: parametro.nome.linha,
            };
            this.gerenciadorEscopos.declarar(parametro.nome.lexema, parametroVariavel);
        }

        // Visitar corpo da função
        if (declaracao.funcao.corpo && Array.isArray(declaracao.funcao.corpo)) {
            for (let declaracaoCorpo of declaracao.funcao.corpo) {
                declaracaoCorpo.aceitar(this);
            }
        }

        // Validar tipo de retorno para funções (não procedimentos)
        if (declaracao.funcao.tipo && declaracao.funcao.tipo !== 'vazio') {
            const todosRetornam = this.todosOsCaminhosRetornam(declaracao.funcao.corpo);
            if (!todosRetornam) {
                this.aviso(
                    declaracao.simbolo,
                    `Função '${declaracao.simbolo.lexema}' pode não retornar um valor em todos os caminhos.`
                );
            }
        }

        // Desempilhar o escopo da função
        this.gerenciadorEscopos.desempilharEscopo();

        return Promise.resolve();
    }

    visitarDeclaracaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha) {
        declaracao.argumentos.forEach((argumento: FormatacaoEscrita) => {
            if (argumento.expressao instanceof Variavel) {
                const variavel = this.gerenciadorEscopos.buscar(argumento.expressao.simbolo.lexema);
                if (!variavel) {
                    this.erro(
                        argumento.expressao.simbolo,
                        `Variável '${argumento.expressao.simbolo.lexema}' não existe.`
                    );
                    return;
                }

                // Marcar variável como usada
                this.gerenciadorEscopos.marcarComoUsada(argumento.expressao.simbolo.lexema);

                if (!variavel.inicializada) {
                    this.aviso(
                        argumento.expressao.simbolo,
                        `Variável '${argumento.expressao.simbolo.lexema}' não foi inicializada.`
                    );
                }
            }
        });

        return Promise.resolve();
    }

    visitarDeclaracaoPara(declaracao: Para): Promise<any> {
        // Marcar variáveis usadas na condição do loop
        if (declaracao.condicao) {
            this.marcarVariaveisUsadasEmExpressao(declaracao.condicao);
        }

        // Marcar variáveis usadas no incremento
        if (declaracao.incrementar) {
            this.marcarVariaveisUsadasEmExpressao(declaracao.incrementar);
        }

        // Visitar todas as declarações no corpo do loop
        if (declaracao.corpo && declaracao.corpo.declaracoes) {
            for (const declaracaoCorpo of declaracao.corpo.declaracoes) {
                declaracaoCorpo.aceitar(this);
            }
        }

        return Promise.resolve();
    }

    visitarDeclaracaoFazer(declaracao: Fazer): Promise<any> {
        // Marcar variáveis usadas na condição
        if (declaracao.condicaoEnquanto) {
            this.marcarVariaveisUsadasEmExpressao(declaracao.condicaoEnquanto);
        }

        // Visitar todas as declarações no corpo do loop (caminhoFazer)
        if (declaracao.caminhoFazer && declaracao.caminhoFazer.declaracoes) {
            for (const declaracaoCorpo of declaracao.caminhoFazer.declaracoes) {
                declaracaoCorpo.aceitar(this);
            }
        }

        return Promise.resolve();
    }

    visitarExpressaoDeChamada(expressao: Chamada) {
        if (expressao.entidadeChamada instanceof Variavel) {
            const variavel = expressao.entidadeChamada as Variavel;
            const funcaoChamada = this.funcoes[variavel.simbolo.lexema];
            if (!funcaoChamada) {
                this.erro(variavel.simbolo, `Função '${variavel.simbolo.lexema}' não foi declarada.`);
                return Promise.resolve();
            }

            const funcao = funcaoChamada.valor as FuncaoConstruto;
            if (funcao.parametros.length !== expressao.argumentos.length) {
                this.erro(
                    variavel.simbolo,
                    `Esperava ${funcao.parametros.length} ${
                        funcao.parametros.length > 1 ? 'argumentos' : 'argumento'
                    }, mas obteve ${expressao.argumentos.length}.`
                );
            }

            for (let [indice, argumento] of expressao.argumentos.entries()) {
                const parametroCorrespondente = funcao.parametros[indice];
                if (!parametroCorrespondente) continue;

                const tipoDadoParametro = parametroCorrespondente.tipoDado.toLowerCase();

                if (argumento instanceof Variavel) {
                    const lexemaVariavelCorrespondente = (argumento as Variavel).simbolo.lexema;
                    const variavelCorrespondente = this.gerenciadorEscopos.buscar(lexemaVariavelCorrespondente);

                    if (!variavelCorrespondente) {
                        this.erro(
                            argumento.simbolo,
                            `Variável '${lexemaVariavelCorrespondente}' não foi declarada.`
                        );
                        continue;
                    }

                    // Marcar variável como usada
                    this.gerenciadorEscopos.marcarComoUsada(lexemaVariavelCorrespondente);

                    const tipoVariavelCorrespondente = variavelCorrespondente.tipo.toLowerCase();

                    if (tipoVariavelCorrespondente !== tipoDadoParametro) {
                        this.erro(
                            variavel.simbolo,
                            `O tipo do valor passado para o parâmetro '${parametroCorrespondente.nome.lexema}' (${tipoVariavelCorrespondente}) é diferente do esperado pela função (${tipoDadoParametro}).`
                        );
                    }
                }

                if (argumento instanceof Literal) {
                    const valorLiteral = argumento.valor;
                    const tipoLiteral = typeof valorLiteral;

                    switch (tipoLiteral) {
                        case 'number':
                            if (!['inteiro', 'real'].includes(tipoDadoParametro)) {
                                this.erro(
                                    variavel.simbolo,
                                    `O tipo do valor passado para o parâmetro '${parametroCorrespondente.nome.lexema}' (número) é diferente do esperado pela função (${tipoDadoParametro}).`
                                );
                            }
                            break;
                        case 'string':
                            if (tipoDadoParametro !== 'caractere') {
                                this.erro(
                                    variavel.simbolo,
                                    `O tipo do valor passado para o parâmetro '${parametroCorrespondente.nome.lexema}' (caractere) é diferente do esperado pela função (${tipoDadoParametro}).`
                                );
                            }
                            break;
                        case 'boolean':
                            if (tipoDadoParametro !== 'logico') {
                                this.erro(
                                    variavel.simbolo,
                                    `O tipo do valor passado para o parâmetro '${parametroCorrespondente.nome.lexema}' (lógico) é diferente do esperado pela função (${tipoDadoParametro}).`
                                );
                            }
                            break;
                    }
                }
            }
        }

        return Promise.resolve();
    }

    visitarExpressaoLeia(declaracao: Leia): Promise<any> {
        for (let argumento of declaracao.argumentos) {
            // O argumento de leia pode ser uma variável simples ou acesso a vetor/matriz
            if (argumento instanceof Variavel) {
                const variavel = this.gerenciadorEscopos.buscar(argumento.simbolo.lexema);

                if (!variavel) {
                    this.erro(
                        argumento.simbolo,
                        `Variável '${argumento.simbolo.lexema}' não foi declarada.`
                    );
                    continue;
                }

                // Marcar como usada e inicializada (leia atribui um valor)
                this.gerenciadorEscopos.marcarComoUsada(argumento.simbolo.lexema);
                this.gerenciadorEscopos.marcarComoInicializada(argumento.simbolo.lexema);
            } else {
                // Para acesso a vetor/matriz (ex: leia(vet[i])), marcar todas as variáveis envolvidas como usadas
                this.marcarVariaveisUsadasEmExpressao(argumento);
            }
        }

        return Promise.resolve();
    }

    visitarExpressaoDeVariavel(expressao: Variavel): Promise<any> {
        // Marcar variável como usada quando referenciada
        this.gerenciadorEscopos.marcarComoUsada(expressao.simbolo.lexema);
        return Promise.resolve();
    }

    visitarExpressaoBinaria(expressao: any): Promise<any> {
        const { esquerda, direita, operador } = expressao;

        // Verificar operandos recursivamente
        if (esquerda) {
            if (esquerda instanceof Variavel) {
                this.visitarExpressaoDeVariavel(esquerda);
            } else if (esquerda.hasOwnProperty('esquerda')) {
                // É outra expressão binária
                this.visitarExpressaoBinaria(esquerda);
            }
        }

        if (direita) {
            if (direita instanceof Variavel) {
                this.visitarExpressaoDeVariavel(direita);
            } else if (direita.hasOwnProperty('esquerda')) {
                // É outra expressão binária
                this.visitarExpressaoBinaria(direita);
            }
        }

        // Verificar divisão por zero
        if (operador && (operador.lexema === '/' || operador.lexema === 'mod')) {
            const valorDireita = this.avaliarExpressaoConstante(direita);
            if (valorDireita === 0) {
                this.erro(
                    operador,
                    `Divisão por zero detectada.`
                );
            }
        }

        return Promise.resolve();
    }

    /**
     * Marca recursivamente todas as variáveis usadas em uma expressão.
     */
    protected marcarVariaveisUsadasEmExpressao(expressao: ConstrutoInterface): void {
        if (expressao instanceof Variavel) {
            this.gerenciadorEscopos.marcarComoUsada(expressao.simbolo.lexema);
        } else if (expressao instanceof Binario) {
            this.marcarVariaveisUsadasEmExpressao(expressao.esquerda);
            this.marcarVariaveisUsadasEmExpressao(expressao.direita);
        } else if (expressao instanceof Chamada) {
            // Marcar variáveis nos argumentos da chamada
            for (const argumento of expressao.argumentos) {
                this.marcarVariaveisUsadasEmExpressao(argumento);
            }
        } else if (expressao instanceof AcessoIndiceVariavel) {
            // Marcar o vetor e o índice como usados
            this.marcarVariaveisUsadasEmExpressao(expressao.entidadeChamada);
            this.marcarVariaveisUsadasEmExpressao(expressao.indice);
        } else if (expressao instanceof AcessoElementoMatriz) {
            // Marcar a matriz e os índices como usados
            this.marcarVariaveisUsadasEmExpressao(expressao.entidadeChamada);
            this.marcarVariaveisUsadasEmExpressao(expressao.indicePrimario);
            this.marcarVariaveisUsadasEmExpressao(expressao.indiceSecundario);
        } else if ('esquerda' in expressao && 'direita' in expressao) {
            // Outras expressões binárias
            this.marcarVariaveisUsadasEmExpressao((expressao as any).esquerda);
            this.marcarVariaveisUsadasEmExpressao((expressao as any).direita);
        }
    }

    /**
     * Tenta avaliar uma expressão em tempo de compilação para detectar valores constantes.
     * Retorna o valor se puder ser determinado, ou `null` caso contrário.
     */
    private avaliarExpressaoConstante(expressao: ConstrutoInterface): number | null {
        if (expressao instanceof Literal) {
            const valor = expressao.valor;
            return typeof valor === 'number' ? valor : null;
        }

        if (expressao instanceof Binario) {
            const esquerda = this.avaliarExpressaoConstante(expressao.esquerda);
            const direita = this.avaliarExpressaoConstante(expressao.direita);

            if (esquerda !== null && direita !== null && expressao.operador) {
                return this.calcularOperacaoBinaria(esquerda, direita, expressao.operador.lexema);
            }
        }

        return null;
    }

    /**
     * Calcula o resultado de uma operação binária em tempo de compilação.
     */
    private calcularOperacaoBinaria(esquerda: number, direita: number, operador: string): number | null {
        switch (operador) {
            case '+':
                return esquerda + direita;
            case '-':
                return esquerda - direita;
            case '*':
                return esquerda * direita;
            case '/':
                return direita !== 0 ? esquerda / direita : null;
            case 'mod':
                return direita !== 0 ? esquerda % direita : null;
            case '^':
                return Math.pow(esquerda, direita);
            default:
                return null;
        }
    }

    visitarExpressaoRetornar(declaracao: Retorna): Promise<RetornoQuebra> {
        // Marcar variáveis usadas na expressão de retorno
        if (declaracao.valor) {
            this.marcarVariaveisUsadasEmExpressao(declaracao.valor);
        }
        return Promise.resolve(null);
    }

    /**
     * Verifica se há variáveis declaradas mas não usadas e emite avisos.
     */
    private verificarVariaveisNaoUsadas(): void {
        const variaveisNaoUsadas = this.gerenciadorEscopos.obterVariaveisNaoUsadas();
        for (const variavel of variaveisNaoUsadas) {
            this.aviso(
                {
                    lexema: variavel.nome,
                    hashArquivo: variavel.hashArquivo,
                    linha: variavel.linha
                } as SimboloInterface,
                `Variável '${variavel.nome}' foi declarada mas nunca usada.`
            );
        }
    }

    async analisar(declaracoes: Declaracao[]): Promise<RetornoAnalisadorSemanticoInterface> {
        this.funcoes = {};
        this.atual = 0;
        this.diagnosticos = [];

        // Inicializar escopo global
        this.gerenciadorEscopos.empilharEscopo();

        // Analisar todas as declarações
        while (this.atual < declaracoes.length) {
            await declaracoes[this.atual].aceitar(this);
            this.atual++;
        }

        // Verificar variáveis não usadas
        this.verificarVariaveisNaoUsadas();

        // Limpar escopo global
        this.gerenciadorEscopos.desempilharEscopo();

        return {
            diagnosticos: this.diagnosticos,
        } as RetornoAnalisadorSemanticoInterface;
    }
}
