import { DeleguaFuncao, ObjetoDeleguaClasse } from '@designliquido/delegua/interpretador/estruturas';
import { ArgumentoInterface } from '@designliquido/delegua/interpretador/argumento-interface';
import { RetornoQuebra } from '@designliquido/delegua/quebras';
import { PilhaEscoposExecucaoInterface } from '@designliquido/delegua/interfaces/pilha-escopos-execucao-interface';
import { InterpretadorInterface } from '@designliquido/delegua/interfaces';

import { InterpretadorVisuAlgInterface } from '../../interfaces';
import { EspacoMemoria } from '@designliquido/delegua/interpretador/espaco-memoria';

/**
 * Diferentemente de `DeleguaFuncao`, a forma de VisuAlg de trabalhar com referências usa
 * como base o nome do parâmetro, e não o nome do argumento, como é em Delégua. Ademais, 
 * o mecanismo de resolução de ambiente é muito mais simples que o de Delégua.
 */
export class VisuAlgFuncao extends DeleguaFuncao {
    protected override async resolverAmbiente(_visitante: InterpretadorInterface, argumentos: Array<ArgumentoInterface>): Promise<EspacoMemoria> {
        const ambiente = new EspacoMemoria();
        const parametros = this.declaracao.parametros || [];

        for (let i = 0; i < parametros.length; i++) {
            const parametro = parametros[i];

            const nome = parametro['nome'].lexema;
            let argumento = argumentos[i];

            ambiente.valores[nome.toLowerCase()] =
                argumento && argumento.hasOwnProperty('valor') ? argumento.valor : argumento;
        }

        return ambiente;
    }

    override async chamar(
        visitante: InterpretadorVisuAlgInterface,
        argumentos: Array<ArgumentoInterface>
    ): Promise<any> {
        const ambiente = await this.resolverAmbiente(visitante, argumentos);

        if (this.instancia !== undefined) {
            ambiente.valores['isto'] = {
                valor: this.instancia,
                tipo: 'objeto',
                imutavel: false,
            };
        }

        visitante.proximoEscopo = 'funcao';
        const retornoBloco: any = await visitante.executarBloco(this.declaracao.corpo, ambiente);

        const referencias = this.declaracao.parametros
            .map((p, indice) => {
                if (p.referencia) {
                    return {
                        indice: indice,
                        parametro: p,
                    };
                }
            })
            .filter((r) => r);
        const pilha = visitante.pilhaEscoposExecucao as PilhaEscoposExecucaoInterface;

        for (let referencia of referencias) {
            let argumentoReferencia = ambiente.valores[referencia.parametro.nome.lexema];
            // TODO: Lógica implementada para o VisuAlg.
            pilha.atribuirVariavel(
                {
                    lexema: argumentos[referencia.indice].nome,
                } as any,
                argumentoReferencia.valor
            );
        }

        if (retornoBloco instanceof RetornoQuebra) {
            return retornoBloco.valor;
        }

        if (this.eInicializador) {
            return this.instancia;
        }

        return retornoBloco;
    }

    override funcaoPorMetodoDeClasse(instancia: ObjetoDeleguaClasse): VisuAlgFuncao {
        return new VisuAlgFuncao(this.nome, this.declaracao, instancia, this.eInicializador);
    }
}
