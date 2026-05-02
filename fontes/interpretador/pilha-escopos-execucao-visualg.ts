import { EscopoExecucaoInterface } from '@designliquido/delegua/interfaces/escopo-execucao';
import { PilhaEscoposExecucaoInterface } from '@designliquido/delegua/interfaces/pilha-escopos-execucao-interface';
import { SimboloInterface, VariavelInterface } from '@designliquido/delegua/interfaces';
import { Simbolo } from '@designliquido/delegua/lexador';
import { ErroEmTempoDeExecucao } from '@designliquido/delegua/excecoes';
import { DescritorTipoClasse } from '@designliquido/delegua/interpretador/estruturas';
import { EspacoMemoria } from '@designliquido/delegua/interpretador/espaco-memoria';
import { TipoInferencia } from '@designliquido/delegua/inferenciador';

import { inferirTipoVariavel } from './inferenciador';
import { VisuAlgFuncao } from './estruturas';

export class PilhaEscoposExecucaoVisuAlg implements PilhaEscoposExecucaoInterface {
    pilha: EscopoExecucaoInterface[];

    constructor() {
        this.pilha = [];
        const escopoExecucao: EscopoExecucaoInterface = {
            declaracoes: [],
            declaracaoAtual: 0,
            espacoMemoria: new EspacoMemoria(),
            finalizado: false,
            tipo: 'outro',
            emLacoRepeticao: false,
        };
        this.empilhar(escopoExecucao);
    }

    migrarReferenciaMontaoParaEscopoDeVariavel(nomeVariavel: string, enderecoMontao: string): void {
        throw new Error('Método não implementado.');
    }

    registrarReferenciaMontao(endereco: string): void {
        throw new Error('Método não implementado.');
    }

    obterTodasDeclaracoesClasse() {
        throw new Error('Método não implementado.');
    }

    obterReferenciaFuncao(idFuncao: string): VisuAlgFuncao {
        throw new Error('Método não implementado.');
    }

    registrarReferenciaFuncao(idFuncao: string, funcao: VisuAlgFuncao): void {
        throw new Error('Método não implementado.');
    }

    empilhar(item: EscopoExecucaoInterface): void {
        this.pilha.push(item);
    }

    eVazio(): boolean {
        return this.pilha.length === 0;
    }

    elementos(): number {
        return this.pilha.length;
    }

    naPosicao(posicao: number): EscopoExecucaoInterface {
        return this.pilha[posicao];
    }

    topoDaPilha(): EscopoExecucaoInterface {
        if (this.eVazio()) throw new Error('Pilha vazia.');
        return this.pilha[this.pilha.length - 1];
    }

    removerUltimo(): EscopoExecucaoInterface {
        if (this.eVazio()) throw new Error('Pilha vazia.');
        return this.pilha.pop();
    }

    private converterValor(tipo: string, valor: any) {
        switch ((tipo || '').toLowerCase()) {
            case 'inteiro':
                return parseInt(valor);
            case 'lógico':
                return Boolean(valor);
            case 'real':
                return Number(valor);
            case 'texto':
                return String(valor);
            default:
                return valor;
        }
    }

    definirConstante(nomeConstante: string, valor: any, tipo?: string): void {
        const nomeNormalizado = nomeConstante.toLowerCase();
        const constante = this.pilha[this.pilha.length - 1].espacoMemoria.valores[nomeNormalizado];

        let tipoConstante;
        if (constante && constante.hasOwnProperty('tipo')) {
            tipoConstante = constante.tipo;
        } else if (tipo) {
            tipoConstante = tipo;
        } else {
            tipoConstante = inferirTipoVariavel(valor);
        }

        let elementoAlvo: VariavelInterface = {
            valor: this.converterValor(tipo, valor),
            tipo: tipoConstante,
            subtipo: undefined,
            imutavel: true,
        };

        this.pilha[this.pilha.length - 1].espacoMemoria.valores[nomeNormalizado] = elementoAlvo;
    }

    definirVariavel(nomeVariavel: string, valor: any, tipo?: string) {
        const nomeNormalizado = nomeVariavel.toLowerCase();
        const variavel = this.pilha[this.pilha.length - 1].espacoMemoria.valores[nomeNormalizado];

        let tipoVariavel;
        if (variavel && variavel.hasOwnProperty('tipo')) {
            tipoVariavel = variavel.tipo;
        } else if (tipo) {
            tipoVariavel = tipo;
        } else {
            tipoVariavel = inferirTipoVariavel(valor);
        }

        let elementoAlvo: VariavelInterface = {
            valor: this.converterValor(tipo, valor),
            tipo: tipoVariavel,
            subtipo: undefined,
            imutavel: false,
        };

        this.pilha[this.pilha.length - 1].espacoMemoria.valores[nomeNormalizado] = elementoAlvo;
    }

    atribuirVariavelEm(distancia: number, simbolo: any, valor: any): void {
        const nomeNormalizado = simbolo.lexema.toLowerCase();
        const espacoMemoriaAncestral = this.pilha[this.pilha.length - distancia].espacoMemoria;
        if (espacoMemoriaAncestral.valores[nomeNormalizado].imutavel) {
            throw new ErroEmTempoDeExecucao(simbolo, `Constante '${simbolo.lexema}' não pode receber novos valores.`);
        }
        espacoMemoriaAncestral.valores[nomeNormalizado] = {
            valor,
            tipo: inferirTipoVariavel(valor),
            imutavel: false,
        };
    }

