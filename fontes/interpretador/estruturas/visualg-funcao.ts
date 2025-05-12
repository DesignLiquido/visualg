import { DeleguaFuncao, ObjetoDeleguaClasse } from "@designliquido/delegua/interpretador/estruturas";
import { ArgumentoInterface } from "@designliquido/delegua/interpretador/argumento-interface";
import { RetornoQuebra } from "@designliquido/delegua/quebras";
import { PilhaEscoposExecucaoInterface } from "@designliquido/delegua/interfaces/pilha-escopos-execucao-interface";

import { InterpretadorVisuAlgInterface } from "../../interfaces";

/**
 * Diferentemente de `DeleguaFuncao`, a forma de VisuAlg de trabalhar com referências usa
 * como base o nome do parâmetro, e não o nome do argumento, como é em Delégua.
 */
export class VisuAlgFuncao extends DeleguaFuncao {
    
    override async chamar(visitante: InterpretadorVisuAlgInterface, argumentos: Array<ArgumentoInterface>): Promise<any> {
        const ambiente = this.resolverAmbiente(argumentos);

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
                    
                    lexema: argumentos[referencia.indice].nome
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
