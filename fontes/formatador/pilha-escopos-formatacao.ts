import { Declaracao, PilhaInterface } from '@designliquido/delegua';

import { EscopoFormatacao } from './escopo-formatacao';

export class PilhaEscoposFormatacao implements PilhaInterface<EscopoFormatacao> {
    pilha: EscopoFormatacao[];

    constructor() {
        this.pilha = [];
    }

    empilhar(item: EscopoFormatacao): void {
        this.pilha.push(item);
    }

    empilharDeclaracoes(declaracoes: Declaracao[]) {
        const escopoFormatacao = {
            declaracoes: declaracoes,
            declaracaoAtual: 0,
        };

        this.empilhar(escopoFormatacao);
    }

    eVazio(): boolean {
        return this.pilha.length === 0;
    }

    topoDaPilha(): EscopoFormatacao {
        if (this.eVazio()) throw new Error('Pilha vazia.');
        return this.pilha[this.pilha.length - 1];
    }

    removerUltimo(): EscopoFormatacao {
        if (this.eVazio()) throw new Error('Pilha vazia.');
        return this.pilha.pop();
    }
}
