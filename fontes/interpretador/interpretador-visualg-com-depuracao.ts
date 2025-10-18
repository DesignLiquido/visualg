import * as _ from 'lodash';

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
    Logico,
} from '@designliquido/delegua/construtos';
import {
    EscrevaMesmaLinha,
    Escreva,
    Fazer,
    Para,
    Bloco,
    CabecalhoPrograma,
    Classe,
    Var,
    FuncaoDeclaracao,
    Expressao,
} from '@designliquido/delegua/declaracoes';
import { ContinuarQuebra, Quebra, SustarQuebra } from '@designliquido/delegua/quebras';
import { InterpretadorBaseComDepuracao } from '@designliquido/delegua/interpretador/depuracao/interpretador-base-com-depuracao';
import { TipoEscopoExecucao } from '@designliquido/delegua/interfaces/escopo-execucao';

import { carregarBibliotecaGlobalCaracter, carregarBibliotecaGlobalNumerica } from './comum';
import { PilhaEscoposExecucaoVisuAlg } from './pilha-escopos-execucao-visualg';
import { InterpretadorVisuAlgInterface } from '../interfaces';
import { LimpaTela } from '../construtos';
import { Aleatorio } from '../declaracoes';

import * as comum from './comum';

/**
 * Interpretador com depuração para o dialeto VisuAlg.
 */
