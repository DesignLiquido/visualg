import { ConstrutoInterface } from '@designliquido/delegua/interfaces';

import { VisitanteVisuAlgInterface } from '../interfaces';

export class LimpaTela implements ConstrutoInterface {
    linha: number;
    hashArquivo: number;

    constructor(hashArquivo: number, linha: number) {
        this.hashArquivo = hashArquivo;
        this.linha = linha;
    }

    async aceitar(visitante: VisitanteVisuAlgInterface): Promise<any> {
        return await visitante.visitarExpressaoLimpaTela(this);
    }

    paraTexto(): string {
        return `<limpa-tela />`;
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
