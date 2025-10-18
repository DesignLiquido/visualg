import {
    AcessoElementoMatriz,
    AcessoIndiceVariavel,
    AtribuicaoPorIndice,
    AtribuicaoPorIndicesMatriz,
    Binario,
    Construto,
    FimPara,
    FormatacaoEscrita,
    Leia,
    Logico
} from '@designliquido/delegua/construtos';
import {
    CabecalhoPrograma,
    Classe,
    Escreva,
    EscrevaMesmaLinha,
    Fazer,
    FuncaoDeclaracao,
    Para,
    Var,
} from '@designliquido/delegua/declaracoes';
import { InterpretadorBase } from '@designliquido/delegua/interpretador';
import { ContinuarQuebra, Quebra, RetornoQuebra, SustarQuebra } from '@designliquido/delegua/quebras';
import { TipoEscopoExecucao } from '@designliquido/delegua/interfaces/escopo-execucao';

import { carregarBibliotecaGlobalCaracter, carregarBibliotecaGlobalNumerica } from './comum';
import { PilhaEscoposExecucaoVisuAlg } from './pilha-escopos-execucao-visualg';
import { InterpretadorVisuAlgInterface } from '../interfaces';
import { LimpaTela } from '../construtos';

import { Aleatorio } from '../declaracoes';

import * as comum from './comum';

/**
 * Interpretador do VisuAlg, baseado no interpretador de Delégua.
 */
export class InterpretadorVisuAlg extends InterpretadorBase implements InterpretadorVisuAlgInterface {
    proximoEscopo?: TipoEscopoExecucao;
    mensagemPrompt: string;
    tiposConhecidos: string[];
    deveEscreverPrompt: boolean;
    funcaoLimpaTela: Function = () => {
        console.log('Função "limpa()" não está ligada a uma interface de entrada e saída.');
    };

    constructor(
        diretorioBase: string,
        performance = false,
        funcaoDeRetorno: Function = null,
        funcaoDeRetornoMesmaLinha: Function = null,
        funcaoLimpaTela: Function = null
    ) {
        super(diretorioBase, performance, funcaoDeRetorno, funcaoDeRetornoMesmaLinha);

        if (funcaoLimpaTela !== null) {
            this.funcaoLimpaTela = funcaoLimpaTela;
        }

        this.pilhaEscoposExecucao = new PilhaEscoposExecucaoVisuAlg();
        this.mensagemPrompt = '> ';
        // Por padrão, a escrita de prompt fica desabilitada.
        // Se precisar escrever no prompt (por exemplo, em uma aplicação web usando `window.prompt`),
        // basta reabilitar este parâmetro.
        this.deveEscreverPrompt = false;
        this.tiposConhecidos = [];

        carregarBibliotecaGlobalCaracter(this.pilhaEscoposExecucao);
        carregarBibliotecaGlobalNumerica(this.pilhaEscoposExecucao);
    }

    override resolverValor(objeto: any) {
        return comum.resolverValor(objeto);
    }

    visitarExpressaoLimpaTela(expressao: LimpaTela): void | Promise<any> {
        this.funcaoLimpaTela();
        return Promise.resolve();
    }

    async visitarDeclaracaoInicioAlgoritmo(declaracao: CabecalhoPrograma): Promise<any> {
        return comum.visitarDeclaracaoInicioAlgoritmo(this, declaracao);
    }

    async visitarDeclaracaoCabecalhoPrograma(declaracao: CabecalhoPrograma): Promise<any> {
        return comum.visitarDeclaracaoCabecalhoPrograma(this, declaracao);
    }

    override async visitarExpressaoAcessoElementoMatriz(expressao: AcessoElementoMatriz): Promise<any> {
        return await comum.visitarExpressaoAcessoElementoMatriz(this, expressao);
    }

    override async visitarExpressaoAtribuicaoPorIndice(expressao: AtribuicaoPorIndice): Promise<any> {
        return comum.visitarExpressaoAtribuicaoPorIndice(this, expressao);
    }

    override async visitarExpressaoAcessoIndiceVariavel(expressao: AcessoIndiceVariavel): Promise<any> {
        return comum.visitarExpressaoAcessoIndiceVariavel(this, expressao);
    }

    override async visitarExpressaoAtribuicaoPorIndicesMatriz(expressao: AtribuicaoPorIndicesMatriz): Promise<any> {
        return await comum.visitarExpressaoAtribuicaoPorIndicesMatriz(this, expressao);
    }

    /**
     * O Interpretador VisuAlg possui algumas diferenças em relação ao
     * Interpretador Delégua quanto à escrita na saída.
     * Para N argumentos, Delégua inclui um espaço entre cada argumento.
     * Já VisuAlg imprime todos os argumentos concatenados.
     */
    private async avaliarArgumentosEscrevaVisuAlg(argumentos: Construto[]): Promise<string> {
        let formatoTexto: string = '';

        for (const argumento of argumentos) {
            const resultadoAvaliacao = await this.avaliar(argumento);
            let valor = this.resolverValor(resultadoAvaliacao);

            formatoTexto += `${this.paraTexto(valor)}`;
        }

        return formatoTexto;
    }

    /**
     * Execução de uma escrita na saída configurada, que pode ser `console` (padrão) ou
     * alguma função para escrever numa página Web.
     * @param declaracao A declaração.
     * @returns Sempre nulo, por convenção de visita.
     */
    override async visitarDeclaracaoEscreva(declaracao: Escreva): Promise<any> {
        try {
            const formatoTexto: string = await this.avaliarArgumentosEscrevaVisuAlg(declaracao.argumentos);
            this.funcaoDeRetorno(formatoTexto);
            return null;
        } catch (erro: any) {
            this.erros.push(erro);
        }
    }