    atribuirVariavel(simbolo: SimboloInterface, valor: any) {
        const nomeNormalizado = simbolo.lexema.toLowerCase();
        for (let i = 1; i <= this.pilha.length; i++) {
            const espacoMemoria = this.pilha[this.pilha.length - i].espacoMemoria;
            if (espacoMemoria.valores[nomeNormalizado] !== undefined) {
                const variavel = espacoMemoria.valores[nomeNormalizado];
                if (variavel.imutavel) {
                    throw new ErroEmTempoDeExecucao(
                        simbolo,
                        `Constante '${simbolo.lexema}' não pode receber novos valores.`
                    );
                }
                const tipo = (
                    variavel && variavel.hasOwnProperty('tipo') ? variavel.tipo : inferirTipoVariavel(valor)
                ).toLowerCase() as TipoInferencia;

                const valorResolvido = this.converterValor(tipo, valor);
                espacoMemoria.valores[nomeNormalizado] = {
                    valor: valorResolvido,
                    tipo,
                    imutavel: false,
                };
                return;
            }
        }

        throw new ErroEmTempoDeExecucao(simbolo, "Variável não definida '" + simbolo.lexema + "'.");
    }

    obterEscopoPorTipo(tipo: string): EscopoExecucaoInterface | undefined {
        for (let i = 1; i <= this.pilha.length; i++) {
            const escopoAtual = this.pilha[this.pilha.length - i];
            if (escopoAtual.tipo === tipo) {
                return escopoAtual;
            }
        }

        return undefined;
    }

    obterVariavelEm(distancia: number, nome: string): VariavelInterface {
        const nomeNormalizado = nome.toLowerCase();
        const espacoMemoriaAncestral = this.pilha[this.pilha.length - distancia].espacoMemoria;
        return espacoMemoriaAncestral.valores[nomeNormalizado];
    }

    obterValorVariavel(simbolo: SimboloInterface): VariavelInterface {
        const nomeNormalizado = simbolo.lexema.toLowerCase();
        for (let i = 1; i <= this.pilha.length; i++) {
            const espacoMemoria = this.pilha[this.pilha.length - i].espacoMemoria;
            if (espacoMemoria.valores[nomeNormalizado] !== undefined) {
                return espacoMemoria.valores[nomeNormalizado];
            }
        }

        throw new ErroEmTempoDeExecucao(simbolo, "Variável não definida: '" + simbolo.lexema + "'.");
    }

    obterVariavelPorNome(nome: string): VariavelInterface {
        const nomeNormalizado = nome.toLowerCase();
        for (let i = 1; i <= this.pilha.length; i++) {
            const espacoMemoria = this.pilha[this.pilha.length - i].espacoMemoria;
            if (espacoMemoria.valores[nomeNormalizado] !== undefined) {
                return espacoMemoria.valores[nomeNormalizado];
            }
        }

        throw new ErroEmTempoDeExecucao(
            new Simbolo('especial', nome, nome, -1, -1),
            "Variável não definida: '" + nome + "'."
        );
    }

    /**
     * Método usado pelo depurador para obter todas as variáveis definidas.
     */
    obterTodasVariaveis(todasVariaveis: VariavelInterface[] = []): any[] {
        for (let i = 1; i <= this.pilha.length - 1; i++) {
            const valoresAmbiente = this.pilha[this.pilha.length - i].espacoMemoria.valores;

            const vetorObjeto: VariavelInterface[] = Object.entries(valoresAmbiente).map((chaveEValor, indice) => ({
                nome: chaveEValor[0],
                valor: chaveEValor[1].valor,
                tipo: chaveEValor[1].tipo,
                imutavel: chaveEValor[1].imutavel,
            }));
            todasVariaveis = todasVariaveis.concat(vetorObjeto);
        }

        return todasVariaveis;
    }

    /**
     * Obtém todas as funções declaradas ou por código-fonte, ou pelo desenvolvedor
     * em console, do último escopo.
     */
    obterTodasDeleguaFuncao(): { [nome: string]: VisuAlgFuncao } {
        const retorno = {};
        const espacoMemoria = this.pilha[this.pilha.length - 1].espacoMemoria;
        for (const [nome, corpo] of Object.entries(espacoMemoria.valores)) {
            const corpoValor = corpo.hasOwnProperty('valor') ? corpo.valor : corpo;
            if (corpoValor instanceof VisuAlgFuncao) {
                retorno[nome] = corpoValor;
            }
        }

        return retorno;
    }

    /**
     * Obtém todas as declarações de classe do último escopo.
     * @returns
     */
    obterTodasDeclaracaoClasse(): any {
        const retorno = {};
        const espacoMemoria = this.pilha[this.pilha.length - 1].espacoMemoria;
        for (const [nome, corpo] of Object.entries(espacoMemoria.valores)) {
            const corpoValor = corpo.hasOwnProperty('valor') ? corpo.valor : corpo;
            if (corpoValor instanceof DescritorTipoClasse) {
                retorno[nome] = corpoValor;
            }
        }

        return retorno;
    }
}
