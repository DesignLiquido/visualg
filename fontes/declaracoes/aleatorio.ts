import { Bloco, Declaracao } from "@designliquido/delegua";

import { VisitanteVisuAlgInterface } from "../interfaces";

/**
 * No VisuAlg, `aleatorio` é uma espécie de bloco.
 */
export class Aleatorio extends Declaracao {
    corpo: Bloco;
    argumentos: { min: number; max: number } | null;

    constructor(
        linha: number,
        hashArquivo: number,
        corpo: Bloco,
        argumentos: { min: number; max: number } | null
    ) {
        super(linha, hashArquivo);

        this.corpo = corpo;
        this.argumentos = argumentos;
    }

    async aceitar(visitante: VisitanteVisuAlgInterface): Promise<any> {
        return await visitante.visitarDeclaracaoAleatorio(this);
    }

    paraTexto(): string {
        return `<aleatório />`;
    }
}