    /**
     * Execução de uma escrita na saída padrão, sem quebras de linha.
     * Implementada para alguns dialetos, como VisuAlg.
     *
     * Como `readline.question` sobrescreve o que foi escrito antes, aqui
     * definimos `this.mensagemPrompt` para uso com `leia`.
     * No VisuAlg é muito comum usar `escreva()` seguido de `leia()` para
     * gerar um prompt na mesma linha.
     * @param declaracao A declaração.
     * @returns Sempre nulo, por convenção de visita.
     */
    override async visitarDeclaracaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha): Promise<any> {
        try {
            const formatoTexto: string = await this.avaliarArgumentosEscrevaVisuAlg(declaracao.argumentos);
            this.mensagemPrompt = formatoTexto;
            this.funcaoDeRetornoMesmaLinha(formatoTexto);
            return null;
        } catch (erro: any) {
            this.erros.push(erro);
        }
    }

    /**
     * No VisuAlg, o bloco de condição executa se falso.
     * Por isso a reimplementação aqui.
     * @param declaracao A declaração `Fazer`
     * @returns Só retorna em caso de erro na execução, e neste caso, o erro.
     */
    override async visitarDeclaracaoFazer(declaracao: Fazer): Promise<any> {
        let retornoExecucao: any;
        do {
            try {
                retornoExecucao = await this.executar(declaracao.caminhoFazer);
                if (retornoExecucao && retornoExecucao.valorRetornado instanceof ContinuarQuebra) {
                    retornoExecucao = null;
                }
            } catch (erro: any) {
                return Promise.reject(erro);
            }
        } while (
            !(retornoExecucao && retornoExecucao.valorRetornado instanceof Quebra) &&
            !this.eVerdadeiro(await this.avaliar(declaracao.condicaoEnquanto))
        );
    }

    async visitarExpressaoFimPara(declaracao: FimPara): Promise<any> {
        if (!this.eVerdadeiro(await this.avaliar(declaracao.condicaoPara))) {
            // TODO: Código marcado para depreciação. Avaliar situações que ainda precisem dele.
            // const escopoPara = this.pilhaEscoposExecucao.pilha[this.pilhaEscoposExecucao.pilha.length - 2];
            // escopoPara.declaracaoAtual++;
            // escopoPara.emLacoRepeticao = false;
            return new SustarQuebra();
        }

        if (declaracao.incremento === null || declaracao.incremento === undefined) {
            return;
        }

        await this.executar(declaracao.incremento);
    }

    /**
     * Execução da leitura de valores da entrada configurada no
     * início da aplicação.
     * @param expressao Expressão do tipo Leia
     * @returns Promise com o resultado da leitura.
     */
    override async visitarExpressaoLeia(expressao: Leia): Promise<any> {
        return comum.visitarExpressaoLeia(this, expressao, this.mensagemPrompt);
    }

    override async visitarDeclaracaoClasse(declaracao: Classe): Promise<any> {
        return comum.visitarDeclaracaoClasse(this, declaracao);
    }

    override async visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao): Promise<any> {
        return comum.visitarDeclaracaoDefinicaoFuncao(this, declaracao);   
    }

    override async visitarDeclaracaoPara(declaracao: Para): Promise<any> {
        if (declaracao.inicializador !== null) {
            await this.avaliar(declaracao.inicializador as any);
            await comum.resolverIncrementoPara(this, declaracao);
        }

        let retornoExecucao: any;
        let retornoIncremento: any;
        while (!(retornoExecucao && retornoExecucao.valorRetornado instanceof Quebra) && !(retornoIncremento instanceof Quebra)) {
            
            if (declaracao.condicao !== null) {
                const condicaoResolvida = await this.avaliar(declaracao.condicao);
                if (!this.eVerdadeiro(condicaoResolvida)) break;
            }

            try {
                retornoExecucao = await this.executar(declaracao.corpo);
                if (retornoExecucao && retornoExecucao.valorRetornado instanceof SustarQuebra) {
                    return null;
                }

                if (retornoExecucao && retornoExecucao.valorRetornado instanceof ContinuarQuebra) {
                    retornoExecucao = null;
                }
            } catch (erro: any) {
                this.erros.push({
                    erroInterno: erro,
                    linha: declaracao.linha,
                    hashArquivo: declaracao.hashArquivo,
                });
                return Promise.reject(erro);
            }

            if (declaracao.incrementar !== null) {
                retornoIncremento = await this.avaliar(declaracao.incrementar);
            }
        }

        return retornoExecucao;
    }

    override async visitarDeclaracaoVar(declaracao: Var): Promise<any> {
        return comum.visitarDeclaracaoVar(this, declaracao);
    }

    override async visitarExpressaoBinaria(expressao: Binario | any): Promise<any> {
        return comum.visitarExpressaoBinaria(this, expressao);
    }

    override async visitarExpressaoLogica(expressao: Logico): Promise<any> {
        return comum.visitarExpressaoLogica(this, expressao);
    }

    async visitarDeclaracaoAleatorio(declaracao: Aleatorio): Promise<any> {
        return comum.visitarDeclaracaoAleatorio(this, declaracao);
    }

    override async visitarExpressaoFormatacaoEscrita(declaracao: FormatacaoEscrita): Promise<string> {
        return comum.visitarExpressaoFormatacaoEscrita(this, declaracao);
    }
}