export class InterpretadorVisuAlgComDepuracao
    extends InterpretadorBaseComDepuracao
    implements InterpretadorVisuAlgInterface
{
    proximoEscopo?: TipoEscopoExecucao;
    mensagemPrompt: string;
    tiposConhecidos: string[];
    deveEscreverPrompt: boolean;
    funcaoLimpaTela: Function = () => {
        console.log('Função "limpa()" não está ligada a uma interface de entrada e saída.');
    };

    constructor(
        diretorioBase: string,
        funcaoDeRetorno: Function = null,
        funcaoDeRetornoMesmaLinha: Function = null,
        funcaoLimpaTela: Function = null
    ) {
        super(diretorioBase, funcaoDeRetorno, funcaoDeRetornoMesmaLinha);

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

    async visitarExpressaoLimpaTela(expressao: LimpaTela): Promise<any> {
        this.funcaoLimpaTela();
        return Promise.resolve();
    }

    async visitarDeclaracaoInicioAlgoritmo(declaracao: CabecalhoPrograma): Promise<any> {
        return comum.visitarDeclaracaoInicioAlgoritmo(this, declaracao);
    }

    async visitarDeclaracaoCabecalhoPrograma(declaracao: CabecalhoPrograma): Promise<any> {
        return comum.visitarDeclaracaoCabecalhoPrograma(this, declaracao);
    }

    override async visitarDeclaracaoClasse(declaracao: Classe): Promise<any> {
        return comum.visitarDeclaracaoClasse(this, declaracao);
    }

    override async visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao): Promise<void> {
        return comum.visitarDeclaracaoDefinicaoFuncao(this, declaracao);
    }

    async visitarExpressaoAcessoElementoMatriz(expressao: AcessoElementoMatriz): Promise<any> {
        return await comum.visitarExpressaoAcessoElementoMatriz(this, expressao);
    }

    async visitarExpressaoAtribuicaoPorIndicesMatriz(expressao: AtribuicaoPorIndicesMatriz): Promise<any> {
        return await comum.visitarExpressaoAtribuicaoPorIndicesMatriz(this, expressao);
    }

    private async avaliarArgumentosEscrevaVisuAlg(argumentos: Construto[]): Promise<string> {
        let formatoTexto: string = '';

        for (const argumento of argumentos) {
            const resultadoAvaliacao = await this.avaliar(argumento);
            let valor = resultadoAvaliacao?.hasOwnProperty('valor') ? resultadoAvaliacao.valor : resultadoAvaliacao;

            formatoTexto += `${this.paraTexto(valor)}`;
        }

        return formatoTexto;
    }

    /**
     * No VisuAlg, o bloco executa se a condição for falsa.
     * Por isso a reimplementação aqui.
     * @param declaracao A declaração `Fazer`
     * @returns Só retorna em caso de erro na execução, e neste caso, o erro.
     */
    override async visitarDeclaracaoFazer(declaracao: Fazer): Promise<any> {
        let retornoExecucao: any;
        do {
            try {
                retornoExecucao = await this.executar(declaracao.caminhoFazer);
                if (retornoExecucao instanceof ContinuarQuebra) {
                    retornoExecucao = null;
                }
            } catch (erro: any) {
                return Promise.reject(erro);
            }
        } while (
            !(retornoExecucao instanceof Quebra) &&
            !this.eVerdadeiro(await this.avaliar(declaracao.condicaoEnquanto))
        );
    }

    override async visitarDeclaracaoVar(declaracao: Var): Promise<any> {
        return comum.visitarDeclaracaoVar(this, declaracao);
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

    async visitarExpressaoFimPara(declaracao: FimPara): Promise<any> {
        if (!this.eVerdadeiro(await this.avaliar(declaracao.condicaoPara))) {
            const escopoPara = this.pilhaEscoposExecucao.pilha[this.pilhaEscoposExecucao.pilha.length - 2];
            // Como o comando `proximo` ocorre fora de um laço de repetição que incrementa
            // a declaração atual do escopo, precisamos incrementar a declaração atual
            // do escopo do `para`. Normalmente, `FimPara` é sempre a última instrução
            // desse bloco de `para`.
            // TODO: Avaliar se há algum caso que pode ser afetado por esta lógica.
            // Este `if` foi retirado antes, e pode ser que algum outro bug surja por causa disso.
            if (this.comando === 'proximo') {
                escopoPara.declaracaoAtual++;
            }

            escopoPara.emLacoRepeticao = false;
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

    override async visitarDeclaracaoPara(declaracao: Para): Promise<any> {
        if (!declaracao.inicializada && declaracao.inicializador !== null) {
            await this.avaliar(declaracao.inicializador as any);
            if (declaracao.incrementar !== null) {
                await comum.resolverIncrementoPara(this, declaracao);
            }
        }

        declaracao.inicializada = true;

        // Aqui precisamos clonar a declaração `Para` porque inserimos
        // ao final dela o incremento. Diferente de declarações `Para` de
        // outros dialetos, o incremento dessa declaração é implícito.
        const cloneDeclaracao = _.cloneDeep(declaracao) as Para;
        const corpoExecucao = cloneDeclaracao.corpo as Bloco;
        // O incremento vai ao final do bloco de escopo.
        if (cloneDeclaracao.incrementar !== null) {
            await comum.resolverIncrementoPara(this, cloneDeclaracao);
            corpoExecucao.declaracoes.push(new Expressao(cloneDeclaracao.incrementar));
        }

        const escopoAtual = this.pilhaEscoposExecucao.topoDaPilha();
        switch (this.comando) {
            case 'proximo':
                if (
                    cloneDeclaracao.condicao !== null &&
                    this.eVerdadeiro(await this.avaliar(cloneDeclaracao.condicao))
                ) {
                    escopoAtual.emLacoRepeticao = true;

                    const resultadoBloco = this.executarBloco(corpoExecucao.declaracoes);
                    return resultadoBloco;
                }

                escopoAtual.emLacoRepeticao = false;
                declaracao.inicializada = false;
                return null;
            default:
                let retornoExecucao: any;
                while (!(retornoExecucao instanceof Quebra) && !this.pontoDeParadaAtivo) {
                    if (
                        cloneDeclaracao.condicao !== null &&
                        !this.eVerdadeiro(await this.avaliar(cloneDeclaracao.condicao))
                    ) {
                        break;
                    }

                    try {
                        retornoExecucao = await this.executar(corpoExecucao);
                        if (retornoExecucao instanceof SustarQuebra) {
                            declaracao.inicializada = false;
                            return null;
                        }

                        if (retornoExecucao instanceof ContinuarQuebra) {
                            declaracao.inicializada = false;
                            retornoExecucao = null;
                        }
                    } catch (erro: any) {
                        return Promise.reject(erro);
                    }
                }

                declaracao.inicializada = false;
                return retornoExecucao;
        }
    }

    override async visitarExpressaoAcessoIndiceVariavel(expressao: AcessoIndiceVariavel): Promise<any> {
        return comum.visitarExpressaoAcessoIndiceVariavel(this, expressao);
    }

    override async visitarExpressaoAtribuicaoPorIndice(expressao: AtribuicaoPorIndice): Promise<any> {
        return comum.visitarExpressaoAtribuicaoPorIndice(this, expressao);
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
